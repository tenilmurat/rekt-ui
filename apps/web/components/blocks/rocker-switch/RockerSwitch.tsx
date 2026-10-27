"use client";

import { useEffect, useState } from "react";

export type RockerSwitchProps = {
  /** Controlled state; leave out to let it keep its own. */
  checked?: boolean;
  defaultChecked?: boolean;
  /** The colour of the body's side and the lit dots. */
  color?: "purple" | "coral" | "mint";
  /** How far the top tilts, in degrees: the lifted end rises by the plate's length × sin(tilt). */
  tilt?: number;
  /** The plate's thickness at the pressed end, in px. */
  depth?: number;
  /** How long the rock takes, in milliseconds. */
  speed?: number;
  /** The word spelled round the switch: its first and second halves. Empty hides it. */
  word?: [string, string] | null;
  /** The labels on the two halves. */
  labels?: [string, string];
  /** What screen readers hear. */
  label?: string;
  onChange?: (checked: boolean) => void;
};

const COLORS = {
  purple: "#a66cff",
  coral: "#ff7a59",
  mint: "#3ad6a0",
};

/** How many dots run along the plate. */
const DOTS = 14;

/** The plate's length on the ground, in px; the CSS uses the same number. */
const PLATE_W = 260;

/**
 * A rocker switch seen from above in 3D: a pill-shaped wedge on the ground,
 * split into ON and OFF halves, that rocks like a seesaw. Click it and the
 * pressed end sinks to the floor while the other end rises on a tall
 * coloured wall, on a springy rock; a row of dots beside it lights up in
 * turn, from OFF to ON, with the word RE…KT spelled round it.
 */
export function RockerSwitch({
  checked,
  defaultChecked = false,
  color = "purple",
  tilt = 12,
  depth = 4,
  speed = 650,
  word = ["RE", "KT"],
  labels = ["ON", "OFF"],
  label = "Power",
  onChange,
}: RockerSwitchProps) {
  const [own, setOwn] = useState(defaultChecked);
  const on = checked ?? own;
  const [wait, setWait] = useState<number[]>([]);

  // Each dot waits its turn: counting up from the OFF end when switching on, down when switching off.
  useEffect(() => {
    setWait(Array.from({ length: DOTS }, (_, i) => (on ? DOTS - 1 - i : i)));
  }, [on]);

  const toggle = () => {
    const next = !on;
    if (checked === undefined) setOwn(next);
    onChange?.(next);
  };

  const accent = COLORS[color] ?? COLORS.purple;
  const angle = Math.max(1, Math.min(30, tilt));
  const base = Math.max(1, Math.min(24, Math.round(depth)));
  // The wall's height at the lifted end: the plate's far end swung up by the tilt.
  const rise = Math.round(PLATE_W * Math.sin((angle * Math.PI) / 180));
  // The body is the pill stacked one px at a time: the base goes the whole
  // length; above it each layer stops short, so the stack makes a wedge.
  const layers = Array.from({ length: base + rise }, (_, i) => Math.max(0, i + 1 - base) / rise);

  return (
    <div
      className="rk-rocker"
      data-on={on || undefined}
      style={
        {
          "--rk-rocker-accent": accent,
          "--rk-rocker-tilt": `${angle}deg`,
          "--rk-rocker-top": `${base + rise / 2}px`,
          "--rk-rocker-speed": `${Math.max(0, speed)}ms`,
        } as React.CSSProperties
      }
    >
      <div className="rk-rocker__scene">
        {/* The word and the dots lie flat on the ground, along the plate's near side. */}
        {word ? (
          <div className="rk-rocker__word" aria-hidden="true">
            <span className="rk-rocker__half">{word[0]}</span>
            <span className="rk-rocker__dots">
              {Array.from({ length: DOTS }, (_, i) => (
                <span key={i} className="rk-rocker__dot" style={{ "--rk-rocker-wait": wait[i] ?? i } as React.CSSProperties} />
              ))}
            </span>
            <span className="rk-rocker__half">{word[1]}</span>
          </div>
        ) : null}

        <button type="button" role="switch" aria-checked={on} aria-label={label} className="rk-rocker__switch" onClick={toggle}>
          <span className="rk-rocker__shadow" aria-hidden="true" />
          <span className="rk-rocker__body" aria-hidden="true">
            {layers.map((cut, i) => (
              <span
                key={i}
                className="rk-rocker__layer"
                style={{ "--rk-rocker-z": `${i}px`, "--rk-rocker-cut": cut, "--rk-rocker-up": (i + 1) / layers.length } as React.CSSProperties}
              />
            ))}
            <span className="rk-rocker__face">
              <span className="rk-rocker__cap rk-rocker__cap--on">
                <span className="rk-rocker__label">{labels[0]}</span>
              </span>
              <span className="rk-rocker__cap rk-rocker__cap--off">
                <span className="rk-rocker__label">{labels[1]}</span>
              </span>
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
