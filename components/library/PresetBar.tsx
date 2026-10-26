"use client";

import type { ComponentPreset } from "@/lib/registry/types";

/** Quick presets, bottom-centre of every preview. */
export function PresetBar({
  presets,
  activeId,
  onSelect,
  label,
}: {
  presets: ComponentPreset[];
  activeId: string;
  onSelect: (id: string) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={`${label} presets`}
      className="no-scrollbar flex max-w-full items-center gap-[4px] overflow-x-auto rounded-[10px] p-[3px]"
    >
      {presets.map((preset) => {
        const active = preset.id === activeId;
        return (
          <button
            key={preset.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(preset.id)}
            className="control-quiet on-canvas shrink-0 rounded-[8px] px-[10px] py-[5px] text-[12px] font-medium active:scale-[0.96]"
            style={{
              backgroundColor: active ? "var(--surface-raised)" : "var(--control-bg)",
              color: active ? "var(--ink)" : "var(--control-fg)",
              boxShadow: active ? "var(--shadow-raised)" : undefined,
            }}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
