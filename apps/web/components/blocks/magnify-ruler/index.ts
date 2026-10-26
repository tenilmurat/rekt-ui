import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { MagnifyRuler } from "./MagnifyRuler";
import { magnifyRulerMeta } from "./meta";
import "./MagnifyRuler.css";

export const magnifyRuler: UiBlock = {
  ...magnifyRulerMeta,
  component: MagnifyRuler as ComponentType<ControlValues>,
};
