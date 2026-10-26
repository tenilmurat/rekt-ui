/**
 * What the Pricing page sells. Prices here are what the page shows; what is
 * actually charged comes from the Paddle price ids, so change both together.
 */
export type PlanId = "free" | "pro" | "lifetime";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  summary: string;
  features: string[];
  /** Paddle price id; free has none. */
  priceId?: string;
  /** Shown as a small tag beside the name. */
  note?: string;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "€0",
    cadence: "forever",
    summary: "Browse everything, take the free components, keep what you like.",
    features: ["Every preview, live", "Free components with code", "Good designs of X", "Bookmarks"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "€79",
    cadence: "/ year",
    summary: "Every component with its full source, and everything added while you're on Pro.",
    features: [
      "Everything in Free",
      "Every Pro component",
      "Full source and usage",
      "New components as they land",
    ],
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO,
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "€149",
    cadence: "once",
    summary: "Everything in Pro, paid once. Nothing renews.",
    features: ["Everything in Pro", "Yours for life", "All future components"],
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME,
    note: "Pay once",
  },
];

export const getPlan = (id: PlanId) => PLANS.find((p) => p.id === id)!;

/** Paddle statuses that still unlock Pro. A cancelled plan stays active until its period ends. */
export const ACTIVE_STATUSES = ["active", "trialing", "past_due"];
