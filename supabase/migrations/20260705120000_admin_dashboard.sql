-- ADMIN DASHBOARD PRIMITIVES
-- is_admin flag on profiles + SECURITY DEFINER RPCs consumed by the /admin page.
-- Admins are set manually in SQL (UPDATE public.profiles SET is_admin = true WHERE user_id = …);
-- there is intentionally no way to grant admin from the app.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Every admin RPC calls this first. RAISEs for non-admins so callers get a
-- clean error instead of empty data.
CREATE OR REPLACE FUNCTION public.assert_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'admin_only: not authorized' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

-- Platform-wide KPIs for the cards row. MRR is book revenue (plan price ×
-- paid-plan count) — no payment gateway yet, upgrades are manual.
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month_start timestamptz := date_trunc('month', now());
  v_result json;
BEGIN
  PERFORM public.assert_admin();
  SELECT json_build_object(
    'total_users',        (SELECT count(*) FROM public.profiles),
    'new_users_month',    (SELECT count(*) FROM public.profiles WHERE created_at >= v_month_start),
    'plan_free',          (SELECT count(*) FROM public.profiles WHERE plan = 'free'),
    'plan_starter',       (SELECT count(*) FROM public.profiles WHERE plan = 'starter'),
    'plan_growth',        (SELECT count(*) FROM public.profiles WHERE plan = 'growth'),
    'mrr',                (SELECT count(*) FILTER (WHERE plan = 'starter') * 999
                                + count(*) FILTER (WHERE plan = 'growth') * 2499
                           FROM public.profiles),
    'total_agents',       (SELECT count(*) FROM public.agents),
    'active_agents',      (SELECT count(*) FROM public.agents WHERE active = true),
    'messages_total',     (SELECT count(*) FROM public.conversation_messages),
    'messages_month',     (SELECT count(*) FROM public.conversation_messages WHERE created_at >= v_month_start),
    'conversations_month',(SELECT count(*) FROM public.conversations WHERE started_at >= v_month_start)
  ) INTO v_result;
  RETURN v_result;
END;
$$;

-- One row per user for the admin table. Email comes from auth.users
-- (SECURITY DEFINER may read it); msgs_month is the platform-key counter
-- (free-tier quota), msgs_total is all logged chat messages across the
-- user's agents.
CREATE OR REPLACE FUNCTION public.admin_list_users()
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
    GROUP BY c.user_id
  ) cm ON cm.uid = p.user_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Manual plan changes from the admin table (no payment gateway yet).
CREATE OR REPLACE FUNCTION public.admin_set_plan(p_user_id uuid, p_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();
  IF p_plan NOT IN ('free', 'starter', 'growth') THEN
    RAISE EXCEPTION 'invalid_plan: %', p_plan USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.profiles
  SET plan = p_plan, plan_updated_at = now()
  WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user_not_found: %', p_user_id USING ERRCODE = 'P0001';
  END IF;
END;
$$;

-- Signed-in users only; the assert_admin() gate inside does the real check.
REVOKE ALL ON FUNCTION public.assert_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_stats() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_plan(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assert_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_plan(uuid, text) TO authenticated;
