"use client";

import { FileCode2 } from "lucide-react";
import { Segmented } from "@/components/create/controls/Segmented";

export type CodeSource = "example" | "paste";

export function CodeSourceSelector({
  value,
  onChange,
}: {
  value: CodeSource;
  onChange: (id: CodeSource) => void;
}) {
  return (
    <Segmented
      label="Code Source"
      icon={<FileCode2 size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />}
      value={value}
      onChange={onChange}
      options={[
        { id: "example", label: "Generate Example" },
        { id: "paste", label: "Paste My Code" },
      ]}
    />
  );
}
