-- ADMIN MANAGEMENT POWERS — editable platform settings + account/agent actions.
-- All gated by assert_admin() from 20260705120000_admin_dashboard.sql.

-- 1) Key-value platform settings, editable from the console. The agent-limit
--    trigger reads these, so changes here are ENFORCED immediately (no deploy).
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
-- No policies: reads/writes only via the RPCs below.

INSERT INTO public.platform_settings (key, value) VALUES
  ('agent_limit_free', '1'),
  ('agent_limit_starter', '2'),
  ('agent_limit_growth', '5')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.admin_get_settings()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  PERFORM public.assert_admin();
  SELECT COALESCE(json_object_agg(key, value), '{}'::json) INTO v_result FROM public.platform_settings;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_setting(p_key text, p_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();
  IF p_key NOT IN ('agent_limit_free', 'agent_limit_starter', 'agent_limit_growth') THEN
    RAISE EXCEPTION 'unknown_setting: %', p_key USING ERRCODE = 'P0001';
  END IF;
  IF p_value !~ '^\d+$' OR p_value::int < 1 OR p_value::int > 1000 THEN
    RAISE EXCEPTION 'invalid_value: % must be a number between 1 and 1000', p_key USING ERRCODE = 'P0001';
  END IF;
  INSERT INTO public.platform_settings (key, value, updated_at, updated_by)
  VALUES (p_key, p_value, now(), auth.uid())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by;
END;
$$;

-- 2) The agent-limit trigger now reads platform_settings (falls back to the
--    original hardcoded limits if a key is missing).
CREATE OR REPLACE FUNCTION public.enforce_agent_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan text;
  v_limit int;
  v_count int;
BEGIN
  SELECT plan INTO v_plan FROM public.profiles WHERE user_id = NEW.user_id;
  v_plan := COALESCE(v_plan, 'free');
  v_limit := COALESCE(
    (SELECT value::int FROM public.platform_settings WHERE key = 'agent_limit_' || v_plan),
    CASE v_plan WHEN 'growth' THEN 5 WHEN 'starter' THEN 2 ELSE 1 END
  );
  SELECT count(*) INTO v_count FROM public.agents WHERE user_id = NEW.user_id;
  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'plan_limit_agents: your % plan allows % agent(s). Upgrade to add more.', v_plan, v_limit
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

-- 3) Reset an account's free-tier message counter for the current month.
CREATE OR REPLACE FUNCTION public.admin_reset_usage(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();
  UPDATE public.monthly_usage SET msgs = 0
  WHERE user_id = p_user_id AND month = to_char(now(), 'YYYY-MM');
END;
$$;

-- 4) Rename any account (shows on their dashboard greeting + here).
CREATE OR REPLACE FUNCTION public.admin_set_user_name(p_user_id uuid, p_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();
  IF length(trim(p_name)) < 1 OR length(p_name) > 80 THEN
    RAISE EXCEPTION 'invalid_name: 1-80 characters' USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.profiles SET name = trim(p_name), updated_at = now() WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user_not_found: %', p_user_id USING ERRCODE = 'P0001';
  END IF;
END;
$$;

-- 5) Set any agent's widget rate limit (requests/hour per visitor).
CREATE OR REPLACE FUNCTION public.admin_set_agent_rate_limit(p_agent_id uuid, p_per_hour int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();
  IF p_per_hour < 1 OR p_per_hour > 10000 THEN
    RAISE EXCEPTION 'invalid_rate_limit: 1-10000 per hour' USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.agents SET rate_limit_per_hour = p_per_hour, rate_limit_enabled = true, updated_at = now()
  WHERE id = p_agent_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'agent_not_found: %', p_agent_id USING ERRCODE = 'P0001';
  END IF;
END;
$$;

-- 6) admin_list_agents gains rate-limit fields (return type changes → drop first).
DROP FUNCTION IF EXISTS public.admin_list_agents();
CREATE FUNCTION public.admin_list_agents()
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
  logo_url text,
  rate_limit_per_hour int,
  rate_limit_enabled boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_admin();
  RETURN QUERY
  SELECT a.id, a.name, a.model, u.email::text, p.name, p.plan,
         a.message_count, a.conversation_count, a.active, a.created_at, a.logo_url,
         a.rate_limit_per_hour, a.rate_limit_enabled
  FROM public.agents a
  JOIN auth.users u ON u.id = a.user_id
  LEFT JOIN public.profiles p ON p.user_id = a.user_id
  ORDER BY a.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_agents() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_agents() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_get_settings() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_setting(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_reset_usage(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_user_name(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_agent_rate_limit(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_setting(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reset_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_name(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_agent_rate_limit(uuid, int) TO authenticated;
