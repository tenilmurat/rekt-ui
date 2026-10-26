"use client";

import type { ReactNode } from "react";

export type SegmentedOption<T extends string> = { id: T; label: string; adornment?: ReactNode };

/**
 * The control pattern for this tool: a labelled row of pills built from the same
 * chrome as the rest of the app — 8px radius, hairline border, .control hover.
 * Pills wrap on narrow screens; each one is a plain button, so Tab reaches it
 * and the global focus ring applies.
 */
export function Segmented<T extends string>({
  label,
  icon,
  options,
  value,
  onChange,
  trailing,
}: {
  label: string;
  /** Sits before the title, in the icon colour. */
  icon?: ReactNode;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (id: T) => void;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center gap-[8px]">
        {icon}
        <p className="text-[12px] tracking-[-0.12px]" style={{ color: "var(--ink-3)" }}>
          {label}
        </p>
        {trailing}
      </div>

      <div role="group" aria-label={label} className="flex flex-wrap items-center gap-[6px]">
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className="control flex items-center gap-[6px] rounded-[8px] border px-[10px] py-[6px] text-[12px] font-medium active:scale-[0.96]"
              style={{
                backgroundColor: active ? "var(--surface)" : "var(--control-bg)",
                borderColor: active ? "var(--line-strong)" : "var(--control-line)",
                color: active ? "var(--ink)" : "var(--ink-2)",
              }}
            >
              {option.adornment}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
