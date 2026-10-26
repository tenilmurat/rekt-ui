"use client";

import { useState } from "react";
import { ChevronDown, Shapes } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { LucideIconPicker } from "@/components/create/ascii/LucideIconPicker";
import { ANIMATE_ICONS, iconLabel as label } from "@/lib/create/icon/icons";

/** The Icon row: current icon, and the Lucide picker behind it. */
export function IconPickerButton({
  icon,
  onChange,
}: {
  icon: string | null;
  onChange: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center gap-[8px]">
        <Shapes size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />
        <p className="text-[12px] tracking-[-0.12px]" style={{ color: "var(--ink-3)" }}>
          Icon
        </p>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="control flex w-full max-w-[220px] items-center justify-between gap-[8px] rounded-[8px] border px-[10px] py-[6px] text-[12px] font-medium"
        style={{
          backgroundColor: "var(--control-bg)",
          borderColor: "var(--control-line)",
          color: "var(--ink)",
        }}
      >
        <span className="flex items-center gap-[8px] truncate">
          {icon ? <DynamicIcon name={icon as IconName} size={14} strokeWidth={1.75} /> : null}
          {icon ? label(icon) : "Choose Icon"}
        </span>
        <ChevronDown size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />
      </button>

      <LucideIconPicker
        open={open}
        names={ANIMATE_ICONS}
        title="Choose an animated icon"
        selected={icon}
        onCancel={() => setOpen(false)}
        onUse={(name) => {
          onChange(name);
          setOpen(false);
        }}
      />
    </div>
  );
}
