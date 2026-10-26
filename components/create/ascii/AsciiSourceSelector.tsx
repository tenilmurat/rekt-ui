"use client";

import { Shapes } from "lucide-react";
import { Segmented } from "@/components/create/controls/Segmented";
import type { AsciiSourceType } from "@/lib/create/ascii/snippet";

export function AsciiSourceSelector({
  value,
  onChange,
}: {
  value: AsciiSourceType;
  onChange: (id: AsciiSourceType) => void;
}) {
  return (
    <Segmented
      label="Source"
      icon={<Shapes size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />}
      value={value}
      onChange={onChange}
      options={[
        { id: "logo", label: "Logo" },
        { id: "image", label: "Image" },
      ]}
    />
  );
}
