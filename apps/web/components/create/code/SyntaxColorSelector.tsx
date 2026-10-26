"use client";

import { Palette } from "lucide-react";
import { Segmented } from "@/components/create/controls/Segmented";
import { ACCENTS, accentHex, type AccentId } from "@/lib/create/code/palette";

/**
 * One accent, not a token-by-token palette. Custom opens a single colour input;
 * everything else (strings, numbers, functions, properties) is derived from it
 * in lib/create/code/palette.ts.
 */
export function SyntaxColorSelector({
  value,
  custom,
  onChange,
  onCustomChange,
}: {
  value: AccentId;
  custom: string;
  onChange: (id: AccentId) => void;
  onCustomChange: (hex: string) => void;
}) {
  return (
    <Segmented
      label="Syntax Color"
      icon={<Palette size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />}
      value={value}
      onChange={onChange}
      options={ACCENTS.map((accent) => ({
        id: accent.id,
        label: accent.label,
        adornment: (
          <span
            aria-hidden="true"
            className="size-[10px] shrink-0 rounded-full"
            style={{
              backgroundColor: accent.id === "custom" ? custom : accent.hex,
              boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.12)",
            }}
          />
        ),
      }))}
      trailing={
        value === "custom" ? (
          <span className="flex items-center gap-[6px]">
            <label htmlFor="rekt-code-accent" className="sr-only">
              Custom syntax accent colour
            </label>
            <input
              id="rekt-code-accent"
              type="color"
              value={custom}
              onChange={(e) => onCustomChange(e.target.value)}
              className="control size-[22px] rounded-[6px] border p-0"
              style={{ borderColor: "var(--control-line)", backgroundColor: "var(--control-bg)" }}
            />
            <span className="font-mono text-[12px] uppercase" style={{ color: "var(--ink-2)" }}>
              {accentHex("custom", custom)}
            </span>
          </span>
        ) : null
      }
    />
  );
}
