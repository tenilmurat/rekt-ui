"use client";

import { useSession } from "@/lib/session";

/** Shared frame for signed-in pages: a title, then either the page or a prompt to sign in. */
export function AccountGate({
  title,
  lead,
  signedOutText,
  children,
}: {
  title: string;
  lead?: string;
  signedOutText: string;
  children: React.ReactNode;
}) {
  const { status, openSignIn } = useSession();

  return (
    <main className="mx-auto w-full max-w-[1200px] px-[24px] pb-[120px] pt-[64px]">
      <header className="animate-fade-up mb-[32px] flex flex-col gap-[8px]">
        <h1 className="text-[32px] font-medium leading-[1.15] tracking-[-0.64px]" style={{ color: "var(--ink-title)" }}>
          {title}
        </h1>
        {lead ? (
          <p className="text-[14px]" style={{ color: "var(--ink-2)" }}>
            {lead}
          </p>
        ) : null}
      </header>

      {status === "loading" ? (
        <p className="text-[13px]" style={{ color: "var(--ink-3)" }} role="status">
          Loading your account…
        </p>
      ) : status === "signed-in" ? (
        children
      ) : (
        <div
          className="flex max-w-[480px] flex-col items-start gap-[12px] rounded-[14px] border p-[24px]"
          style={{ borderColor: "var(--line)", backgroundColor: "var(--surface)" }}
        >
          <p className="text-[14px]" style={{ color: "var(--ink)" }}>
            {signedOutText}
          </p>
          <button
            type="button"
            onClick={() => openSignIn()}
            className="h-[34px] rounded-[8px] px-[14px] text-[13px] font-medium transition-transform active:scale-[0.96]"
            style={{ backgroundColor: "var(--ink)", color: "var(--bg)" }}
          >
            Sign in
          </button>
        </div>
      )}
    </main>
  );
}
