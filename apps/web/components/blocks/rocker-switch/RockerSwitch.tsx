"use client";

import { useEffect, useState } from "react";

export type RockerSwitchProps = {
  /** Controlled state; leave out to let it keep its own. */
  checked?: boolean;
  defaultChecked?: boolean;
  /** The colour of the plate's side and the lit dots. */
  color?: "purple" | "coral" | "mint";
  /** How far the plate rocks, in degrees. */
  tilt?: number;
  /** The plate's thickness, in px: the coloured edge you see when a half lifts. */
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

/**
 * A rocker switch seen from above in 3D: a pill-shaped plate split into ON
 * and OFF halves that rocks about its seam like a seesaw. Click it and the
 * pressed half drops while the other lifts, showing the plate's coloured
 * side, on a springy rock; a row of dots beside it lights up in turn, from
 * OFF to ON, with the word RE…KT spelled round it.
 */
export function RockerSwitch({
  checked,
  defaultChecked = false,
  color = "purple",
  tilt = 10,
  depth = 20,
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
  const slices = Math.max(2, Math.min(36, Math.round(depth)));

  return (
    <div
      className="rk-rocker"
      data-on={on || undefined}
      style={
        {
          "--rk-rocker-accent": accent,
          "--rk-rocker-tilt": `${Math.max(0, tilt)}deg`,
          "--rk-rocker-depth": `${slices}px`,
          "--rk-rocker-speed": `${Math.max(0, speed)}ms`,
        } as React.CSSProperties
      }
    >
      <div className="rk-rocker__scene">
        {/* The word and the dots lie flat on the ground, along the plate's far side. */}
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
          <span className="rk-rocker__plate" aria-hidden="true">
            {/* The side: the pill again and again, one step lower each time, in the accent. */}
            {Array.from({ length: slices }, (_, i) => (
              <span key={i} className="rk-rocker__side" style={{ "--rk-rocker-z": `${-(i + 1)}px` } as React.CSSProperties} />
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
