"use client";

import { Grid2x2 } from "lucide-react";
import { columnsForDensity } from "@/lib/create/ascii/ascii";

export const DENSITY = { min: 0.15, max: 1, step: 0.05, default: 0.6 } as const;

/** One slider: how many characters the grid gets across. */
export function DensityControl({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center gap-[8px]">
        <Grid2x2 size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />
        <label htmlFor="rekt-ascii-density" className="text-[12px] tracking-[-0.12px]" style={{ color: "var(--ink-3)" }}>
          Density
        </label>
        <span className="font-mono text-[12px]" style={{ color: "var(--ink-2)" }}>
          {columnsForDensity(value)} cols
        </span>
      </div>

      <input
        id="rekt-ascii-density"
        type="range"
        min={DENSITY.min}
        max={DENSITY.max}
        step={DENSITY.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${columnsForDensity(value)} columns`}
        className="h-[20px] w-full max-w-[220px] cursor-pointer"
        style={{ accentColor: "var(--ink)" }}
      />
    </div>
  );
}
