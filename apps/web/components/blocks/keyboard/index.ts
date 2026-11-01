import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { Keyboard } from "./Keyboard";
import { keyboardMeta } from "./meta";
import "./Keyboard.css";

export const keyboard: UiBlock = {
  ...keyboardMeta,
  component: Keyboard as ComponentType<ControlValues>,
};
