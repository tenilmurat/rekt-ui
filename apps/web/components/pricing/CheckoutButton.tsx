"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import type { Plan } from "@/lib/plans";
import { useSession } from "@/lib/session";
import { useToast } from "@/lib/toast";

const CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox";

let paddle: Promise<Paddle | undefined> | null = null;

/**
 * Opens Paddle's overlay checkout for a plan. The account id rides along as
 * customData, so the webhook knows whose plan to unlock. Signed out, it asks
 * for sign-in first so a payment can never land on no account.
 */
export function CheckoutButton({ plan, featured }: { plan: Plan; featured?: boolean }) {
  const { status, account, plan: current, openSignIn, refresh } = useSession();
  const { resolvedTheme } = useTheme();
  const toast = useToast();
  const [opening, setOpening] = useState(false);

  const base = "flex h-[40px] w-full items-center justify-center rounded-[10px] text-[13px] font-medium transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100";
  const style = featured
    ? { backgroundColor: "var(--ink)", color: "var(--bg)" }
    : { backgroundColor: "var(--surface)", color: "var(--ink)", boxShadow: "var(--shadow-hairline)" };

  if (plan.id === "free") {
    return (
      <Link href="/" className={base} style={style}>
        {current === "free" && status === "signed-in" ? "Your plan · Browse UI" : "Browse UI"}
      </Link>
    );
  }

  if (current !== "free") {
    return (
      <Link href="/account" className={base} style={style}>
        {current === plan.id ? "Your plan · Manage" : "Manage billing"}
      </Link>
    );
  }

  const ready = Boolean(CLIENT_TOKEN && plan.priceId);

  async function checkout() {
    if (status !== "signed-in" || !account) {
      openSignIn(`Sign in first, so ${plan.name} lands on your account.`);
      return;
    }
    setOpening(true);
    paddle ??= initializePaddle({
      token: CLIENT_TOKEN!,
      environment: ENVIRONMENT,
      eventCallback: (event) => {
        if (event.name === "checkout.completed") {
          toast("Payment received — unlocking Pro");
          // The webhook records the plan; give it a moment, then read it back.
          window.setTimeout(() => void refresh(), 2500);
          window.setTimeout(() => void refresh(), 8000);
        }
      },
    });
    const instance = await paddle;
    setOpening(false);
    if (!instance) {
      toast("Checkout couldn't load — check your connection and try again", "warn");
      return;
    }
    instance.Checkout.open({
      items: [{ priceId: plan.priceId!, quantity: 1 }],
      customer: { email: account.email },
      customData: { user_id: account.id },
      settings: { displayMode: "overlay", theme: resolvedTheme === "dark" ? "dark" : "light" },
    });
  }

  return (
    <button type="button" onClick={checkout} disabled={!ready || opening || status === "loading"} className={base} style={style}>
      {!ready ? "Checkout opens soon" : opening ? "Opening checkout…" : `Get ${plan.name}`}
    </button>
  );
}
