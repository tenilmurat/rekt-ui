"use client";

import { Crop } from "lucide-react";
import { Segmented } from "@/components/create/controls/Segmented";
import { RATIOS, type RatioId } from "@/lib/create/ratio/ratio";

export function RatioSelector({
  value,
  onChange,
}: {
  value: RatioId;
  onChange: (id: RatioId) => void;
}) {
  return (
    <Segmented
      label="Aspect Ratio"
      icon={<Crop size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />}
      value={value}
      onChange={onChange}
      options={RATIOS.map((r) => ({ id: r.id, label: r.label }))}
    />
  );
}
