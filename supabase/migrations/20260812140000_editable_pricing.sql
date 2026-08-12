-- Admin-editable pricing.
--
-- Prices were hardcoded in four places (src/lib/plans.ts, ConsolePlans.tsx,
-- PricingSection.tsx, HomePricing.tsx), so changing a price meant a code edit and a
-- deploy, and the four could drift apart. They now live in platform_settings as the
-- single source of truth, editable from the admin console.
--
-- Stored as plain integer rupees, no currency symbol or separators, so the value is
-- unambiguous to validate and each surface formats it for its own locale.

insert into public.platform_settings (key, value) values
  ('price_starter_monthly', '999'),
  ('price_starter_yearly',  '799'),
  ('price_growth_monthly',  '2499'),
  ('price_growth_yearly',   '1999')
on conflict (key) do nothing;

-- Extend the setting whitelist. Agent limits keep their 1..1000 rule; prices need a
-- wider range and must allow 0, so the two are validated separately rather than
-- widening the existing check and letting an agent limit of 0 through.
create or replace function public.admin_set_setting(p_key text, p_value text)
returns void
language plpgsql
security definer
set search_path = public
as $$
BEGIN
  PERFORM public.assert_admin();

  IF p_key IN ('agent_limit_free', 'agent_limit_starter', 'agent_limit_growth') THEN
    IF p_value !~ '^\d+$' OR p_value::int < 1 OR p_value::int > 1000 THEN
      RAISE EXCEPTION 'invalid_value: % must be a number between 1 and 1000', p_key USING ERRCODE = 'P0001';
    END IF;
  ELSIF p_key IN ('price_starter_monthly', 'price_starter_yearly',
                  'price_growth_monthly',  'price_growth_yearly') THEN
    -- Whole rupees only. 0 is allowed (a plan can be made free); the ceiling is a
    -- guard against a fat-fingered extra digit going live on the public site.
    IF p_value !~ '^\d+$' OR p_value::bigint > 1000000 THEN
      RAISE EXCEPTION 'invalid_value: % must be a whole number of rupees between 0 and 10,00,000', p_key USING ERRCODE = 'P0001';
    END IF;
  ELSE
    RAISE EXCEPTION 'unknown_setting: %', p_key USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.platform_settings (key, value, updated_at, updated_by)
  VALUES (p_key, p_value, now(), auth.uid())
  ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by;
END;
$$;

-- Public read path for prices ONLY.
--
-- The marketing pricing page is anonymous, so it needs to read these without a
-- session. platform_settings has RLS on with zero policies (deliberate deny-all), and
-- that stays: this SECURITY DEFINER function is the single narrow hole, and it filters
-- to the price_% keys so agent limits and any future operational setting are never
-- exposed. Prices are public information by nature — they are printed on the website.
create or replace function public.get_public_pricing()
returns json
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(json_object_agg(key, value), '{}'::json)
  from public.platform_settings
  where key like 'price\_%';
$$;

revoke all on function public.get_public_pricing() from public;
grant execute on function public.get_public_pricing() to anon, authenticated;
