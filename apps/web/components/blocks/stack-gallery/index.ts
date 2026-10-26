import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { StackGallery } from "./StackGallery";
import { stackGalleryMeta } from "./meta";
import "./StackGallery.css";

export const stackGallery: UiBlock = {
  ...stackGalleryMeta,
  component: StackGallery as ComponentType<ControlValues>,
};
