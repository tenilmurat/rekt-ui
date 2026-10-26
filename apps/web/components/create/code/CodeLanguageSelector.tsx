"use client";

import { Braces } from "lucide-react";
import { Segmented } from "@/components/create/controls/Segmented";
import { LANGUAGES, type LanguageId } from "@/lib/create/code/languages";

export function CodeLanguageSelector({
  value,
  onChange,
}: {
  value: LanguageId;
  onChange: (id: LanguageId) => void;
}) {
  return (
    <Segmented
      label="Language"
      icon={<Braces size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />}
      value={value}
      onChange={onChange}
      options={LANGUAGES.map((l) => ({ id: l.id, label: l.label }))}
    />
  );
}
