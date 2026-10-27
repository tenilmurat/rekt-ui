"use client";

import { useEffect, useState } from "react";

export type RockerSwitchProps = {
  /** Controlled state; leave out to let it keep its own. */
  checked?: boolean;
  defaultChecked?: boolean;
  /** The colour of the raised wall, the glow and the lit dots. */
  color?: "purple" | "coral" | "mint";
  /** How far the raised half tilts up from the seam, in degrees. */
  tilt?: number;
  /** The plate's thickness where it lies flat, in px. */
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
 * A rocker switch seen from above in 3D: a pill-shaped plate on the ground,
 * hinged at its seam into ON and OFF halves. The pressed half lies flat;
 * the other is raised from the seam on a wedge of coloured wall. Click it
 * and they swap on a springy seesaw, a row of dots beside it lights up in
 * turn with the word RE…KT round it, and when it's on the ground goes dark
 * and the switch glows.
 */
export function RockerSwitch({
  checked,
  defaultChecked = false,
  color = "purple",
  tilt = 14,
  depth = 4,
  speed = 700,
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
  const angle = Math.max(2, Math.min(30, tilt));
  const base = Math.max(1, Math.min(24, Math.round(depth)));
  // How high the raised half's far end stands: half the length swung up by the tilt.
  const rise = Math.max(1, Math.round((PLATE_W / 2) * Math.sin((angle * Math.PI) / 180)));
  // The wedge under a raised half: one layer per px of height. The CSS works
  // out where each one starts from the seam, from its height and the angle.
  const wedge = Array.from({ length: rise }, (_, j) => j + 1);

  return (
    <div
      className="rk-rocker"
      data-on={on || undefined}
      // The ground goes dark with the switch: a parent can follow this flag (the wall's cards do, with :has()).
      data-rk-dark={on || undefined}
      style={
        {
          "--rk-rocker-accent": accent,
          "--rk-rocker-tilt": `${angle}deg`,
          "--rk-rocker-base": `${base}px`,
          "--rk-rocker-half": `${PLATE_W / 2}px`,
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
          {/* The shadow each raised half throws on the ground beyond its end. */}
          <span className="rk-rocker__shade rk-rocker__shade--on" aria-hidden="true" />
          <span className="rk-rocker__shade rk-rocker__shade--off" aria-hidden="true" />
          <span className="rk-rocker__body" aria-hidden="true">
            {/* The flat base: the whole pill, as thick as Base. */}
            {Array.from({ length: base }, (_, i) => (
              <span key={`b${i}`} className="rk-rocker__layer rk-rocker__layer--base" style={{ "--rk-rocker-z": `${i}px` } as React.CSSProperties} />
            ))}
            {/* The wedge under each half, there only while that half is raised. */}
            {wedge.map((h, j) => (
              <span
                key={`l${j}`}
                className="rk-rocker__layer rk-rocker__layer--on"
                style={{ "--rk-rocker-z": `${base + j}px`, "--rk-rocker-height": h, "--rk-rocker-up": h / rise } as React.CSSProperties}
              />
            ))}
            {wedge.map((h, j) => (
              <span
                key={`r${j}`}
                className="rk-rocker__layer rk-rocker__layer--off"
                style={{ "--rk-rocker-z": `${base + j}px`, "--rk-rocker-height": h, "--rk-rocker-up": h / rise } as React.CSSProperties}
              />
            ))}
            {/* The two halves of the top, each hinged at the seam. */}
            <span className="rk-rocker__cap rk-rocker__cap--on">
              <span className="rk-rocker__label">{labels[0]}</span>
            </span>
            <span className="rk-rocker__cap rk-rocker__cap--off">
              <span className="rk-rocker__label">{labels[1]}</span>
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
