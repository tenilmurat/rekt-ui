import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { SurpriseButton } from "./SurpriseButton";
import { surpriseButtonMeta } from "./meta";
import "./SurpriseButton.css";

export const surpriseButton: UiBlock = {
  ...surpriseButtonMeta,
  component: SurpriseButton as ComponentType<ControlValues>,
};
