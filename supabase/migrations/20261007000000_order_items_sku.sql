-- =====================================================================
-- Migration: Add SKU column to order_items and preserve SKU in checkout & tracking RPCs
-- Date: 2026-10-07
-- =====================================================================

-- 1. Add SKU column to order_items if not present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'order_items' 
      AND column_name = 'sku'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN sku TEXT;
  END IF;
END $$;

-- 2. Update create_order_checkout to populate sku in order_items
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
  IF payload->>'user_id' IS NOT NULL AND trim(payload->>'user_id') <> '' THEN
    BEGIN
      v_user_id := (payload->>'user_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_user_id := NULL;
    END;
  ELSE
    v_user_id := NULL;
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

  IF NOT (v_allowed_provinces @> to_jsonb(trim(v_customer->>'province'))) THEN
    RAISE EXCEPTION 'Selected province "%" is not in supported delivery territories', trim(v_customer->>'province');
  END IF;

  IF NOT (v_allowed_methods @> to_jsonb(coalesce(payload->>'paymentMethod', 'cod'))) THEN
    RAISE EXCEPTION 'Payment method "%" is not active. Currently accepted: Cash on Delivery (COD)', coalesce(payload->>'paymentMethod', '');
  END IF;

  -- 7. Cart Items Validation
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

  -- 8. Lock variants in consistent order and validate stock/price
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

  -- 9. Calculate Shipping & Total
  IF v_subtotal >= v_free_thresh THEN
    v_shipping_fee := 0;
  ELSE
    v_shipping_fee := v_std_shipping;
  END IF;
  v_total := v_subtotal + v_shipping_fee;

  -- 10. Generate IDs
  v_order_id := 'YAS-' || to_char(now(), 'YYMM') || '-' || lpad((floor(random() * 900000 + 100000))::text, 6, '0');
  v_raw_token := encode(extensions.gen_random_bytes(24), 'hex');
  v_token_hash := encode(extensions.digest(v_raw_token, 'sha256'), 'hex');

  -- 11. INSERT PARENT ORDER
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

  -- 12. INSERT ORDER ITEMS WITH PRESERVED SKU
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

  -- 13. Clear Customer Cart Items if user_id is present
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
    'estimated_delivery', v_est_delivery
  );

  UPDATE public.idempotency_records
  SET response = v_response, status = 'completed', updated_at = now()
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

-- 3. Update track_order_secure to return SKU
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

  IF p_tracking_token IS NULL OR char_length(trim(p_tracking_token)) < 32 THEN
    RAISE EXCEPTION 'A valid cryptographic tracking token is required';
  END IF;

  v_token_hash := encode(extensions.digest(trim(p_tracking_token), 'sha256'), 'hex');

  SELECT order_id, status, current_step, courier_tracking, city, province, estimated_delivery, created_at
  INTO v_order
  FROM public.orders
  WHERE order_id = v_clean_order_id
    AND tracking_token_hash = v_token_hash;

  IF NOT FOUND THEN
    INSERT INTO public.audit_rate_limits (action, identifier, success)
    VALUES ('track_order_failed', coalesce(p_client_ip, v_clean_order_id), false);

    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found or tracking token invalid.'
    );
  END IF;

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
