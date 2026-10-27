import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { ContentsMarker } from "./ContentsMarker";
import { contentsMarkerMeta } from "./meta";
import "./ContentsMarker.css";

export const contentsMarker: UiBlock = {
  ...contentsMarkerMeta,
  component: ContentsMarker as ComponentType<ControlValues>,
};
