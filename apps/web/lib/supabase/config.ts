/**
 * Supabase runs sign-in; rektui-backend holds everything else (plan, bookmarks,
 * billing). Without all three values the site still works, signed out: browsing
 * is open, and the sign-in dialog says accounts aren't switched on yet.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export const accountsEnabled = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY && API_URL);
