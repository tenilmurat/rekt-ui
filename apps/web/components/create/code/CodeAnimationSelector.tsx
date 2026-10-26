"use client";

import { Sparkles } from "lucide-react";
import { Segmented } from "@/components/create/controls/Segmented";
import { ANIMATIONS, type AnimationId } from "@/lib/create/code/animation";

export function CodeAnimationSelector({
  value,
  onChange,
}: {
  value: AnimationId;
  onChange: (id: AnimationId) => void;
}) {
  return (
    <Segmented
      label="Animation"
      icon={<Sparkles size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />}
      value={value}
      onChange={onChange}
      options={ANIMATIONS.map((a) => ({ id: a.id, label: a.label }))}
    />
  );
}
