-- ============================================================
-- Migration 007 — Role Escalation Prevention Trigger
-- ============================================================
-- APPLY THIS IN: Supabase Dashboard → SQL Editor
-- ============================================================

-- Prevent any authenticated user from changing their own role
-- via the client API. Only service_role (admin) can change roles.
-- This is a BEFORE UPDATE trigger — it fires before the row is written.

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- auth.uid() returns NULL when the caller is service_role (admin)
  -- If a logged-in user is changing the role column → block it
  IF auth.uid() IS NOT NULL AND OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'permission denied: role changes must be made by an administrator'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;

-- Only the trigger owner (service_role) can execute this function
REVOKE ALL ON FUNCTION public.prevent_role_escalation() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prevent_role_escalation() TO service_role;

-- Attach the trigger — fires only when role column changes
DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- ============================================================
-- Verify it's in place:
-- SELECT tgname, tgtype FROM pg_trigger WHERE tgrelid = 'public.profiles'::regclass;
-- ============================================================
