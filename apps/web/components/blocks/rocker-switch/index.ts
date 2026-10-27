import type { ComponentType } from "react";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { RockerSwitch } from "./RockerSwitch";
import { rockerSwitchMeta } from "./meta";
import "./RockerSwitch.css";

export const rockerSwitch: UiBlock = {
  ...rockerSwitchMeta,
  component: RockerSwitch as ComponentType<ControlValues>,
};
