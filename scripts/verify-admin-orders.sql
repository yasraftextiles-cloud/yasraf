-- Run after installing the admin migrations, inside a transaction/savepoint.
-- Always roll the test back; do not commit it.
-- Uses the real checkout RPC without calling the external email provider.
DO $test$
DECLARE
  v_variant record;
  v_province text;
  v_admin uuid;
  v_input jsonb;
  v_result jsonb;
BEGIN
  SELECT user_id INTO STRICT v_admin FROM public.user_roles WHERE role = 'admin' LIMIT 1;
  SELECT pv.id, pv.product_id INTO STRICT v_variant
  FROM public.product_variants pv JOIN public.products p ON p.id = pv.product_id
  WHERE p.is_published AND pv.stock > 0
  ORDER BY pv.id LIMIT 1;
  SELECT jsonb_array_elements_text(value->'supported_provinces') INTO STRICT v_province
  FROM public.store_settings WHERE key = 'shipping_config' LIMIT 1;
  PERFORM set_config('yasraf.test_admin', v_admin::text, true);
  v_input := jsonb_build_object(
    'idempotency_key', 'test-admin-orders-' || gen_random_uuid(),
    'customer', jsonb_build_object('fullName', 'Rollback-only order test', 'phone', '03000000000',
      'address', 'Not for dispatch', 'city', 'Test', 'province', v_province),
    'paymentMethod', 'cod',
    'items', jsonb_build_array(jsonb_build_object('variantId', v_variant.id,
      'productId', v_variant.product_id, 'quantity', 1))
  );
  EXECUTE 'SET LOCAL ROLE service_role';
  v_result := public.create_order_checkout(v_input);
  IF v_result->>'success' IS DISTINCT FROM 'true' OR public.create_order_checkout(v_input) IS DISTINCT FROM v_result THEN
    RAISE EXCEPTION 'Checkout or idempotent retry failed';
  END IF;
  PERFORM set_config('yasraf.test_order_id', v_result->>'order_id', true);
END
$test$;
RESET ROLE;
SET LOCAL ROLE authenticated;
DO $test$
DECLARE
  v_order_id text := current_setting('yasraf.test_order_id');
  v_status text;
  v_step integer;
  v_order public.orders;
  v_count integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
  IF EXISTS (SELECT 1 FROM public.admin_notifications WHERE order_id = v_order_id) THEN
    RAISE EXCEPTION 'Non-admin could see an admin notification';
  END IF;
  BEGIN
    PERFORM public.admin_update_order_status(v_order_id, 'confirmed');
    RAISE EXCEPTION 'Non-admin could update an order';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  PERFORM set_config('request.jwt.claim.sub', current_setting('yasraf.test_admin'), true);
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Test admin claim not recognized'; END IF;
  IF (SELECT count(*) FROM public.admin_notifications WHERE order_id = v_order_id) <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one new-order notification after checkout and retry';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_notifications n JOIN public.orders o USING (order_id)
    WHERE o.order_id = v_order_id AND n.order_number = o.order_number AND NOT n.is_read
      AND o.order_number ~ '^YAS-[0-9]{4}-[0-9]{4,}$'
  ) THEN RAISE EXCEPTION 'New notification or short order number invalid'; END IF;

  UPDATE public.admin_notifications SET is_read = true, read_at = now() WHERE order_id = v_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mark as read failed'; END IF;
  FOR v_status, v_step IN VALUES
    ('confirmed',1), ('processing',2), ('packed',2), ('shipped',3),
    ('out_for_delivery',3), ('delivered',4), ('cancelled',1), ('returned',1), ('order_received',1)
  LOOP
    SELECT * INTO v_order FROM public.admin_update_order_status(v_order_id, v_status, 'Rollback test');
    IF v_order.status IS DISTINCT FROM v_status OR v_order.current_step IS DISTINCT FROM v_step THEN
      RAISE EXCEPTION 'Status or tracking step failed: %', v_status;
    END IF;
  END LOOP;
  SELECT count(*) INTO v_count FROM public.order_status_history
  WHERE order_id = v_order_id AND notes = 'Rollback test' AND changed_by_user_id = auth.uid();
  IF v_count <> 9 THEN RAISE EXCEPTION 'Status history expected 9 entries, got %', v_count; END IF;
  UPDATE public.orders SET is_archived = true, archived_at = now(), archived_by = auth.uid()
    WHERE order_id = v_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Archive failed'; END IF;
  UPDATE public.orders SET is_archived = false, archived_at = NULL, archived_by = NULL
    WHERE order_id = v_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Restore failed'; END IF;
  DELETE FROM public.orders WHERE order_id = v_order_id;
  IF FOUND THEN RAISE EXCEPTION 'Active orders must not be deletable'; END IF;
  UPDATE public.orders SET is_archived = true WHERE order_id = v_order_id;
  DELETE FROM public.orders WHERE order_id = v_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Archived test order deletion failed'; END IF;
END
$test$;
RESET ROLE;
