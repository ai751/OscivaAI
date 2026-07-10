-- HOTFIX: signups have returned 500 since 20260703120000_plans.sql shipped.
-- handle_new_user() (from 20260424081230) inserts plan='Free', which violates
-- the lowercase profiles_plan_check constraint added by the plans migration —
-- the trigger aborts the auth.users insert, so account creation fails entirely.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'free'
  );
  RETURN NEW;
END;
$$;
