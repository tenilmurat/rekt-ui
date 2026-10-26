"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BASE_PATH } from "@/lib/base-path";
import { getSupabase } from "@/lib/supabase/client";

/**
 * Where Google sign-in and the emailed sign-in link land. Swaps the one-time
 * code for a session in the browser, then returns to the page the visitor was on.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const next = params.get("next") ?? "/";
    // Only same-site paths, so the link can't be used to bounce someone elsewhere.
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
    // A full load on failure, so the page reads ?signin=failed and explains it.
    const fail = () =>
      window.location.replace(`${BASE_PATH}${safeNext}${safeNext.includes("?") ? "&" : "?"}signin=failed`);

    const supabase = getSupabase();
    if (!code || !supabase) {
      fail();
      return;
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => (error ? fail() : router.replace(safeNext)));
  }, [router]);

  return (
    <main className="flex min-h-[60dvh] items-center justify-center">
      <p role="status" className="text-[13px]" style={{ color: "var(--ink-3)" }}>
        Signing you in…
      </p>
    </main>
  );
}
