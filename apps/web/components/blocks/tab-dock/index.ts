import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { TabDock } from "./TabDock";
import { tabDockMeta } from "./meta";
import "./TabDock.css";

export const tabDock: UiBlock = {
  ...tabDockMeta,
  component: TabDock as ComponentType<ControlValues>,
};
