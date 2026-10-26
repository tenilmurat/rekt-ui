"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MailCheck, X } from "lucide-react";
import { Icon } from "@/components/shell/Icon";
import { BASE_PATH } from "@/lib/base-path";
import { getSupabase } from "@/lib/supabase/client";

/**
 * One dialog for joining and signing in: Google, or an emailed sign-in link.
 * No passwords, so there is nothing to forget or leak.
 */
export function SignInDialog({
  open,
  reason,
  enabled,
  onClose,
}: {
  open: boolean;
  reason?: string;
  enabled: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const titleId = useId();
  const errorId = useId();

  useEffect(() => {
    if (!open) return;
    setState("idle");
    setError("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Back to the page the visitor was on once the session is made.
  const callback = () => {
    const here = window.location.pathname.slice(BASE_PATH.length) || "/";
    return `${window.location.origin}${BASE_PATH}/auth/callback?next=${encodeURIComponent(here + window.location.search)}`;
  };

  async function google() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback() },
    });
    if (error) {
      setState("error");
      setError("Google sign-in isn't available right now. Try the email link instead.");
    }
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setState("error");
      setError("Enter an email address like name@studio.com.");
      return;
    }
    setState("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callback() },
    });
    if (error) {
      setState("error");
      setError(
        error.status === 429
          ? "Too many links sent. Wait a minute, then try again."
          : "Couldn't send the link. Check the address and try again.",
      );
      return;
    }
    setState("sent");
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-[16px]" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        aria-label="Close sign in"
        onClick={onClose}
        className="animate-[fade-in_200ms_var(--ease-out-strong)_both] absolute inset-0 cursor-default"
        style={{ backgroundColor: "rgba(20,18,16,0.24)" }}
      />
      <div
        className="animate-pop-in relative flex w-full max-w-[380px] flex-col items-center gap-[20px] rounded-[14px] border px-[28px] pb-[24px] pt-[32px]"
        style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--line)", boxShadow: "var(--shadow-overlay)" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="control-quiet absolute right-[12px] top-[12px] flex size-[28px] items-center justify-center rounded-[8px]"
          style={{ backgroundColor: "var(--control-bg)", color: "var(--control-fg)" }}
        >
          <X size={16} strokeWidth={1.875} />
        </button>

        <span className="flex size-[44px] items-center justify-center rounded-full border" style={{ borderColor: "var(--line)" }}>
          <Icon name="logo" size={20} color="var(--ink)" className="h-[17px] w-[20px]" />
        </span>

        <div className="flex flex-col items-center gap-[6px] text-center">
          <h2 id={titleId} className="text-[18px] font-medium tracking-[-0.18px]" style={{ color: "var(--ink-title)" }}>
            {state === "sent" ? "Check your inbox" : "Join Rekt Studio"}
          </h2>
          <p className="text-[13px]" style={{ color: "var(--ink-2)" }}>
            {state === "sent"
              ? `We sent a sign-in link to ${email.trim()}. Open it on this device to continue.`
              : (reason ?? "Save what you like and unlock Pro components.")}
          </p>
        </div>

        {!enabled ? (
          <p className="w-full rounded-[10px] px-[12px] py-[10px] text-center text-[13px]" style={{ backgroundColor: "var(--surface)", color: "var(--ink-2)" }}>
            Accounts aren&apos;t switched on yet. Everything stays open to browse in the meantime.
          </p>
        ) : state === "sent" ? (
          <div className="flex w-full flex-col items-center gap-[12px]">
            <MailCheck size={28} strokeWidth={1.5} style={{ color: "var(--green)" }} aria-hidden="true" />
            <button
              type="button"
              onClick={() => setState("idle")}
              className="link-quiet text-[13px] underline underline-offset-2"
              style={{ color: "var(--control-fg)" }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-[12px]">
            <button
              type="button"
              onClick={google}
              className="control flex h-[40px] w-full items-center justify-center gap-[8px] rounded-[10px] border text-[13px] font-medium active:scale-[0.98]"
              style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)", color: "var(--ink)" }}
            >
              <GoogleMark />
              Continue with Google
            </button>

            <div className="flex items-center gap-[8px] text-[12px]" style={{ color: "var(--ink-3)" }}>
              <span className="h-px flex-1" style={{ backgroundColor: "var(--line)" }} />
              or
              <span className="h-px flex-1" style={{ backgroundColor: "var(--line)" }} />
            </div>

            <form onSubmit={sendLink} noValidate className="flex flex-col gap-[8px]">
              <label htmlFor="signin-email" className="text-[12px] font-medium" style={{ color: "var(--ink-2)" }}>
                Email
              </label>
              <input
                ref={inputRef}
                id="signin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                aria-invalid={state === "error"}
                aria-describedby={state === "error" ? errorId : undefined}
                placeholder="name@studio.com"
                className="h-[40px] w-full rounded-[10px] border px-[12px] text-[13px] outline-none focus-visible:border-[var(--focus)]"
                style={{ backgroundColor: "var(--field)", borderColor: state === "error" ? "var(--red)" : "var(--line)", color: "var(--ink)" }}
              />
              {state === "error" ? (
                <p id={errorId} className="text-[12px]" style={{ color: "var(--red)" }}>
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={state === "sending"}
                className="mt-[4px] h-[40px] w-full rounded-[10px] text-[13px] font-medium transition-transform active:scale-[0.98] disabled:opacity-60"
                style={{ backgroundColor: "var(--ink)", color: "var(--bg)" }}
              >
                {state === "sending" ? "Sending link…" : "Email me a sign-in link"}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-[11.5px]" style={{ color: "var(--ink-3)" }}>
          By continuing you agree to the Terms and Privacy notice.
        </p>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
