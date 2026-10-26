"use client";

import { Type } from "lucide-react";
import { CHARACTER_SETS, type CharacterSetId } from "@/lib/create/ascii/charsets";

/**
 * One dropdown, in the same chrome as the segmented controls. The custom field
 * only appears when Custom is chosen.
 */
export function CharacterSetSelector({
  value,
  custom,
  onChange,
  onCustomChange,
}: {
  value: CharacterSetId;
  custom: string;
  onChange: (id: CharacterSetId) => void;
  onCustomChange: (chars: string) => void;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center gap-[8px]">
        <Type size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />
        <label
          htmlFor="rekt-ascii-charset"
          className="text-[12px] tracking-[-0.12px]"
          style={{ color: "var(--ink-3)" }}
        >
          Character Set
        </label>
      </div>

      <select
        id="rekt-ascii-charset"
        value={value}
        onChange={(e) => onChange(e.target.value as CharacterSetId)}
        className="control w-full max-w-[220px] rounded-[8px] border px-[10px] py-[6px] text-[12px] font-medium"
        style={{
          backgroundColor: "var(--control-bg)",
          borderColor: "var(--control-line)",
          color: "var(--ink)",
        }}
      >
        {CHARACTER_SETS.map((set) => (
          <option key={set.id} value={set.id}>
            {set.label}
          </option>
        ))}
      </select>

      {value === "custom" ? (
        <div className="flex flex-col gap-[6px]">
          <label
            htmlFor="rekt-ascii-custom"
            className="text-[12px] tracking-[-0.12px]"
            style={{ color: "var(--ink-3)" }}
          >
            Custom Characters
          </label>
          <input
            id="rekt-ascii-custom"
            value={custom}
            onChange={(e) => onCustomChange(e.target.value)}
            spellCheck={false}
            placeholder="@#%01ABC█▒"
            className="w-full max-w-[220px] rounded-[8px] border px-[10px] py-[6px] font-mono text-[12px]"
            style={{
              backgroundColor: "var(--surface-raised)",
              borderColor: "var(--line)",
              color: "var(--ink)",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
