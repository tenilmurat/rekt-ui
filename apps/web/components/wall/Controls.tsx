"use client";

import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { useId } from "react";
import type { ControlValues, UiControl } from "@/lib/ui/types";

/**
 * The knobs in the component dialog: segmented choices, icon grids, switches and sliders.
 * Each one sets one prop, which the preview and the Usage snippet both read.
 */
export function Controls({
  controls,
  values,
  onChange,
}: {
  controls: UiControl[];
  values: ControlValues;
  onChange: (prop: string, value: string | number | boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-[14px]">
      {controls.map((control) => {
        const value = values[control.prop];
        if (control.type === "segmented")
          return <Segmented key={control.prop} control={control} value={String(value)} onChange={(v) => onChange(control.prop, v)} />;
        if (control.type === "icons")
          return <Icons key={control.prop} control={control} value={String(value)} onChange={(v) => onChange(control.prop, v)} />;
        if (control.type === "toggle")
          return <Toggle key={control.prop} control={control} value={Boolean(value)} onChange={(v) => onChange(control.prop, v)} />;
        return <Slider key={control.prop} control={control} value={Number(value)} onChange={(v) => onChange(control.prop, v)} />;
      })}
    </div>
  );
}

function Row({ label, labelId, children }: { label: string; labelId: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[36px] items-center justify-between gap-[12px]">
      <span id={labelId} className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function Segmented({
  control,
  value,
  onChange,
}: {
  control: Extract<UiControl, { type: "segmented" }>;
  value: string;
  onChange: (value: string) => void;
}) {
  const labelId = useId();
  return (
    <Row label={control.label} labelId={labelId}>
      <div role="radiogroup" aria-labelledby={labelId} className="flex rounded-full p-[3px]" style={{ backgroundColor: "var(--hover-2)" }}>
        {control.options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className="h-[30px] rounded-full px-[12px] text-[13px] transition-colors"
              style={{
                backgroundColor: active ? "var(--surface-raised)" : "transparent",
                color: active ? "var(--ink)" : "var(--ink-3)",
                boxShadow: active ? "var(--shadow-raised)" : "none",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </Row>
  );
}

/** A wrapping grid of icon swatches, for picking which icon a component shows. */
function Icons({
  control,
  value,
  onChange,
}: {
  control: Extract<UiControl, { type: "icons" }>;
  value: string;
  onChange: (value: string) => void;
}) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-[8px]">
      <span id={labelId} className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>
        {control.label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-6 gap-[6px]">
        {control.options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={option.label}
              title={option.label}
              onClick={() => onChange(option.value)}
              className="grid aspect-square place-items-center rounded-[12px] transition-colors active:scale-[0.96]"
              style={{
                backgroundColor: active ? "var(--surface-raised)" : "var(--hover-2)",
                color: active ? "var(--ink)" : "var(--ink-3)",
                boxShadow: active ? "var(--shadow-raised)" : "none",
              }}
            >
              <DynamicIcon name={option.value as IconName} size={18} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({
  control,
  value,
  onChange,
}: {
  control: Extract<UiControl, { type: "toggle" }>;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const labelId = useId();
  return (
    <Row label={control.label} labelId={labelId}>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-labelledby={labelId}
        onClick={() => onChange(!value)}
        className="relative h-[26px] w-[44px] rounded-full transition-colors"
        style={{ backgroundColor: value ? "var(--ink)" : "var(--hover)" }}
      >
        <span
          aria-hidden="true"
          className="absolute left-[3px] top-[3px] size-[20px] rounded-full transition-transform"
          style={{
            backgroundColor: value ? "var(--bg)" : "var(--surface-raised)",
            boxShadow: "var(--shadow-knob)",
            transform: value ? "translateX(18px)" : "none",
            transitionTimingFunction: "var(--ease-out-strong)",
          }}
        />
      </button>
    </Row>
  );
}

/**
 * A filled bar with the label on the left and the value on the right; a native
 * range input sits on top, so dragging, clicking and the arrow keys all work.
 */
function Slider({
  control,
  value,
  onChange,
}: {
  control: Extract<UiControl, { type: "slider" }>;
  value: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const share = ((value - control.min) / (control.max - control.min)) * 100;
  const decimals = String(control.step).split(".")[1]?.length ?? 0;
  const shown = `${value.toFixed(Math.max(decimals, control.unit === "s" ? 1 : 0))}${control.unit ?? ""}`;

  return (
    <div
      className="relative h-[44px] overflow-hidden rounded-[12px] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2"
      style={{ backgroundColor: "var(--hover-2)", outlineColor: "var(--focus)" }}
    >
      <div aria-hidden="true" className="absolute inset-y-0 left-0" style={{ width: `${share}%`, backgroundColor: "var(--hover)" }} />
      <div className="pointer-events-none relative flex h-full items-center justify-between px-[14px] text-[13.5px]">
        <label htmlFor={id} style={{ color: "var(--ink-2)" }}>
          {control.label}
        </label>
        <span className="font-medium tabular-nums" style={{ color: "var(--ink)" }}>
          {shown}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={value}
        aria-valuetext={shown}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
