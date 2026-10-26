"use client";

import { Gauge } from "lucide-react";
import { SPEED } from "@/lib/create/code/animation";

/** One slider for every animation; each tool maps the value to its own rates. */
export function SpeedControl({
  value,
  onChange,
  id = "rekt-speed",
}: {
  value: number;
  onChange: (n: number) => void;
  id?: string;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center gap-[8px]">
        <Gauge size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />
        <label htmlFor={id} className="text-[12px] tracking-[-0.12px]" style={{ color: "var(--ink-3)" }}>
          Speed
        </label>
        <span className="font-mono text-[12px]" style={{ color: "var(--ink-2)" }}>
          {value.toFixed(2)}×
        </span>
      </div>

      <input
        id={id}
        type="range"
        min={SPEED.min}
        max={SPEED.max}
        step={SPEED.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${value.toFixed(2)} times`}
        className="h-[20px] w-full max-w-[220px] cursor-pointer"
        style={{ accentColor: "var(--ink)" }}
      />
    </div>
  );
}
