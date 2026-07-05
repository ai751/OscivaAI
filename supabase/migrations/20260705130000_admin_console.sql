-- ADMIN CONSOLE (flowadmin parity) — audit tables + the RPCs behind /adminosciva.
-- Everything is gated by assert_admin() from 20260705120000_admin_dashboard.sql.

-- 1) Plan change log — feeds "Recent plan changes". Populated by trigger so
--    manual SQL updates get logged too, not just admin_set_plan.
CREATE TABLE IF NOT EXISTS public.plan_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_plan text,
  new_plan text NOT NULL,
  changed_by uuid, -- auth.uid() of the actor; null when changed via service role/SQL
  changed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.plan_changes ENABLE ROW LEVEL SECURITY;
-- No policies: reads go through admin_list_plan_changes(), writes through the trigger.

CREATE OR REPLACE FUNCTION public.log_plan_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    INSERT INTO public.plan_changes (user_id, old_plan, new_plan, changed_by)
    VALUES (NEW.user_id, OLD.plan, NEW.plan, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_plan_change ON public.profiles;
CREATE TRIGGER profiles_plan_change
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_plan_change();

-- 2) Support tickets — users may file their own (future contact-form hook);
--    admins manage all of them via RPCs.
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  subject text NOT NULL,
  body text,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'normal', 'low')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'waiting_on_us', 'waiting_on_customer', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users file own tickets" ON public.support_tickets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own tickets" ON public.support_tickets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3) Daily series for charts: signups / messages / conversations per day.
CREATE OR REPLACE FUNCTION public.admin_get_series(p_days int DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  PERFORM public.assert_admin();
  SELECT json_agg(row_to_json(t)) INTO v_result FROM (
    SELECT
      d::date AS day,
      (SELECT count(*) FROM public.profiles p WHERE p.created_at >= d AND p.created_at < d + interval '1 day') AS signups,
      (SELECT count(*) FROM public.conversation_messages m WHERE m.created_at >= d AND m.created_at < d + interval '1 day') AS messages,
      (SELECT count(*) FROM public.conversations c WHERE c.started_at >= d AND c.started_at < d + interval '1 day') AS conversations
    FROM generate_series(
      date_trunc('day', now()) - make_interval(days => GREATEST(p_days, 1) - 1),
      date_trunc('day', now()),
      interval '1 day'
    ) d
  ) t;
  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- 4) Conversion funnel: signup → first agent → first conversation → paid.
CREATE OR REPLACE FUNCTION public.admin_get_funnel()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  PERFORM public.assert_admin();
  SELECT json_build_object(
    'signed_up',        (SELECT count(*) FROM public.profiles),
    'created_agent',    (SELECT count(DISTINCT user_id) FROM public.agents),
    'had_conversation', (SELECT count(DISTINCT user_id) FROM public.conversations),
    'converted_paid',   (SELECT count(*) FROM public.profiles WHERE plan <> 'free')
  ) INTO v_result;
  RETURN v_result;
END;
$$;

-- 5) Retention cohorts: for each signup month (last 4), % of users with any
--    conversation activity in month N after signup (M1 = signup month itself).
CREATE OR REPLACE FUNCTION public.admin_get_cohorts()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  PERFORM public.assert_admin();
  SELECT json_agg(row_to_json(t)) INTO v_result FROM (
    SELECT
      to_char(date_trunc('month', p.created_at), 'Mon YYYY') AS cohort,
      count(*) AS users,
      round(100.0 * count(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM public.conversations c WHERE c.user_id = p.user_id
        AND date_trunc('month', c.last_message_at) = date_trunc('month', p.created_at)
      )) / count(*)) AS m1,
      round(100.0 * count(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM public.conversations c WHERE c.user_id = p.user_id
        AND date_trunc('month', c.last_message_at) = date_trunc('month', p.created_at) + interval '1 month'
      )) / count(*)) AS m2,
      round(100.0 * count(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM public.conversations c WHERE c.user_id = p.user_id
        AND date_trunc('month', c.last_message_at) = date_trunc('month', p.created_at) + interval '2 months'
      )) / count(*)) AS m3,
      round(100.0 * count(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM public.conversations c WHERE c.user_id = p.user_id
        AND date_trunc('month', c.last_message_at) = date_trunc('month', p.created_at) + interval '3 months'
      )) / count(*)) AS m4
    FROM public.profiles p
    WHERE p.created_at >= date_trunc('month', now()) - interval '3 months'
    GROUP BY date_trunc('month', p.created_at)
    ORDER BY date_trunc('month', p.created_at)
  ) t;
  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- 6) Platform-wide agent directory.
CREATE OR REPLACE FUNCTION public.admin_list_agents()
RETURNS TABLE (
  id uuid,
  name text,
  model text,
  owner_email text,
  owner_name text,
  owner_plan text,
  message_count int,
  conversation_count int,
  active boolean,
  created_at timestamptz,
  logo_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();
  RETURN QUERY
  SELECT a.id, a.name, a.model, u.email::text, p.name, p.plan,
         a.message_count, a.conversation_count, a.active, a.created_at, a.logo_url
  FROM public.agents a
  JOIN auth.users u ON u.id = a.user_id
  LEFT JOIN public.profiles p ON p.user_id = a.user_id
  ORDER BY a.created_at DESC;
END;
$$;

-- 7) Moderation power: enable/disable any agent platform-wide.
CREATE OR REPLACE FUNCTION public.admin_set_agent_active(p_agent_id uuid, p_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();
  UPDATE public.agents SET active = p_active, updated_at = now() WHERE id = p_agent_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'agent_not_found: %', p_agent_id USING ERRCODE = 'P0001';
  END IF;
END;
$$;

-- 8) Team management: grant/revoke console access by email. You cannot revoke
--    your own access (prevents locking everyone out).
CREATE OR REPLACE FUNCTION public.admin_set_admin_by_email(p_email text, p_is_admin boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target uuid;
BEGIN
  PERFORM public.assert_admin();
  SELECT id INTO v_target FROM auth.users WHERE lower(email) = lower(trim(p_email));
  IF v_target IS NULL THEN
    RAISE EXCEPTION 'user_not_found: no account with email %', p_email USING ERRCODE = 'P0001';
  END IF;
  IF v_target = auth.uid() AND NOT p_is_admin THEN
    RAISE EXCEPTION 'cannot_demote_self: ask another admin to remove your access' USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.profiles SET is_admin = p_is_admin WHERE user_id = v_target;
END;
$$;

-- 9) Recent plan changes with actor emails.
CREATE OR REPLACE FUNCTION public.admin_list_plan_changes(p_limit int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  old_plan text,
  new_plan text,
  changed_by_email text,
  changed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();
  RETURN QUERY
  SELECT pc.id, u.email::text, p.name, pc.old_plan, pc.new_plan, actor.email::text, pc.changed_at
  FROM public.plan_changes pc
  JOIN auth.users u ON u.id = pc.user_id
  LEFT JOIN public.profiles p ON p.user_id = pc.user_id
  LEFT JOIN auth.users actor ON actor.id = pc.changed_by
  ORDER BY pc.changed_at DESC
  LIMIT p_limit;
END;
$$;

-- 10) Support queue.
CREATE OR REPLACE FUNCTION public.admin_list_tickets()
RETURNS TABLE (
  id bigint,
  email text,
  subject text,
  body text,
  priority text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();
  RETURN QUERY
  SELECT t.id, COALESCE(u.email::text, t.email), t.subject, t.body, t.priority, t.status, t.created_at, t.updated_at
  FROM public.support_tickets t
  LEFT JOIN auth.users u ON u.id = t.user_id
  ORDER BY (t.status <> 'closed') DESC, (t.priority = 'urgent') DESC, t.updated_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_ticket(p_id bigint, p_status text, p_priority text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();
  UPDATE public.support_tickets
  SET status = COALESCE(p_status, status),
      priority = COALESCE(p_priority, priority),
      updated_at = now()
  WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ticket_not_found: %', p_id USING ERRCODE = 'P0001';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_ticket(p_email text, p_subject text, p_body text, p_priority text DEFAULT 'normal')
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id bigint;
BEGIN
  PERFORM public.assert_admin();
  INSERT INTO public.support_tickets (user_id, email, subject, body, priority)
  VALUES ((SELECT id FROM auth.users WHERE lower(email) = lower(trim(p_email))), p_email, p_subject, p_body, p_priority)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- 11) admin_list_users gains msgs_30d (return type changes, so drop first).
DROP FUNCTION IF EXISTS public.admin_list_users();
CREATE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  name text,
  plan text,
  is_admin boolean,
  created_at timestamptz,
  plan_updated_at timestamptz,
  agent_count bigint,
  msgs_month bigint,
  msgs_30d bigint,
  msgs_total bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();
  RETURN QUERY
  SELECT
    p.user_id,
    u.email::text,
    p.name,
    p.plan,
    p.is_admin,
    p.created_at,
    p.plan_updated_at,
    COALESCE(a.cnt, 0),
    COALESCE(mu.msgs, 0)::bigint,
    COALESCE(cm30.cnt, 0),
    COALESCE(cm.cnt, 0)
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  LEFT JOIN (
    SELECT agents.user_id AS uid, count(*) AS cnt
    FROM public.agents GROUP BY agents.user_id
  ) a ON a.uid = p.user_id
  LEFT JOIN public.monthly_usage mu
    ON mu.user_id = p.user_id AND mu.month = to_char(now(), 'YYYY-MM')
  LEFT JOIN (
    SELECT c.user_id AS uid, count(m.id) AS cnt
    FROM public.conversations c
    JOIN public.conversation_messages m ON m.conversation_id = c.id
    WHERE m.created_at >= now() - interval '30 days'
    GROUP BY c.user_id
  ) cm30 ON cm30.uid = p.user_id
  LEFT JOIN (
    SELECT c.user_id AS uid, count(m.id) AS cnt
    FROM public.conversations c
    JOIN public.conversation_messages m ON m.conversation_id = c.id
    GROUP BY c.user_id
  ) cm ON cm.uid = p.user_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Lock everything to signed-in callers; assert_admin() does the real gating.
REVOKE ALL ON FUNCTION public.admin_get_series(int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_funnel() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_cohorts() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_agents() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_agent_active(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_admin_by_email(text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_plan_changes(int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_tickets() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_update_ticket(bigint, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_create_ticket(text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_series(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_funnel() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_cohorts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_agents() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_agent_active(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_admin_by_email(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_plan_changes(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_tickets() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_ticket(bigint, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_ticket(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
