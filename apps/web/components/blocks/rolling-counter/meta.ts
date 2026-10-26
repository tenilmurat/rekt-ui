import type { UiBlockMeta } from "@/lib/ui/types";

/**
 * Rolling counter, described for the site: the wall, the dialog and the
 * registry (/r/rolling-counter.json) all read this. Plain data only, so the
 * server can read it without loading the component.
 */
export const rollingCounterMeta: UiBlockMeta = {
  id: "rolling-counter",
  title: "Rolling counter",
  description:
    "A number whose digits roll to their new value like a mechanical counter. Press plus or minus to step it, or switch Auto on to have it count up by itself.",
  category: "text",
  name: "RollingCounter",
  files: ["RollingCounter.tsx", "RollingCounter.css"],
  dependencies: ["lucide-react"],
  controls: [
    {
      type: "segmented",
      prop: "fill",
      label: "Fill",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ],
      default: "dark",
    },
    { type: "toggle", prop: "auto", label: "Auto", default: false },
    { type: "slider", prop: "every", label: "Every", min: 0.5, max: 6, step: 0.5, unit: "s", default: 2 },
  ],
  howItWorks:
    "Each digit is a window one line tall with a reel of 0–9 behind it. A new value moves the reel with translateY(-digit × 10%), and a 600ms strong ease-out makes it settle like a dial. Columns are keyed from the right, so when the number gains a digit the existing reels keep rolling instead of jumping. Counting down rolls the reels back the other way; minus stops at 0. The plus and minus icons are Lucide (lucide-react). The visible digits are hidden from screen readers; a visually hidden copy of the number is read instead, and reduced motion turns the roll off.",
  cardHeight: 300,
};
