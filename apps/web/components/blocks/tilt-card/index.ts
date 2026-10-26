import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { tiltCardMeta } from "./meta";
import { TiltCard } from "./TiltCard";
import "./TiltCard.css";

export const tiltCard: UiBlock = {
  ...tiltCardMeta,
  component: TiltCard as ComponentType<ControlValues>,
};
