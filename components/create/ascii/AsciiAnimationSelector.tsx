"use client";

import { Sparkles } from "lucide-react";
import { Segmented } from "@/components/create/controls/Segmented";
import { ASCII_ANIMATIONS, type AsciiAnimationId } from "@/lib/create/ascii/animation";

export function AsciiAnimationSelector({
  value,
  onChange,
}: {
  value: AsciiAnimationId;
  onChange: (id: AsciiAnimationId) => void;
}) {
  return (
    <Segmented
      label="Animation"
      icon={<Sparkles size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />}
      value={value}
      onChange={onChange}
      options={ASCII_ANIMATIONS.map((a) => ({ id: a.id, label: a.label }))}
    />
  );
}
