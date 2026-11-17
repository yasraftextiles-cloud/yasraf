-- Admin order management for the deployed, private-token checkout schema.
-- Deliberately does not replace checkout or tracking RPCs.
SET LOCAL lock_timeout = '4s';

CREATE SEQUENCE IF NOT EXISTS yasraf_private.admin_order_number_seq;

CREATE OR REPLACE FUNCTION yasraf_private.next_admin_order_number()
RETURNS text
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT 'YAS-' || pg_catalog.to_char(CURRENT_DATE, 'YYYY') || '-'
    || pg_catalog.lpad(n::text, greatest(4, length(n::text)), '0')
  FROM (SELECT nextval('yasraf_private.admin_order_number_seq'::regclass) AS n) s;
$$;
REVOKE ALL ON FUNCTION yasraf_private.next_admin_order_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION yasraf_private.next_admin_order_number() TO service_role;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text,
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.orders ALTER COLUMN order_number SET DEFAULT yasraf_private.next_admin_order_number();
UPDATE public.orders SET order_number = yasraf_private.next_admin_order_number()
WHERE order_number IS NULL;
ALTER TABLE public.orders ALTER COLUMN order_number SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS yasraf_orders_short_number_uidx ON public.orders(order_number);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  changed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS yasraf_order_status_history_order_date_idx
  ON public.order_status_history(order_id, created_at DESC);
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_status_history FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.order_status_history TO authenticated;
DROP POLICY IF EXISTS yasraf_admin_read_status_history ON public.order_status_history;
CREATE POLICY yasraf_admin_read_status_history ON public.order_status_history
  FOR SELECT TO authenticated USING ((SELECT public.is_admin()));

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
  order_number text,
  type text NOT NULL DEFAULT 'new_order',
  title text NOT NULL,
  message text NOT NULL,
  customer_name text,
  total_amount numeric,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, type)
);
CREATE INDEX IF NOT EXISTS yasraf_admin_notifications_date_idx ON public.admin_notifications(created_at DESC);
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_notifications FROM PUBLIC, anon, authenticated;
GRANT SELECT, UPDATE (is_read, read_at) ON public.admin_notifications TO authenticated;
DROP POLICY IF EXISTS yasraf_admin_read_notifications ON public.admin_notifications;
CREATE POLICY yasraf_admin_read_notifications ON public.admin_notifications
  FOR SELECT TO authenticated USING ((SELECT public.is_admin()));
DROP POLICY IF EXISTS yasraf_admin_ack_notifications ON public.admin_notifications;
CREATE POLICY yasraf_admin_ack_notifications ON public.admin_notifications
  FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

-- This trigger runs in the checkout transaction; it does not depend on email credentials.
CREATE OR REPLACE FUNCTION yasraf_private.capture_new_order_notification()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.admin_notifications (order_id, order_number, title, message, customer_name, total_amount)
  VALUES (
    NEW.order_id, NEW.order_number, 'New Order Received',
    'New order #' || NEW.order_number || ' — Rs. ' || NEW.total::text,
    NEW.customer_name, NEW.total
  ) ON CONFLICT (order_id, type) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION yasraf_private.capture_new_order_notification() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS yasraf_new_order_notification ON public.orders;
CREATE TRIGGER yasraf_new_order_notification
  AFTER INSERT ON public.orders FOR EACH ROW
  EXECUTE FUNCTION yasraf_private.capture_new_order_notification();

CREATE OR REPLACE FUNCTION yasraf_private.capture_order_status_history()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_email text;
  v_notes text := nullif(current_setting('yasraf.admin_status_notes', true), '');
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status OR v_notes IS NOT NULL THEN
    SELECT email INTO v_email FROM auth.users WHERE id = v_actor;
    INSERT INTO public.order_status_history
      (order_id, previous_status, new_status, changed_by_user_id, changed_by_email, notes)
    VALUES (NEW.order_id, OLD.status, NEW.status, v_actor, v_email, v_notes);
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION yasraf_private.capture_order_status_history() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS yasraf_order_status_history ON public.orders;
CREATE TRIGGER yasraf_order_status_history
  AFTER UPDATE OF status ON public.orders FOR EACH ROW
  EXECUTE FUNCTION yasraf_private.capture_order_status_history();

DROP POLICY IF EXISTS yasraf_admin_delete_archived_orders ON public.orders;
CREATE POLICY yasraf_admin_delete_archived_orders ON public.orders
  FOR DELETE TO authenticated USING (is_archived AND (SELECT public.is_admin()));
GRANT DELETE ON public.orders TO authenticated;
GRANT UPDATE (status, current_step, updated_at, is_archived, archived_at, archived_by)
  ON public.orders TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime' AND NOT puballtables)
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'admin_notifications'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
  END IF;
END $$;
