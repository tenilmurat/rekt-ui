import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { RollingCounter } from "./RollingCounter";
import "./RollingCounter.css";

/**
 * The reference component: how every Rekt UI component is put together. Its
 * folder holds exactly the files a visitor takes home (RollingCounter.tsx and
 * RollingCounter.css); this file only describes it for the site.
 */
export const rollingCounter: UiBlock = {
  id: "rolling-counter",
  title: "Rolling counter",
  description:
    "A number whose digits roll to their new value like a mechanical counter. Press +1 to step it, or switch Auto on to have it count by itself.",
  category: "text",
  component: RollingCounter as ComponentType<ControlValues>,
  name: "RollingCounter",
  files: ["RollingCounter.tsx", "RollingCounter.css"],
  dependencies: [],
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
    "Each digit is a window one line tall with a reel of 0–9 behind it. A new value moves the reel with translateY(-digit × 10%), and a 600ms strong ease-out makes it settle like a dial. Columns are keyed from the right, so when the number gains a digit the existing reels keep rolling instead of jumping. The visible digits are hidden from screen readers; a visually hidden copy of the number is read instead, and reduced motion turns the roll off.",
  cardHeight: 300,
};
