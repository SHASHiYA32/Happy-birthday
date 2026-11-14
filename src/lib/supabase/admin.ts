import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Service-role client. Bypasses RLS, so it is only ever used in server code
 * AFTER a check (valid OTP session) has passed. `server-only` makes the build
 * fail if this file is ever imported from client code.
 */
export function createAdminClient() {
  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
