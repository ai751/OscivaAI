-- Guard self-service plan changes.
-- The "Users can update own profile" RLS policy lets any signed-in user update
-- their own profiles row — including `plan`, since Postgres RLS has no
-- column-level rules. That means anyone could self-upgrade for free via the
-- REST API. This trigger closes that hole while still allowing:
--   1. privileged contexts (service role, SQL editor, dashboard) — auth.uid() is NULL
--   2. admins (drives admin_set_plan and the /adminosciva console)
--   3. the whitelisted TEST accounts changing their OWN plan (dev plan switcher
--      in Settings → Plan & Billing; keep the list in sync with DEV_PLAN_TESTERS
--      in src/pages/Settings.tsx)

CREATE OR REPLACE FUNCTION public.guard_plan_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    -- Service role / SQL editor / migrations: no JWT subject -> allow.
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;
    -- Admins may change any plan (admin_set_plan runs as the calling admin).
    IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true) THEN
      RETURN NEW;
    END IF;
    -- Whitelisted test accounts may change their OWN plan only.
    SELECT lower(u.email) INTO v_email FROM auth.users u WHERE u.id = auth.uid();
    IF NEW.user_id = auth.uid()
       AND v_email IN ('amanboud29@gmail.com', 'vijay@adyatech.com') THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'plan_change_not_allowed: contact support to change your plan'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_plan_change ON public.profiles;
CREATE TRIGGER trg_guard_plan_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_plan_change();
