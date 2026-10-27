import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { MorphLoader } from "./MorphLoader";
import { morphLoaderMeta } from "./meta";
import "./MorphLoader.css";

export const morphLoader: UiBlock = {
  ...morphLoaderMeta,
  component: MorphLoader as ComponentType<ControlValues>,
};
