-- =====================================================================
-- Migration: 20261117000000_order_management_system.sql
-- YASRAF ATELIER — COMPREHENSIVE ORDER MANAGEMENT & NOTIFICATIONS SYSTEM
-- =====================================================================

-- 0. Ensure extensions are available
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- =====================================================================
-- 1. SHORT ORDER NUMBER SEQUENCE & GENERATOR
-- Format: YAS-YYYY-0001, YAS-YYYY-0002, etc.
-- =====================================================================
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_year TEXT;
  v_seq_val BIGINT;
BEGIN
  v_year := to_char(CURRENT_DATE, 'YYYY');
  v_seq_val := nextval('public.order_number_seq');
  RETURN 'YAS-' || v_year || '-' || lpad(v_seq_val::text, 4, '0');
END;
$$;

-- Add order_number column to orders table if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN order_number TEXT UNIQUE;
  END IF;
END $$;

-- Backfill any existing orders safely with sequential YAS-YYYY-XXXX order numbers
DO $$
DECLARE
  r RECORD;
  v_counter INT := 0;
  v_year TEXT;
BEGIN
  FOR r IN 
    SELECT id, created_at 
    FROM public.orders 
    WHERE order_number IS NULL 
    ORDER BY created_at ASC 
  LOOP
    v_counter := v_counter + 1;
    v_year := coalesce(to_char(r.created_at, 'YYYY'), to_char(CURRENT_DATE, 'YYYY'));
    UPDATE public.orders
    SET order_number = 'YAS-' || v_year || '-' || lpad(v_counter::text, 4, '0')
    WHERE id = r.id;
  END LOOP;

  -- Ensure sequence counter starts above backfilled orders
  IF v_counter > 0 THEN
    PERFORM setval('public.order_number_seq', v_counter);
  END IF;
END $$;

-- Set default for future inserts
ALTER TABLE public.orders ALTER COLUMN order_number SET DEFAULT public.generate_order_number();

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- =====================================================================
-- 2. ORDER STATUS EXPANSION & STEP VALIDATION
-- Statuses: Order Received, Confirmed, Processing, Packed, Shipped,
--           Out for Delivery, Delivered, Cancelled, Returned
-- Backward-compatible with: Artisan Inspection, Dispatched
-- =====================================================================
DO $$
DECLARE
  v_con_name TEXT;
BEGIN
  -- Drop existing status check constraints on orders
  FOR v_con_name IN (
    SELECT conname FROM pg_constraint 
    WHERE conrelid = 'public.orders'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%status%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT ' || quote_ident(v_con_name);
  END LOOP;

  -- Drop existing current_step check constraints on orders
  FOR v_con_name IN (
    SELECT conname FROM pg_constraint 
    WHERE conrelid = 'public.orders'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%current_step%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT ' || quote_ident(v_con_name);
  END LOOP;
END $$;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'Order Received', 
    'Confirmed', 
    'Processing', 
    'Packed', 
    'Shipped', 
    'Out for Delivery', 
    'Delivered', 
    'Cancelled', 
    'Returned',
    'Artisan Inspection', 
    'Dispatched'
  )
);

ALTER TABLE public.orders ADD CONSTRAINT orders_current_step_check CHECK (
  current_step BETWEEN 1 AND 10
);

-- =====================================================================
-- 3. SOFT DELETE / ARCHIVE SUPPORT
-- =====================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'archived_at'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN archived_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'archived_by'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN archived_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_is_archived ON public.orders(is_archived);

-- =====================================================================
-- 4. ORDER STATUS AUDIT & HISTORY TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON public.order_status_history(created_at DESC);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view status history" ON public.order_status_history;
CREATE POLICY "Admins can view status history" ON public.order_status_history
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert status history" ON public.order_status_history;
CREATE POLICY "Admins can insert status history" ON public.order_status_history
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Customers can view status history for their own orders
DROP POLICY IF EXISTS "Customers can view status history for own orders" ON public.order_status_history;
CREATE POLICY "Customers can view status history for own orders" ON public.order_status_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.order_id = order_status_history.order_id
        AND o.user_id = (select auth.uid())
    )
  );

-- =====================================================================
-- 5. ADMIN NOTIFICATIONS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES public.orders(order_id) ON DELETE CASCADE,
  order_number TEXT,
  type TEXT NOT NULL DEFAULT 'new_order',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  customer_name TEXT,
  total_amount NUMERIC,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications(is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view notifications" ON public.admin_notifications;
CREATE POLICY "Admins can view notifications" ON public.admin_notifications
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update notifications" ON public.admin_notifications;
CREATE POLICY "Admins can update notifications" ON public.admin_notifications
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete notifications" ON public.admin_notifications;
CREATE POLICY "Admins can delete notifications" ON public.admin_notifications
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert notifications" ON public.admin_notifications;
CREATE POLICY "Admins can insert notifications" ON public.admin_notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- =====================================================================
-- 6. AUTOMATIC DATABASE TRIGGERS
-- =====================================================================

-- Trigger A: Create admin notification automatically when new order is inserted
CREATE OR REPLACE FUNCTION public.handle_new_order_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_num TEXT;
BEGIN
  v_num := coalesce(NEW.order_number, NEW.order_id);
  INSERT INTO public.admin_notifications (
    order_id,
    order_number,
    type,
    title,
    message,
    customer_name,
    total_amount,
    created_at
  ) VALUES (
    NEW.order_id,
    v_num,
    'new_order',
    'New Order Received',
    'Order #' || v_num || ' placed by ' || NEW.customer_name || ' for Rs. ' || to_char(coalesce(NEW.total, 0), 'FM999,999,999'),
    NEW.customer_name,
    NEW.total,
    coalesce(NEW.created_at, now())
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_order_notification ON public.orders;
CREATE TRIGGER trg_new_order_notification
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_order_notification();

-- Trigger B: Automatically record status change in order_status_history
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
    INSERT INTO public.order_status_history (
      order_id,
      previous_status,
      new_status,
      changed_by_user_id,
      changed_by_email,
      created_at
    ) VALUES (
      NEW.order_id,
      OLD.status,
      NEW.status,
      auth.uid(),
      v_user_email,
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_status_change ON public.orders;
CREATE TRIGGER trg_order_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_status_change();

-- =====================================================================
-- 7. ADMIN ORDER DELETION POLICY (Test / Duplicate cleanup)
-- =====================================================================
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete order items" ON public.order_items;
CREATE POLICY "Admins can delete order items" ON public.order_items
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =====================================================================
-- 8. UPDATE ATOMIC SECURE CHECKOUT RPC FUNCTION (Returns order_number)
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
  v_user_id UUID;
  
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
  v_order_num TEXT;
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

  -- 4. Load & Enforce Store Settings
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

  -- Province validation: must be an explicitly supported region
  IF NOT (v_allowed_provinces @> to_jsonb(trim(v_customer->>'province'))) THEN
    RAISE EXCEPTION 'Selected province "%" is not in supported delivery territories', trim(v_customer->>'province');
  END IF;

  -- Payment method validation: confirmed COD only
  IF NOT (v_allowed_methods @> to_jsonb(coalesce(payload->>'paymentMethod', 'cod'))) THEN
    RAISE EXCEPTION 'Payment method "%" is not active. Currently accepted: Cash on Delivery (COD)', coalesce(payload->>'paymentMethod', '');
  END IF;

  -- 6. Cart Items Validation
  v_items := payload->'items';
  IF v_items IS NULL OR jsonb_array_length(v_items) = 0 THEN
    RAISE EXCEPTION 'Cart cannot be empty';
  END IF;

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

    UPDATE public.product_variants
    SET stock = stock - v_agg.quantity, updated_at = now()
    WHERE id = v_var.id;

    v_line_total := v_var.price * v_agg.quantity;
    v_subtotal := v_subtotal + v_line_total;

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

  -- 9. Generate Cryptographically Random Tracking Token, Order ID, & Short Order Number
  v_order_id := 'YAS-' || to_char(now(), 'YYMM') || '-' || lpad((floor(random() * 900000 + 100000))::text, 6, '0');
  v_order_num := public.generate_order_number();
  v_raw_token := encode(extensions.gen_random_bytes(24), 'hex');
  v_token_hash := encode(extensions.digest(v_raw_token, 'sha256'), 'hex');
  v_user_id := nullif(trim(payload->>'user_id'), '')::UUID;

  -- 10. INSERT PARENT ORDER FIRST
  INSERT INTO public.orders (
    order_id,
    order_number,
    idempotency_key,
    payload_hash,
    user_id,
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
    v_order_num,
    v_idempotency_key,
    v_payload_hash,
    v_user_id,
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

  -- 11. INSERT ORDER ITEMS SECOND
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
    'order_number', v_order_num,
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
  IF v_idempotency_key IS NOT NULL THEN
    UPDATE public.idempotency_records
    SET status = 'failed',
        updated_at = now()
    WHERE key = v_idempotency_key;
  END IF;
  RAISE;
END;
$$;

-- =====================================================================
-- 9. UPDATE TRACKING RPC TO SUPPORT SHORT ORDER NUMBER OR ORDER ID
-- =====================================================================
CREATE OR REPLACE FUNCTION public.track_order_secure(
  p_order_id TEXT,
  p_tracking_token TEXT,
  p_client_ip TEXT DEFAULT '127.0.0.1'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog, pg_temp
AS $$
DECLARE
  v_token_hash TEXT;
  v_order RECORD;
  v_items JSONB;
BEGIN
  v_token_hash := encode(extensions.digest(trim(p_tracking_token), 'sha256'), 'hex');

  -- Support querying by either order_number (YAS-2026-0001) or order_id (YAS-2610-123456)
  SELECT 
    o.id, o.order_id, o.order_number, o.status, o.current_step, o.courier_tracking,
    o.city, o.province, o.estimated_delivery, o.created_at, o.tracking_token_hash
  INTO v_order
  FROM public.orders o
  WHERE (o.order_id = trim(p_order_id) OR o.order_number = trim(p_order_id));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No order found matching the provided order identifier.');
  END IF;

  IF v_order.tracking_token_hash <> v_token_hash THEN
    RETURN jsonb_build_object('success', false, 'error', 'The provided tracking verification token is invalid.');
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'title', oi.title,
      'sku', oi.sku,
      'size', oi.size,
      'color', oi.color,
      'quantity', oi.quantity,
      'unit_price', coalesce(oi.unit_price, oi.price),
      'line_total', oi.line_total,
      'image', oi.image
    )
  )
  INTO v_items
  FROM public.order_items oi
  WHERE oi.order_id = v_order.order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order.order_id,
    'order_number', coalesce(v_order.order_number, v_order.order_id),
    'status', v_order.status,
    'current_step', v_order.current_step,
    'courier_tracking', v_order.courier_tracking,
    'destination_city', v_order.city,
    'destination_province', v_order.province,
    'estimated_delivery', v_order.estimated_delivery,
    'date_placed', v_order.created_at,
    'items', coalesce(v_items, '[]'::jsonb)
  );
END;
$$;

-- =====================================================================
-- 10. ENABLE REALTIME ON NOTIFICATIONS & ORDERS
-- =====================================================================
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
