import { API_URL } from "@/lib/supabase/config";
import { getSupabase } from "@/lib/supabase/client";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Calls the API (apps/api) as the signed-in user: the Supabase access token goes in
 * the Authorization header and the backend checks it before doing anything.
 * Errors carry the backend's own message, which is written for people.
 */
export async function api<T = void>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const supabase = getSupabase();
  const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
  if (!token) throw new ApiError(401, "Sign in first");

  const res = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  }).catch(() => {
    throw new ApiError(0, "Can't reach the server — check your connection");
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(body.message) ? body.message[0] : body.message;
    throw new ApiError(res.status, message ?? "Something went wrong — try again");
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}
