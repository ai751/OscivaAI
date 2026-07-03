-- PRICING PLANS + ENFORCEMENT PRIMITIVES
-- Plans: free (1 agent, 50 platform msgs/mo, 1MB docs, no web) ·
--        starter ₹999 (2 agents, unlimited BYOK msgs, 5MB docs, 7 web pages) ·
--        growth ₹2,499 (5 agents, all models, 10MB docs, 15 web pages, security)

-- 1) profiles.plan already exists (legacy default 'Free', freeform text).
--    Normalize to lowercase enum values and constrain it. No payment gateway
--    yet — plans are upgraded manually.
UPDATE public.profiles SET plan = lower(plan) WHERE plan <> lower(plan);
UPDATE public.profiles SET plan = 'free' WHERE plan IS NULL OR plan NOT IN ('free', 'starter', 'growth');
ALTER TABLE public.profiles ALTER COLUMN plan SET DEFAULT 'free';
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'starter', 'growth'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_updated_at timestamptz NOT NULL DEFAULT now();

-- 2) Monthly platform-key usage (free tier: 50 messages/month on Osciva's key).
CREATE TABLE IF NOT EXISTS public.monthly_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month text NOT NULL, -- 'YYYY-MM'
  msgs int NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, month)
);
ALTER TABLE public.monthly_usage ENABLE ROW LEVEL SECURITY;
-- Owners may see their own usage (for the Settings plan card).
CREATE POLICY "Users read own usage" ON public.monthly_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- Writes happen only via the SECURITY DEFINER RPC below (service role bypasses RLS anyway).

-- Atomic bump-and-return, mirroring bump_rate_limit's shape.
CREATE OR REPLACE FUNCTION public.bump_monthly_usage(p_user_id uuid, p_month text)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  INSERT INTO public.monthly_usage (user_id, month, msgs)
  VALUES (p_user_id, p_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET msgs = public.monthly_usage.msgs + 1
  RETURNING msgs INTO v_count;
  RETURN v_count;
END;
$$;

-- Read-only peek (used to check the cap BEFORE burning a message).
CREATE OR REPLACE FUNCTION public.get_monthly_usage(p_user_id uuid, p_month text)
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT msgs FROM public.monthly_usage WHERE user_id = p_user_id AND month = p_month), 0);
$$;

-- 3) Per-plan agent limit, enforced server-side at insert time.
--    Only blocks NEW inserts over the limit; existing agents are untouched.
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
  v_limit := CASE v_plan WHEN 'growth' THEN 5 WHEN 'starter' THEN 2 ELSE 1 END;
  SELECT count(*) INTO v_count FROM public.agents WHERE user_id = NEW.user_id;
  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'plan_limit_agents: your % plan allows % agent(s). Upgrade to add more.', v_plan, v_limit
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS agents_plan_limit ON public.agents;
CREATE TRIGGER agents_plan_limit
BEFORE INSERT ON public.agents
FOR EACH ROW EXECUTE FUNCTION public.enforce_agent_limit();
