import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin client — uses the SERVICE ROLE key.
 * Only used in server-side API routes (never in client components).
 * Bypasses Row Level Security — use only for trusted server operations.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export const createAdminClient = () => supabaseAdmin;

