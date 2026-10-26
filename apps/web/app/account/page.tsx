"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AccountGate } from "@/components/site/AccountGate";
import { api } from "@/lib/api";
import { getPlan } from "@/lib/plans";
import { useSession } from "@/lib/session";
import { useToast } from "@/lib/toast";

export default function AccountPage() {
  return (
    <AccountGate title="Account & billing" signedOutText="Sign in to manage your account and plan.">
      <AccountDetails />
    </AccountGate>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

function AccountDetails() {
  const { account, plan, planStatus, periodEnd, signOut } = useSession();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState<"portal" | "delete" | null>(null);
  const [confirming, setConfirming] = useState(false);
  if (!account) return null;

  const current = getPlan(plan);
  const renews = plan === "pro" && periodEnd ? dateFormat.format(new Date(periodEnd)) : null;
  // A paid plan that has lapsed still has a billing history in the portal.
  const hasBilling = plan !== "free" || Boolean(planStatus);

  async function openPortal() {
    setBusy("portal");
    try {
      const { url } = await api<{ url: string }>("/billing/portal", { method: "POST" });
      window.location.href = url;
    } catch (error) {
      setBusy(null);
      toast(error instanceof Error ? error.message : "Billing is unavailable right now", "warn");
    }
  }

  async function deleteAccount() {
    setBusy("delete");
    try {
      await api("/account", { method: "DELETE" });
    } catch (error) {
      setBusy(null);
      toast(error instanceof Error ? error.message : "Couldn't delete the account — try again", "warn");
      return;
    }
    await signOut();
    router.replace("/");
  }

  return (
    <div className="flex max-w-[560px] flex-col gap-[16px]">
      <Card title="Profile">
        <Row label="Email" value={account.email} />
        {account.name ? <Row label="Name" value={account.name} /> : null}
      </Card>

      <Card title="Plan">
        <Row
          label="Current plan"
          value={
            plan === "lifetime"
              ? "Lifetime — paid once"
              : plan === "pro"
                ? `Pro${renews ? ` — ${planStatus === "canceled" ? "ends" : "renews"} ${renews}` : ""}`
                : "Free"
          }
        />
        {planStatus === "past_due" ? (
          <p className="text-[12px]" style={{ color: "var(--orange)" }}>
            The last payment didn&apos;t go through. Update your card in billing to keep Pro.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-[8px] pt-[4px]">
          {plan === "free" ? (
            <Link href="/pricing" className="h-[34px] rounded-[8px] px-[14px] text-[13px] font-medium leading-[34px] transition-transform active:scale-[0.96]" style={{ backgroundColor: "var(--ink)", color: "var(--bg)" }}>
              Get {getPlan("pro").name}
            </Link>
          ) : null}
          {hasBilling ? (
            <button type="button" onClick={openPortal} disabled={busy !== null} className="control h-[34px] rounded-[8px] border px-[14px] text-[13px] font-medium active:scale-[0.96] disabled:opacity-50" style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)", color: "var(--ink)" }}>
              {busy === "portal" ? "Opening…" : "Invoices, card and cancelling"}
            </button>
          ) : null}
        </div>
        <p className="text-[12px]" style={{ color: "var(--ink-3)" }}>
          {current.id === "free"
            ? "Payments go through Paddle, who handle VAT and invoices."
            : "Billing opens Paddle's customer portal in this tab."}
        </p>
      </Card>

      <Card title="Session">
        <div>
          <button type="button" onClick={() => void signOut()} className="control h-[34px] rounded-[8px] border px-[14px] text-[13px] font-medium active:scale-[0.96]" style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)", color: "var(--ink)" }}>
            Sign out
          </button>
        </div>
      </Card>

      <Card title="Delete account">
        <p className="text-[13px]" style={{ color: "var(--ink-2)" }}>
          Removes your account, saved items and plan for good.
          {plan === "pro" ? " Your Pro plan is cancelled straight away, with no further charges." : ""}
        </p>
        {confirming ? (
          <div className="flex flex-wrap items-center gap-[8px]">
            <button type="button" onClick={deleteAccount} disabled={busy !== null} className="h-[34px] rounded-[8px] px-[14px] text-[13px] font-medium transition-transform active:scale-[0.96] disabled:opacity-50" style={{ backgroundColor: "var(--red)", color: "#fff" }}>
              {busy === "delete" ? "Deleting…" : "Yes, delete my account"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="control-quiet h-[34px] rounded-[8px] px-[14px] text-[13px]" style={{ backgroundColor: "var(--control-bg)", color: "var(--control-fg)" }}>
              Keep it
            </button>
          </div>
        ) : (
          <div>
            <button type="button" onClick={() => setConfirming(true)} className="control h-[34px] rounded-[8px] border px-[14px] text-[13px] font-medium active:scale-[0.96]" style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)", color: "var(--red)" }}>
              Delete account…
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[10px] rounded-[14px] border p-[20px]" style={{ borderColor: "var(--line)" }}>
      <h2 className="text-[13px] font-medium" style={{ color: "var(--ink-title)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-[16px] text-[13px]">
      <span style={{ color: "var(--ink-2)" }}>{label}</span>
      <span className="truncate" style={{ color: "var(--ink)" }}>
        {value}
      </span>
    </p>
  );
}
