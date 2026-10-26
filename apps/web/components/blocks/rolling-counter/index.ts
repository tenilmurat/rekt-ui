import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { rollingCounterMeta } from "./meta";
import { RollingCounter } from "./RollingCounter";
import "./RollingCounter.css";

/**
 * The reference component: how every Rekt UI component is put together. Its
 * folder holds exactly the files a visitor takes home (RollingCounter.tsx and
 * RollingCounter.css); meta.ts describes it, and this file joins the two.
 */
export const rollingCounter: UiBlock = {
  ...rollingCounterMeta,
  component: RollingCounter as ComponentType<ControlValues>,
};
