import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { ExplodingInput } from "./ExplodingInput";
import { explodingInputMeta } from "./meta";
import "./ExplodingInput.css";

export const explodingInput: UiBlock = {
  ...explodingInputMeta,
  component: ExplodingInput as ComponentType<ControlValues>,
};
