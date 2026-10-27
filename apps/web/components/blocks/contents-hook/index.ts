import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { ContentsHook } from "./ContentsHook";
import { contentsHookMeta } from "./meta";
import "./ContentsHook.css";

export const contentsHook: UiBlock = {
  ...contentsHookMeta,
  component: ContentsHook as ComponentType<ControlValues>,
};
