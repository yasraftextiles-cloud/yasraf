-- Expand only the order status constraint; keep payment validation, the
-- existing order values/defaults and the 1–4 tracking step constraint.
SET LOCAL lock_timeout = '4s';

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check,
  ADD CONSTRAINT orders_status_check CHECK (
    status IN (
      'order_received', 'confirmed', 'processing', 'packed', 'shipped',
      'out_for_delivery', 'delivered', 'cancelled', 'returned',
      'Order Received', 'Confirmed', 'Artisan Inspection', 'Processing',
      'Packed', 'Dispatched', 'Shipped', 'Out for Delivery', 'Delivered',
      'Cancelled', 'Returned'
    )
  );

-- Run with the caller's privileges; orders remains protected by admin RLS.
CREATE OR REPLACE FUNCTION public.admin_update_order_status(
  p_order_id text, p_status text, p_notes text DEFAULT NULL
)
RETURNS public.orders
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_order public.orders;
  v_step integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  v_step := CASE
    WHEN p_status IN ('order_received', 'confirmed', 'cancelled', 'returned') THEN 1
    WHEN p_status IN ('processing', 'packed') THEN 2
    WHEN p_status IN ('shipped', 'out_for_delivery') THEN 3
    WHEN p_status = 'delivered' THEN 4
  END;
  IF v_step IS NULL THEN
    RAISE EXCEPTION 'Invalid order status' USING ERRCODE = '22023';
  END IF;
  IF length(coalesce(p_notes, '')) > 2000 THEN
    RAISE EXCEPTION 'Status notes must be 2,000 characters or fewer' USING ERRCODE = '22023';
  END IF;
  PERFORM set_config('yasraf.admin_status_notes', coalesce(nullif(btrim(p_notes), ''), ''), true);
  UPDATE public.orders SET status = p_status, current_step = v_step, updated_at = now()
    WHERE order_id = p_order_id
    RETURNING * INTO v_order;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0002';
  END IF;
  PERFORM set_config('yasraf.admin_status_notes', '', true);
  RETURN v_order;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_update_order_status(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_order_status(text, text, text) TO authenticated;
