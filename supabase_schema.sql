-- =====================================================================
-- Migration: 20261001000000_secure_ecommerce_schema.sql
-- YASRAF CLOTHING — HARDENED PRODUCTION DATABASE SCHEMA & RPC FUNCTIONS
-- =====================================================================

-- 0. Ensure pgcrypto extension is installed in extensions (or public)
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- =====================================================================
-- 1. CLEANUP UNSAFE LEGACY POLICIES & OBSOLETE PERMISSIONS
-- =====================================================================
DO $$
BEGIN
  -- Drop legacy public policies if previously applied
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Public products are viewable by everyone') THEN
    DROP POLICY "Public products are viewable by everyone" ON public.products;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Public can view published products') THEN
    DROP POLICY "Public can view published products" ON public.products;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Public can insert orders') THEN
    DROP POLICY "Public can insert orders" ON public.orders;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Public can track order by order_id') THEN
    DROP POLICY "Public can track order by order_id" ON public.orders;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Public can insert order items') THEN
    DROP POLICY "Public can insert order items" ON public.order_items;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Public can view order items') THEN
    DROP POLICY "Public can view order items" ON public.order_items;
  END IF;
END $$;

-- =====================================================================
-- 2. STORE CONFIGURATION & SETTINGS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Seed default confirmed store rules:
-- Rs. 250 standard, free over Rs. 4,990; COD only; all 7 Pakistan territories; 2-4 working days
INSERT INTO public.store_settings (key, value, description)
VALUES 
  ('shipping_config', '{
    "standard_fee": 250,
    "free_shipping_threshold": 4990,
    "supported_provinces": [
      "Punjab",
      "Sindh",
      "Khyber Pakhtunkhwa",
      "Balochistan",
      "Islamabad Capital Territory",
      "Azad Jammu & Kashmir",
      "Gilgit-Baltistan"
    ],
    "delivery_timeline": "2 - 4 Working Days (via TCS / Leopards Express)"
  }'::jsonb, 'Store shipping fees, thresholds, and allowed delivery territories'),
  ('payment_config', '{
    "enabled_methods": ["cod"],
    "cod_active": true,
    "card_active": false
  }'::jsonb, 'Enabled customer payment gateways')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = now();

-- =====================================================================
-- 3. ADMIN ROLES TABLE & HELPER
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) OR (
    coalesce(auth.jwt()->'app_metadata'->>'role', '') = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- =====================================================================
-- 4. PRODUCTS TABLE (Strict catalog validation, no fake 5-star defaults)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  category TEXT NOT NULL,
  category_label TEXT,
  type TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  original_price NUMERIC CHECK (original_price IS NULL OR original_price >= 0),
  rating NUMERIC CHECK (rating IS NULL OR (rating >= 1.0 AND rating <= 5.0)),
  reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  badge TEXT,
  fabric TEXT,
  color TEXT,
  occasion TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT true,
  show_in_new_arrivals BOOLEAN NOT NULL DEFAULT false,
  show_in_signature_edit BOOLEAN NOT NULL DEFAULT false,
  sizes JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  details JSONB DEFAULT '[]'::jsonb,
  care JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ALTER COLUMN rating DROP DEFAULT;
ALTER TABLE public.products ALTER COLUMN reviews_count SET DEFAULT 0;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='is_published') THEN
    ALTER TABLE public.products ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='show_in_new_arrivals') THEN
    ALTER TABLE public.products ADD COLUMN show_in_new_arrivals BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='show_in_signature_edit') THEN
    ALTER TABLE public.products ADD COLUMN show_in_signature_edit BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='updated_at') THEN
    ALTER TABLE public.products ADD COLUMN updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;
  END IF;
END $$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published products" ON public.products
  FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.is_admin());

-- =====================================================================
-- 5. PRODUCT VARIANTS TABLE (Unique SKU, size, color, stock)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  size TEXT NOT NULL,
  color TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_product_variant UNIQUE (product_id, size, color)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view variants of published products" ON public.product_variants;
CREATE POLICY "Public can view variants of published products" ON public.product_variants
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.products p 
    WHERE p.id = product_variants.product_id AND (p.is_published = true OR public.is_admin())
  ));

DROP POLICY IF EXISTS "Admins can modify variants" ON public.product_variants;
CREATE POLICY "Admins can modify variants" ON public.product_variants
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================================
-- 6. IDEMPOTENCY RECORDS TABLE (High-Entropy Key Binding & Concurrency Safe)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.idempotency_records (
  key TEXT PRIMARY KEY,
  payload_hash TEXT NOT NULL,
  order_id TEXT,
  response JSONB,
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.idempotency_records ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 7. ORDERS TABLE (Strict constraints, hashed token, idempotency)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  payload_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Order Received' CHECK (status IN ('Order Received', 'Artisan Inspection', 'Dispatched', 'Delivered', 'Cancelled')),
  current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 4),
  customer_name TEXT NOT NULL CHECK (char_length(trim(customer_name)) > 0),
  customer_email TEXT,
  customer_phone TEXT NOT NULL CHECK (char_length(trim(customer_phone)) > 0),
  shipping_address TEXT NOT NULL CHECK (char_length(trim(shipping_address)) > 0),
  city TEXT NOT NULL CHECK (char_length(trim(city)) > 0),
  province TEXT NOT NULL CHECK (char_length(trim(province)) > 0),
  postal_code TEXT,
  notes TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'card', 'wallet')),
  currency TEXT NOT NULL DEFAULT 'PKR',
  subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
  shipping_fee NUMERIC NOT NULL CHECK (shipping_fee >= 0),
  total NUMERIC NOT NULL CHECK (total >= 0),
  tracking_token_hash TEXT NOT NULL,
  courier_tracking TEXT,
  estimated_delivery TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Upgrade existing table if needed without dropping data
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='idempotency_key') THEN
    ALTER TABLE public.orders ADD COLUMN idempotency_key TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='payload_hash') THEN
    ALTER TABLE public.orders ADD COLUMN payload_hash TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='subtotal') THEN
    ALTER TABLE public.orders ADD COLUMN subtotal NUMERIC NOT NULL DEFAULT 0 CHECK (subtotal >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='shipping_fee') THEN
    ALTER TABLE public.orders ADD COLUMN shipping_fee NUMERIC NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='tracking_token_hash') THEN
    ALTER TABLE public.orders ADD COLUMN tracking_token_hash TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON public.orders(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_token_hash ON public.orders(tracking_token_hash);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
CREATE POLICY "Admins can view orders" ON public.orders
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================================
-- 8. ORDER ITEMS TABLE (Migration compatibility with legacy price column)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  sku TEXT,
  title TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC, -- Legacy column kept for backward compatibility
  unit_price NUMERIC CHECK (unit_price >= 0),
  line_total NUMERIC CHECK (line_total >= 0),
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Backward compatibility: handle legacy columns & backfill historical data
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='order_items' AND column_name='sku') THEN
    ALTER TABLE public.order_items ADD COLUMN sku TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='order_items' AND column_name='color') THEN
    ALTER TABLE public.order_items ADD COLUMN color TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='order_items' AND column_name='variant_id') THEN
    ALTER TABLE public.order_items ADD COLUMN variant_id UUID REFERENCES public.product_variants(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='order_items' AND column_name='unit_price') THEN
    ALTER TABLE public.order_items ADD COLUMN unit_price NUMERIC;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='order_items' AND column_name='line_total') THEN
    ALTER TABLE public.order_items ADD COLUMN line_total NUMERIC;
  END IF;

  -- Backfill legacy records if unit_price / line_total are null
  UPDATE public.order_items SET unit_price = price WHERE unit_price IS NULL AND price IS NOT NULL;
  UPDATE public.order_items SET line_total = price * quantity WHERE line_total IS NULL AND price IS NOT NULL;
  UPDATE public.order_items SET price = unit_price WHERE price IS NULL AND unit_price IS NOT NULL;

  -- Ensure legacy price column doesn't block future inserts
  ALTER TABLE public.order_items ALTER COLUMN price DROP NOT NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view order items" ON public.order_items;
CREATE POLICY "Admins can view order items" ON public.order_items
  FOR SELECT TO authenticated USING (public.is_admin());

-- =====================================================================
-- 9. AUDIT & RATE LIMITING TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.audit_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  identifier TEXT NOT NULL,
  success BOOLEAN DEFAULT false,
  attempted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_rate_limits ON public.audit_rate_limits(action, identifier, attempted_at);
ALTER TABLE public.audit_rate_limits ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 10. ATOMIC SECURE CHECKOUT RPC FUNCTION
-- =====================================================================
CREATE OR REPLACE FUNCTION public.create_order_checkout(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog, pg_temp
AS $$
DECLARE
  v_idempotency_key TEXT;
  v_payload_hash TEXT;
  v_customer JSONB;
  v_items JSONB;
  v_client_ip TEXT;
  
  v_shipping_config JSONB;
  v_payment_config JSONB;
  v_std_shipping NUMERIC;
  v_free_thresh NUMERIC;
  v_allowed_provinces JSONB;
  v_allowed_methods JSONB;
  v_est_delivery TEXT;
  
  v_subtotal NUMERIC := 0;
  v_shipping_fee NUMERIC := 0;
  v_total NUMERIC := 0;
  
  v_order_id TEXT;
  v_raw_token TEXT;
  v_token_hash TEXT;
  v_response JSONB;
  
  v_idemp_rec RECORD;
  v_var RECORD;
  v_agg RECORD;
  v_line_total NUMERIC;
BEGIN
  -- 1. Validate High-Entropy Idempotency Key (minimum 32 chars)
  v_idempotency_key := trim(payload->>'idempotency_key');
  IF v_idempotency_key IS NULL OR char_length(v_idempotency_key) < 32 THEN
    RAISE EXCEPTION 'High-entropy idempotency_key (minimum 32 characters) is required';
  END IF;

  -- 2. Compute Payload Hash (excluding idempotency_key itself)
  v_payload_hash := encode(extensions.digest((payload - 'idempotency_key')::text, 'sha256'), 'hex');

  -- 3. Idempotency Check with Concurrency Lock
  SELECT * INTO v_idemp_rec
  FROM public.idempotency_records
  WHERE key = v_idempotency_key
  FOR UPDATE;

  IF FOUND THEN
    IF v_idemp_rec.payload_hash <> v_payload_hash THEN
      RAISE EXCEPTION 'Idempotency key reuse with different request payload is forbidden';
    END IF;
    IF v_idemp_rec.status = 'processing' THEN
      RAISE EXCEPTION 'A request with this idempotency key is currently processing. Please retry shortly.';
    END IF;
    IF v_idemp_rec.status = 'completed' THEN
      RETURN v_idemp_rec.response;
    END IF;
  ELSE
    INSERT INTO public.idempotency_records (key, payload_hash, status)
    VALUES (v_idempotency_key, v_payload_hash, 'processing');
  END IF;

  -- 4. Load & Enforce Store Settings (Requirement 9)
  SELECT value INTO v_shipping_config FROM public.store_settings WHERE key = 'shipping_config';
  SELECT value INTO v_payment_config FROM public.store_settings WHERE key = 'payment_config';
  
  v_std_shipping := coalesce((v_shipping_config->>'standard_fee')::NUMERIC, 250);
  v_free_thresh := coalesce((v_shipping_config->>'free_shipping_threshold')::NUMERIC, 4990);
  v_allowed_provinces := coalesce(v_shipping_config->'supported_provinces', '[]'::jsonb);
  v_est_delivery := coalesce(v_shipping_config->>'delivery_timeline', '2 - 4 Working Days (via TCS / Leopards Express)');
  v_allowed_methods := coalesce(v_payment_config->'enabled_methods', '["cod"]'::jsonb);

  -- 5. Customer Validation
  v_customer := payload->'customer';
  IF v_customer IS NULL THEN
    RAISE EXCEPTION 'Customer details are required';
  END IF;

  IF coalesce(trim(v_customer->>'fullName'), '') = '' THEN
    RAISE EXCEPTION 'Full customer name is required';
  END IF;
  IF coalesce(trim(v_customer->>'phone'), '') = '' THEN
    RAISE EXCEPTION 'Contact phone number is required';
  END IF;
  IF coalesce(trim(v_customer->>'address'), '') = '' THEN
    RAISE EXCEPTION 'Shipping street address is required';
  END IF;
  IF coalesce(trim(v_customer->>'city'), '') = '' THEN
    RAISE EXCEPTION 'Destination city is required';
  END IF;

  -- Province validation: must be an explicitly supported region (no silent assumptions)
  IF NOT (v_allowed_provinces @> to_jsonb(trim(v_customer->>'province'))) THEN
    RAISE EXCEPTION 'Selected province "%" is not in supported delivery territories', trim(v_customer->>'province');
  END IF;

  -- Payment method validation: confirmed COD only
  IF NOT (v_allowed_methods @> to_jsonb(coalesce(payload->>'paymentMethod', 'cod'))) THEN
    RAISE EXCEPTION 'Payment method "%" is not active. Currently accepted: Cash on Delivery (COD)', coalesce(payload->>'paymentMethod', '');
  END IF;

  -- 6. Cart Items Validation: Aggregate Duplicate Variants & Order by variant_id ASC (Deadlock Prevention)
  v_items := payload->'items';
  IF v_items IS NULL OR jsonb_array_length(v_items) = 0 THEN
    RAISE EXCEPTION 'Cart cannot be empty';
  END IF;

  -- Aggregate duplicate variants into a temporary calculation table
  CREATE TEMP TABLE temp_cart_items (
    variant_id UUID NOT NULL,
    quantity INT NOT NULL,
    product_id TEXT,
    sku TEXT,
    title TEXT,
    size TEXT,
    color TEXT,
    unit_price NUMERIC,
    line_total NUMERIC,
    image TEXT
  ) ON COMMIT DROP;

  INSERT INTO temp_cart_items (variant_id, quantity)
  SELECT 
    (it->>'variantId')::UUID,
    SUM((it->>'quantity')::INT)
  FROM jsonb_array_elements(v_items) it
  GROUP BY (it->>'variantId')::UUID;

  -- Validate positive integer quantities
  IF EXISTS (SELECT 1 FROM temp_cart_items WHERE quantity <= 0) THEN
    RAISE EXCEPTION 'All item quantities must be positive integers';
  END IF;

  -- 7. Lock variants in consistent order (variant_id ASC) and validate stock/price
  FOR v_agg IN SELECT * FROM temp_cart_items ORDER BY variant_id ASC
  LOOP
    SELECT 
      pv.id, pv.product_id, pv.sku, pv.size, pv.color, pv.price, pv.stock,
      p.title, p.sku AS product_sku, p.is_published, coalesce(p.images->>0, '') AS image
    INTO v_var
    FROM public.product_variants pv
    JOIN public.products p ON p.id = pv.product_id
    WHERE pv.id = v_agg.variant_id
    FOR UPDATE OF pv;

    -- Strict variant validation: NO fallback allowed
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product variant "%" was not found in catalog', v_agg.variant_id;
    END IF;

    IF v_var.is_published = false THEN
      RAISE EXCEPTION 'Product variant "%" belongs to an unpublished product', v_agg.variant_id;
    END IF;

    IF v_var.stock < v_agg.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for % (Size: %). Only % available, requested %', 
        v_var.title, v_var.size, v_var.stock, v_agg.quantity;
    END IF;

    -- Decrement stock inside the atomic transaction
    UPDATE public.product_variants
    SET stock = stock - v_agg.quantity, updated_at = now()
    WHERE id = v_var.id;

    -- Calculate trusted price from database
    v_line_total := v_var.price * v_agg.quantity;
    v_subtotal := v_subtotal + v_line_total;

    -- Update calculation table
    UPDATE temp_cart_items
    SET product_id = v_var.product_id,
        sku = coalesce(v_var.sku, v_var.product_sku),
        title = v_var.title,
        size = v_var.size,
        color = v_var.color,
        unit_price = v_var.price,
        line_total = v_line_total,
        image = v_var.image
    WHERE variant_id = v_agg.variant_id;
  END LOOP;

  -- 8. Calculate Shipping & Total
  IF v_subtotal >= v_free_thresh THEN
    v_shipping_fee := 0;
  ELSE
    v_shipping_fee := v_std_shipping;
  END IF;
  v_total := v_subtotal + v_shipping_fee;

  -- 9. Generate Cryptographically Random Tracking Token & Order ID
  v_order_id := 'YAS-' || to_char(now(), 'YYMM') || '-' || lpad((floor(random() * 900000 + 100000))::text, 6, '0');
  v_raw_token := encode(extensions.gen_random_bytes(24), 'hex');
  v_token_hash := encode(extensions.digest(v_raw_token, 'sha256'), 'hex');

  -- 10. INSERT PARENT ORDER FIRST (Requirement 1: fixes foreign key ordering!)
  INSERT INTO public.orders (
    order_id,
    idempotency_key,
    payload_hash,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    city,
    province,
    postal_code,
    notes,
    payment_method,
    currency,
    subtotal,
    shipping_fee,
    total,
    tracking_token_hash,
    status,
    current_step,
    estimated_delivery
  ) VALUES (
    v_order_id,
    v_idempotency_key,
    v_payload_hash,
    trim(v_customer->>'fullName'),
    trim(v_customer->>'email'),
    trim(v_customer->>'phone'),
    trim(v_customer->>'address'),
    trim(v_customer->>'city'),
    trim(v_customer->>'province'),
    trim(v_customer->>'postalCode'),
    trim(v_customer->>'notes'),
    'cod',
    'PKR',
    v_subtotal,
    v_shipping_fee,
    v_total,
    v_token_hash,
    'Order Received',
    1,
    v_est_delivery
  );

  -- 11. INSERT ORDER ITEMS SECOND (Parent order now reliably exists!)
  INSERT INTO public.order_items (
    order_id,
    product_id,
    variant_id,
    sku,
    title,
    size,
    color,
    quantity,
    price,
    unit_price,
    line_total,
    image
  )
  SELECT 
    v_order_id,
    product_id,
    variant_id,
    sku,
    title,
    size,
    color,
    quantity,
    unit_price,
    unit_price,
    line_total,
    image
  FROM temp_cart_items;

  -- 12. Finalize Response and Idempotency Record
  v_response := jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'tracking_token', v_raw_token,
    'subtotal', v_subtotal,
    'shipping_fee', v_shipping_fee,
    'total', v_total,
    'currency', 'PKR',
    'status', 'Order Received',
    'estimated_delivery', v_est_delivery
  );

  UPDATE public.idempotency_records
  SET status = 'completed',
      order_id = v_order_id,
      response = v_response,
      updated_at = now()
  WHERE key = v_idempotency_key;

  RETURN v_response;

EXCEPTION WHEN OTHERS THEN
  -- Mark idempotency record as failed so client retries are not permanently locked in 'processing'
  IF v_idempotency_key IS NOT NULL THEN
    UPDATE public.idempotency_records 
    SET status = 'failed', updated_at = now() 
    WHERE key = v_idempotency_key AND status = 'processing';
  END IF;
  RAISE;
END;
$$;

-- =====================================================================
-- 11. SECURE ORDER TRACKING RPC FUNCTION (Token Only, Minimal Shipment Data)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.track_order_secure(
  p_order_id text,
  p_tracking_token text,
  p_client_ip text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog, pg_temp
AS $$
DECLARE
  v_clean_order_id TEXT;
  v_token_hash TEXT;
  v_order RECORD;
  v_items JSONB;
BEGIN
  v_clean_order_id := upper(trim(p_order_id));

  -- 1. Require High-Entropy Cryptographic Token (No phone fallback!)
  IF p_tracking_token IS NULL OR char_length(trim(p_tracking_token)) < 32 THEN
    RAISE EXCEPTION 'A valid cryptographic tracking token is required';
  END IF;

  v_token_hash := encode(extensions.digest(trim(p_tracking_token), 'sha256'), 'hex');

  -- 2. Query Order with Strict Token Hash Match
  SELECT order_id, status, current_step, courier_tracking, city, province, estimated_delivery, created_at
  INTO v_order
  FROM public.orders
  WHERE order_id = v_clean_order_id
    AND tracking_token_hash = v_token_hash;

  IF NOT FOUND THEN
    -- Log failed attempt for security audit
    INSERT INTO public.audit_rate_limits (action, identifier, success)
    VALUES ('track_order_failed', coalesce(p_client_ip, v_clean_order_id), false);

    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found or tracking token invalid.'
    );
  END IF;

  -- 3. Return MINIMAL Sanitized Shipment Details (No full street address, no financial details)
  SELECT jsonb_agg(jsonb_build_object(
    'title', oi.title,
    'sku', oi.sku,
    'size', oi.size,
    'color', oi.color,
    'quantity', oi.quantity,
    'image', oi.image
  )) INTO v_items
  FROM public.order_items oi
  WHERE oi.order_id = v_order.order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order.order_id,
    'status', v_order.status,
    'current_step', v_order.current_step,
    'courier_tracking', coalesce(v_order.courier_tracking, 'Awaiting courier dispatch'),
    'destination_city', v_order.city,
    'destination_province', v_order.province,
    'estimated_delivery', v_order.estimated_delivery,
    'date_placed', to_char(v_order.created_at, 'DD Mon YYYY'),
    'items', coalesce(v_items, '[]'::jsonb)
  );
END;
$$;

-- =====================================================================
-- 12. EXPLICIT LEAST-PRIVILEGE GRANTS & REVOCATIONS
-- =====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public catalog reads only for published products & variants
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT SELECT ON public.store_settings TO anon, authenticated;

-- Strictly REVOKE all direct table access on private tables
REVOKE ALL ON public.orders FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.order_items FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.idempotency_records FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.user_roles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.audit_rate_limits FROM PUBLIC, anon, authenticated;

-- Authenticated admins can query via RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- PRIVILEGE HARDENING (Requirement 8):
-- Revoke PUBLIC execution on checkout and tracking RPCs.
-- Anonymous callers CANNOT call these RPCs directly through Supabase Data API!
-- They must be invoked exclusively through authenticated backend endpoints.
REVOKE ALL ON FUNCTION public.create_order_checkout(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.track_order_secure(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_order_checkout(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.track_order_secure(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
