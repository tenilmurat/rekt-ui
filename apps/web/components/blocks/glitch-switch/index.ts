import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { GlitchSwitch } from "./GlitchSwitch";
import { glitchSwitchMeta } from "./meta";
import "./GlitchSwitch.css";

export const glitchSwitch: UiBlock = {
  ...glitchSwitchMeta,
  component: GlitchSwitch as ComponentType<ControlValues>,
};
