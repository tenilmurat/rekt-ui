import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { IconBurst } from "./IconBurst";
import { iconBurstMeta } from "./meta";
import "./IconBurst.css";

export const iconBurst: UiBlock = {
  ...iconBurstMeta,
  component: IconBurst as ComponentType<ControlValues>,
};
