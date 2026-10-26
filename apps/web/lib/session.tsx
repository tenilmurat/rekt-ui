"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { SignInDialog } from "@/components/site/SignInDialog";
import { api, ApiError } from "@/lib/api";
import type { PlanId } from "@/lib/plans";
import { getSupabase } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";

export type BookmarkKind = "component" | "design";

type Account = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

type Session = {
  /** "disabled" when accounts aren't configured; everything else still works signed out. */
  status: "loading" | "signed-out" | "signed-in" | "disabled";
  account: Account | null;
  plan: PlanId;
  /** Paddle's own status for a paid plan, for the Account page. */
  planStatus: string | null;
  periodEnd: string | null;
  bookmarks: Set<string>;
  isBookmarked: (kind: BookmarkKind, id: string) => boolean;
  toggleBookmark: (kind: BookmarkKind, id: string, label: string) => Promise<void>;
  openSignIn: (reason?: string) => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

const key = (kind: BookmarkKind, id: string) => `${kind}:${id}`;

/** What the API's GET /me returns. */
type Me = {
  account: Account;
  plan: PlanId;
  planStatus: string | null;
  periodEnd: string | null;
  bookmarks: { kind: BookmarkKind; id: string }[];
};

/**
 * The visitor's account, plan and bookmarks. Supabase signs them in; the rest
 * comes from the API, read in the browser so every page can stay static.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();
  const toast = useToast();

  const [status, setStatus] = useState<Session["status"]>(supabase ? "loading" : "disabled");
  const [account, setAccount] = useState<Account | null>(null);
  const [plan, setPlan] = useState<PlanId>("free");
  const [planStatus, setPlanStatus] = useState<string | null>(null);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [signIn, setSignIn] = useState<{ open: boolean; reason?: string }>({ open: false });

  const load = useCallback(
    async (user: User | null) => {
      if (!supabase) return;
      if (!user) {
        setAccount(null);
        setPlan("free");
        setPlanStatus(null);
        setPeriodEnd(null);
        setBookmarks(new Set());
        setStatus("signed-out");
        return;
      }

      try {
        const me = await api<Me>("/me");
        setAccount(me.account);
        setPlan(me.plan);
        setPlanStatus(me.planStatus);
        setPeriodEnd(me.periodEnd);
        setBookmarks(new Set(me.bookmarks.map((b) => key(b.kind, b.id))));
      } catch (error) {
        // Signed in with Supabase but the API can't confirm it: treat as signed out.
        if (error instanceof ApiError && error.status === 401) {
          await supabase.auth.signOut();
          return;
        }
        // Server unreachable: keep the session, show the basics from the token.
        setAccount({ id: user.id, email: user.email ?? "", name: null, avatarUrl: null });
        toast(error instanceof Error ? error.message : "Couldn't load your account", "warn");
      }
      setStatus("signed-in");
    },
    [supabase, toast],
  );

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => load(data.user));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // Supabase asks that callbacks don't await its own calls inline.
        window.setTimeout(() => load(session?.user ?? null), 0);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [supabase, load]);

  // Tell the visitor when a sign-in link didn't work (see app/auth/callback).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("signin") !== "failed") return;
    toast("That sign-in link didn't work — it may have expired", "warn");
    params.delete("signin");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [toast]);

  const openSignIn = useCallback((reason?: string) => setSignIn({ open: true, reason }), []);

  const isBookmarked = useCallback((kind: BookmarkKind, id: string) => bookmarks.has(key(kind, id)), [bookmarks]);

  const toggleBookmark = useCallback(
    async (kind: BookmarkKind, id: string, label: string) => {
      if (!supabase || !account) {
        openSignIn("Sign in to save components and designs.");
        return;
      }
      const k = key(kind, id);
      const saved = bookmarks.has(k);
      const flip = (on: boolean) =>
        setBookmarks((prev) => {
          const next = new Set(prev);
          if (on) next.add(k);
          else next.delete(k);
          return next;
        });

      flip(!saved); // optimistic; put it back if the server says no
      try {
        await api(`/bookmarks/${kind}/${encodeURIComponent(id)}`, { method: saved ? "DELETE" : "PUT" });
      } catch {
        flip(saved);
        toast(`Couldn't ${saved ? "remove" : "save"} ${label} — try again`, "warn");
        return;
      }
      toast(saved ? `${label} removed from Saved` : `${label} saved`);
    },
    [supabase, account, bookmarks, openSignIn, toast],
  );

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    toast("Signed out");
  }, [supabase, toast]);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    await load(data.user);
  }, [supabase, load]);

  const value = useMemo<Session>(
    () => ({
      status,
      account,
      plan,
      planStatus,
      periodEnd,
      bookmarks,
      isBookmarked,
      toggleBookmark,
      openSignIn,
      signOut,
      refresh,
    }),
    [status, account, plan, planStatus, periodEnd, bookmarks, isBookmarked, toggleBookmark, openSignIn, signOut, refresh],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
      <SignInDialog
        open={signIn.open}
        reason={signIn.reason}
        enabled={status !== "disabled"}
        onClose={() => setSignIn({ open: false })}
      />
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside SessionProvider");
  return session;
}
