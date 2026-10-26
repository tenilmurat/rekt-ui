import type { Metadata } from "next";
import { Check } from "lucide-react";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing — Rekt Studio",
  description: "Free to browse. Pro unlocks every component with its full source.",
};

const FAQ = [
  {
    q: "What do I get with Pro?",
    a: "Every Pro component with its full source and usage, plus every component added while your plan is active. Previews stay open to everyone.",
  },
  {
    q: "Pro or Lifetime?",
    a: "Pro renews every year until you cancel. Lifetime is paid once, nothing renews, and new components keep coming.",
  },
  {
    q: "Can I use the components in client and commercial work?",
    a: "Yes — apps, sites, products and client work, with no credit needed. You can't resell or republish them as a kit or library of your own.",
  },
  {
    q: "Can I cancel?",
    a: "Any time, from Account & billing. Pro stays on until the end of the year you paid for, then stops.",
  },
  {
    q: "Who handles the payment?",
    a: "Paddle, our merchant of record. They take the payment, handle VAT and send your invoice. Card details never reach us.",
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-[1040px] px-[24px] pb-[120px] pt-[64px]">
      <header className="animate-fade-up mb-[40px] flex flex-col items-center gap-[10px] text-center">
        <h1 className="text-[32px] font-medium leading-[1.15] tracking-[-0.64px]" style={{ color: "var(--ink-title)" }}>
          Take every component with you
        </h1>
        <p className="max-w-[460px] text-[14px]" style={{ color: "var(--ink-2)" }}>
          Browsing is free. Pro unlocks the full source of every component, and everything added next.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3">
        {PLANS.map((plan) => {
          const featured = plan.id === "pro";
          return (
            <section
              key={plan.id}
              aria-labelledby={`plan-${plan.id}`}
              className="flex flex-col gap-[20px] rounded-[14px] border p-[24px]"
              style={{
                backgroundColor: featured ? "var(--surface)" : "var(--bg)",
                borderColor: featured ? "var(--line-strong)" : "var(--line)",
              }}
            >
              <div className="flex flex-col gap-[8px]">
                <div className="flex items-center gap-[8px]">
                  <h2 id={`plan-${plan.id}`} className="text-[15px] font-medium" style={{ color: "var(--ink-title)" }}>
                    {plan.name}
                  </h2>
                  {plan.note ? (
                    <span className="rounded-full border px-[8px] py-[1px] text-[11.5px]" style={{ borderColor: "var(--line-strong)", color: "var(--ink-2)" }}>
                      {plan.note}
                    </span>
                  ) : null}
                </div>
                <p className="flex items-baseline gap-[6px]">
                  <span className="text-[32px] font-medium tracking-[-0.64px]" style={{ color: "var(--ink-title)" }}>
                    {plan.price}
                  </span>
                  <span className="text-[13px]" style={{ color: "var(--ink-3)" }}>
                    {plan.cadence}
                  </span>
                </p>
                <p className="text-[13px]" style={{ color: "var(--ink-2)" }}>
                  {plan.summary}
                </p>
              </div>

              <CheckoutButton plan={plan} featured={featured} />

              <ul className="flex flex-col gap-[8px]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-[8px] text-[13px]" style={{ color: "var(--ink)" }}>
                    <Check size={14} strokeWidth={2} aria-hidden="true" style={{ color: "var(--green)" }} />
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="mt-[16px] text-center text-[12px]" style={{ color: "var(--ink-3)" }}>
        Prices in euro, VAT added at checkout where it applies. 14-day refunds.
      </p>

      <section aria-labelledby="faq" className="mx-auto mt-[80px] max-w-[640px]">
        <h2 id="faq" className="mb-[16px] text-[15px] font-medium" style={{ color: "var(--ink-title)" }}>
          Questions
        </h2>
        <div className="flex flex-col border-t" style={{ borderColor: "var(--line)" }}>
          {FAQ.map((item) => (
            <details key={item.q} className="group border-b py-[14px]" style={{ borderColor: "var(--line)" }}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-[16px] text-[14px]" style={{ color: "var(--ink)" }}>
                {item.q}
                <span aria-hidden="true" className="text-[16px] transition-transform group-open:rotate-45" style={{ color: "var(--ink-3)" }}>
                  +
                </span>
              </summary>
              <p className="mt-[8px] text-[13px] leading-[1.6]" style={{ color: "var(--ink-2)" }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
