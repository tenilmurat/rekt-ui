import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, accountsEnabled } from "@/lib/supabase/config";

let client: SupabaseClient | null = null;

/**
 * The browser's Supabase client, used for sign-in only — data goes through
 * the API. PKCE: Google and the emailed link return with a `?code` that
 * app/auth/callback swaps for a session.
 */
export function getSupabase(): SupabaseClient | null {
  if (!accountsEnabled) return null;
  client ??= createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { flowType: "pkce", detectSessionInUrl: false, persistSession: true, autoRefreshToken: true },
  });
  return client;
}
