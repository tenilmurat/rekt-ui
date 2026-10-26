"use client";

import { Contrast } from "lucide-react";
import { Segmented } from "@/components/create/controls/Segmented";

export function InvertToggle({ value, onChange }: { value: boolean; onChange: (on: boolean) => void }) {
  return (
    <Segmented
      label="Invert"
      icon={<Contrast size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />}
      value={value ? "on" : "off"}
      onChange={(id) => onChange(id === "on")}
      options={[
        { id: "on", label: "On" },
        { id: "off", label: "Off" },
      ]}
    />
  );
}
