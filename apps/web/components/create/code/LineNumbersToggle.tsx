"use client";

import { ListOrdered } from "lucide-react";
import { Segmented } from "@/components/create/controls/Segmented";

export function LineNumbersToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <Segmented
      label="Line Numbers"
      icon={<ListOrdered size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />}
      value={value ? "on" : "off"}
      onChange={(id) => onChange(id === "on")}
      options={[
        { id: "on", label: "On" },
        { id: "off", label: "Off" },
      ]}
    />
  );
}
