import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { PulseDial } from "./PulseDial";
import { pulseDialMeta } from "./meta";
import "./PulseDial.css";

export const pulseDial: UiBlock = {
  ...pulseDialMeta,
  component: PulseDial as ComponentType<ControlValues>,
};
