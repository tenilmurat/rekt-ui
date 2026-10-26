"use client";

import { Sparkles } from "lucide-react";
import { Segmented } from "@/components/create/controls/Segmented";
import { ICON_ANIMATIONS, type IconAnimationId } from "@/lib/create/icon/animation";

export function IconAnimationSelector({
  value,
  onChange,
}: {
  value: IconAnimationId;
  onChange: (id: IconAnimationId) => void;
}) {
  return (
    <Segmented
      label="Animation"
      icon={<Sparkles size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />}
      value={value}
      onChange={onChange}
      options={ICON_ANIMATIONS.map((a) => ({ id: a.id, label: a.label }))}
    />
  );
}
