import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { BubbleMenu } from "./BubbleMenu";
import { bubbleMenuMeta } from "./meta";
import "./BubbleMenu.css";

export const bubbleMenu: UiBlock = {
  ...bubbleMenuMeta,
  component: BubbleMenu as ComponentType<ControlValues>,
};
