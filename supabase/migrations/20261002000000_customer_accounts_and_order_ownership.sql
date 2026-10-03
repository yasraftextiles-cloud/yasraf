-- =====================================================================
-- Migration: 20261002000000_customer_accounts_and_order_ownership.sql
-- YASRAF CLOTHING — CUSTOMER ACCOUNTS, ADDRESSES, CART PERSISTENCE & ORDER OWNERSHIP
-- =====================================================================

-- 0. Ensure extensions are available
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- =====================================================================
-- 1. CUSTOMER PROFILES TABLE
-- Keeps customer-editable profile data strictly separated from admin roles
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) > 0),
  phone TEXT CHECK (phone IS NULL OR char_length(trim(phone)) >= 7),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Customer Profile RLS Policies
DROP POLICY IF EXISTS "Customers can view own profile" ON public.customer_profiles;
CREATE POLICY "Customers can view own profile" ON public.customer_profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id OR public.is_admin());

DROP POLICY IF EXISTS "Customers can insert own profile" ON public.customer_profiles;
CREATE POLICY "Customers can insert own profile" ON public.customer_profiles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Customers can update own profile" ON public.customer_profiles;
CREATE POLICY "Customers can update own profile" ON public.customer_profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id OR public.is_admin())
  WITH CHECK ((select auth.uid()) = id OR public.is_admin());

-- Automatic profile creation trigger on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  INSERT INTO public.customer_profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = coalesce(EXCLUDED.full_name, public.customer_profiles.full_name),
    phone = coalesce(EXCLUDED.phone, public.customer_profiles.phone),
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_customer();

-- =====================================================================
-- 2. SAVED CUSTOMER DELIVERY ADDRESSES TABLE
-- Supports multiple delivery addresses with default selection
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home' CHECK (char_length(trim(label)) > 0),
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) > 0),
  phone TEXT NOT NULL CHECK (char_length(trim(phone)) >= 7),
  address_line1 TEXT NOT NULL CHECK (char_length(trim(address_line1)) > 0),
  address_line2 TEXT,
  city TEXT NOT NULL CHECK (char_length(trim(city)) > 0),
  province TEXT NOT NULL CHECK (char_length(trim(province)) > 0),
  postal_code TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON public.customer_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_default ON public.customer_addresses(user_id, is_default);

ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Customer Addresses RLS Policies
DROP POLICY IF EXISTS "Customers can view own addresses" ON public.customer_addresses;
CREATE POLICY "Customers can view own addresses" ON public.customer_addresses
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Customers can insert own addresses" ON public.customer_addresses;
CREATE POLICY "Customers can insert own addresses" ON public.customer_addresses
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Customers can update own addresses" ON public.customer_addresses;
CREATE POLICY "Customers can update own addresses" ON public.customer_addresses
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Customers can delete own addresses" ON public.customer_addresses;
CREATE POLICY "Customers can delete own addresses" ON public.customer_addresses
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- Enforce single default address per user
CREATE OR REPLACE FUNCTION public.handle_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.customer_addresses
    SET is_default = false, updated_at = timezone('utc'::text, now())
    WHERE user_id = NEW.user_id AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_customer_addresses_default ON public.customer_addresses;
CREATE TRIGGER trg_customer_addresses_default
  BEFORE INSERT OR UPDATE OF is_default ON public.customer_addresses
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.handle_default_address();

-- =====================================================================
-- 3. PERSISTENT CUSTOMER CART TABLES
-- Keeps customer cart isolated, synced across devices, and clearable on logout
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.customer_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customer_carts_user_id ON public.customer_carts(user_id);

ALTER TABLE public.customer_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own cart" ON public.customer_carts;
CREATE POLICY "Customers can view own cart" ON public.customer_carts
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Customers can insert own cart" ON public.customer_carts;
CREATE POLICY "Customers can insert own cart" ON public.customer_carts
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Customers can update own cart" ON public.customer_carts;
CREATE POLICY "Customers can update own cart" ON public.customer_carts
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Customers can delete own cart" ON public.customer_carts;
CREATE POLICY "Customers can delete own cart" ON public.customer_carts
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS public.customer_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.customer_carts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  size TEXT NOT NULL,
  color TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_customer_cart_item UNIQUE (cart_id, product_id, size, color)
);

CREATE INDEX IF NOT EXISTS idx_customer_cart_items_cart_id ON public.customer_cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_customer_cart_items_product_id ON public.customer_cart_items(product_id);

ALTER TABLE public.customer_cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own cart items" ON public.customer_cart_items;
CREATE POLICY "Customers can view own cart items" ON public.customer_cart_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customer_carts c
      WHERE c.id = customer_cart_items.cart_id AND c.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Customers can insert own cart items" ON public.customer_cart_items;
CREATE POLICY "Customers can insert own cart items" ON public.customer_cart_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customer_carts c
      WHERE c.id = customer_cart_items.cart_id AND c.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Customers can update own cart items" ON public.customer_cart_items;
CREATE POLICY "Customers can update own cart items" ON public.customer_cart_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customer_carts c
      WHERE c.id = customer_cart_items.cart_id AND c.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customer_carts c
      WHERE c.id = customer_cart_items.cart_id AND c.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Customers can delete own cart items" ON public.customer_cart_items;
CREATE POLICY "Customers can delete own cart items" ON public.customer_cart_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customer_carts c
      WHERE c.id = customer_cart_items.cart_id AND c.user_id = (select auth.uid())
    )
  );

-- Atomic Guest Cart Merge RPC Function
CREATE OR REPLACE FUNCTION public.merge_guest_cart_items(p_items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_cart_id UUID;
  v_item RECORD;
  v_prod_id TEXT;
  v_var_id UUID;
  v_size TEXT;
  v_color TEXT;
  v_qty INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to merge cart';
  END IF;

  -- Ensure customer cart exists
  INSERT INTO public.customer_carts (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
  RETURNING id INTO v_cart_id;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object('success', true, 'merged_count', 0);
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_prod_id := trim(v_item.value->>'productId');
    IF v_prod_id IS NULL OR v_prod_id = '' THEN
      v_prod_id := trim(v_item.value->>'id');
    END IF;
    
    v_var_id := nullif(trim(v_item.value->>'variantId'), '')::UUID;
    v_size := coalesce(nullif(trim(v_item.value->>'selectedSize'), ''), nullif(trim(v_item.value->>'size'), ''), 'M');
    v_color := coalesce(
      nullif(trim(v_item.value->'selectedColor'->>'name'), ''),
      nullif(trim(v_item.value->>'color'), ''),
      nullif(trim(v_item.value->>'selectedColor'), '')
    );
    v_qty := GREATEST(1, coalesce((v_item.value->>'quantity')::INT, 1));

    IF v_prod_id IS NOT NULL THEN
      INSERT INTO public.customer_cart_items (
        cart_id, product_id, variant_id, size, color, quantity, updated_at
      ) VALUES (
        v_cart_id, v_prod_id, v_var_id, v_size, v_color, v_qty, now()
      )
      ON CONFLICT (cart_id, product_id, size, color) DO UPDATE
      SET
        quantity = public.customer_cart_items.quantity + EXCLUDED.quantity,
        updated_at = now();
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'cart_id', v_cart_id);
END;
$$;

-- =====================================================================
-- 4. ORDER OWNERSHIP & ORDER ITEMS RESTRICTION
-- Adds verified user_id link to orders and strict parent-based RLS
-- =====================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Update RLS policies on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
CREATE POLICY "Admins can view orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Update RLS policies on order_items (restricted strictly via parent order ownership)
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own order items" ON public.order_items;
CREATE POLICY "Customers can view own order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.order_id = order_items.order_id
        AND ((select auth.uid()) = o.user_id OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins can view order items" ON public.order_items;
CREATE POLICY "Admins can view order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- =====================================================================
-- 5. UPDATED ATOMIC CHECKOUT RPC FUNCTION (Links verified user_id)
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
  v_user_id UUID;
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
  v_cart_id UUID;
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

  -- 4. Verified User ID Extraction
  -- If payload->>'user_id' is present (passed by verified backend handler), use it;
  -- otherwise fallback to auth.uid() if directly called by authenticated user.
  v_user_id := nullif(trim(payload->>'user_id'), '')::UUID;
  IF v_user_id IS NULL THEN
    v_user_id := auth.uid();
  END IF;

  -- 5. Load & Enforce Store Settings
  SELECT value INTO v_shipping_config FROM public.store_settings WHERE key = 'shipping_config';
  SELECT value INTO v_payment_config FROM public.store_settings WHERE key = 'payment_config';
  
  v_std_shipping := coalesce((v_shipping_config->>'standard_fee')::NUMERIC, 250);
  v_free_thresh := coalesce((v_shipping_config->>'free_shipping_threshold')::NUMERIC, 4990);
  v_allowed_provinces := coalesce(v_shipping_config->'supported_provinces', '[]'::jsonb);
  v_est_delivery := coalesce(v_shipping_config->>'delivery_timeline', '2 - 4 Working Days (via TCS / Leopards Express)');
  v_allowed_methods := coalesce(v_payment_config->'enabled_methods', '["cod"]'::jsonb);

  -- 6. Customer Validation
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

  -- Province validation: must be an explicitly supported region
  IF NOT (v_allowed_provinces @> to_jsonb(trim(v_customer->>'province'))) THEN
    RAISE EXCEPTION 'Selected province "%" is not in supported delivery territories', trim(v_customer->>'province');
  END IF;

  -- Payment method validation: confirmed COD only
  IF NOT (v_allowed_methods @> to_jsonb(coalesce(payload->>'paymentMethod', 'cod'))) THEN
    RAISE EXCEPTION 'Payment method "%" is not active. Currently accepted: Cash on Delivery (COD)', coalesce(payload->>'paymentMethod', '');
  END IF;

  -- 7. Cart Items Validation: Aggregate Duplicate Variants & Order by variant_id ASC (Deadlock Prevention)
  v_items := payload->'items';
  IF v_items IS NULL OR jsonb_array_length(v_items) = 0 THEN
    RAISE EXCEPTION 'Cart cannot be empty';
  END IF;

  CREATE TEMP TABLE temp_cart_items (
    variant_id UUID NOT NULL,
    quantity INT NOT NULL,
    product_id TEXT,
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

  IF EXISTS (SELECT 1 FROM temp_cart_items WHERE quantity <= 0) THEN
    RAISE EXCEPTION 'All item quantities must be positive integers';
  END IF;

  -- 8. Lock variants in consistent order (variant_id ASC) and validate stock/price
  FOR v_agg IN SELECT * FROM temp_cart_items ORDER BY variant_id ASC
  LOOP
    SELECT 
      pv.id, pv.product_id, pv.sku, pv.size, pv.color, pv.price, pv.stock,
      p.title, p.is_published, coalesce(p.images->>0, '') AS image
    INTO v_var
    FROM public.product_variants pv
    JOIN public.products p ON p.id = pv.product_id
    WHERE pv.id = v_agg.variant_id
    FOR UPDATE OF pv;

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
        title = v_var.title,
        size = v_var.size,
        color = v_var.color,
        unit_price = v_var.price,
        line_total = v_line_total,
        image = v_var.image
    WHERE variant_id = v_agg.variant_id;
  END LOOP;

  -- 9. Calculate Shipping & Total
  IF v_subtotal >= v_free_thresh THEN
    v_shipping_fee := 0;
  ELSE
    v_shipping_fee := v_std_shipping;
  END IF;
  v_total := v_subtotal + v_shipping_fee;

  -- 10. Generate Cryptographically Random Tracking Token & Order ID
  v_order_id := 'YAS-' || to_char(now(), 'YYMM') || '-' || lpad((floor(random() * 900000 + 100000))::text, 6, '0');
  v_raw_token := encode(extensions.gen_random_bytes(24), 'hex');
  v_token_hash := encode(extensions.digest(v_raw_token, 'sha256'), 'hex');

  -- 11. INSERT PARENT ORDER (Includes verified user_id)
  INSERT INTO public.orders (
    order_id,
    user_id,
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
    v_user_id,
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

  -- 12. INSERT ORDER ITEMS SECOND
  INSERT INTO public.order_items (
    order_id,
    product_id,
    variant_id,
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
    title,
    size,
    color,
    quantity,
    unit_price,
    unit_price,
    line_total,
    image
  FROM temp_cart_items;

  -- 13. Clear Customer Cart Items upon successful order creation if user_id is present
  IF v_user_id IS NOT NULL THEN
    SELECT id INTO v_cart_id FROM public.customer_carts WHERE user_id = v_user_id;
    IF v_cart_id IS NOT NULL THEN
      DELETE FROM public.customer_cart_items WHERE cart_id = v_cart_id;
    END IF;
  END IF;

  -- 14. Finalize Response and Idempotency Record
  v_response := jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'tracking_token', v_raw_token,
    'subtotal', v_subtotal,
    'shipping_fee', v_shipping_fee,
    'total', v_total,
    'currency', 'PKR',
    'status', 'Order Received',
    'estimated_delivery', v_est_delivery,
    'user_id', v_user_id
  );

  UPDATE public.idempotency_records
  SET status = 'completed',
      order_id = v_order_id,
      response = v_response,
      updated_at = now()
  WHERE key = v_idempotency_key;

  RETURN v_response;

EXCEPTION WHEN OTHERS THEN
  IF v_idempotency_key IS NOT NULL THEN
    UPDATE public.idempotency_records 
    SET status = 'failed', updated_at = now() 
    WHERE key = v_idempotency_key AND status = 'processing';
  END IF;
  RAISE;
END;
$$;

-- =====================================================================
-- 6. EXPLICIT LEAST-PRIVILEGE GRANTS
-- =====================================================================
GRANT SELECT, INSERT, UPDATE ON public.customer_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_addresses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_carts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_cart_items TO authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;

GRANT EXECUTE ON FUNCTION public.merge_guest_cart_items(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_checkout(jsonb) TO service_role;
