"use client";

import { useEffect, useState } from "react";

export type RockerSwitchProps = {
  /** Controlled state; leave out to let it keep its own. */
  checked?: boolean;
  defaultChecked?: boolean;
  /** The colour of the wedge, the glow and the lit dots. */
  color?: "purple" | "coral" | "mint";
  /** How far the plate tilts, in degrees: the raised end stands length × sin(tilt) above the ground. */
  tilt?: number;
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

/** The ground's colour in each state; the plate's pressed end merges into it, and a parent can paint it too. */
const GROUND = { off: "#cbcbcd", on: "#0b0a0b" };

/**
 * A rocker switch seen from above in 3D: a pill-shaped plate, split into ON
 * and OFF halves, that rests on the ground at one end and tilts up to the
 * other on a wedge of coloured wall. Click it and it rocks like a seesaw to
 * rest on the other end; a row of dots beside it lights up in turn with the
 * word RE…KT round it, and when it's on the ground goes dark and the
 * switch glows.
 */
export function RockerSwitch({
  checked,
  defaultChecked = false,
  color = "purple",
  tilt = 9,
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
  const angle = Math.max(2, Math.min(20, tilt));
  // How high the raised end stands: the whole length swung up by the tilt.
  const rise = Math.max(1, Math.round(PLATE_W * Math.sin((angle * Math.PI) / 180)));
  // The wedge: one layer per px of height. The CSS works out where each one
  // starts from the pressed end, from its height and the plate's angle.
  const layers = Array.from({ length: rise }, (_, j) => j + 1);

  return (
    <div
      className="rk-rocker"
      data-on={on || undefined}
      // The ground's colour, for a parent to paint (the wall's cards do), and a flag for anything that only needs light/dark.
      data-rk-ground={on ? GROUND.on : GROUND.off}
      data-rk-dark={on || undefined}
      style={
        {
          "--rk-rocker-accent": accent,
          "--rk-rocker-tilt": `${angle}deg`,
          "--rk-rocker-length": `${PLATE_W}px`,
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
          {/* The shadow the raised end throws on the ground, one for each end. */}
          <span className="rk-rocker__shade rk-rocker__shade--on" aria-hidden="true" />
          <span className="rk-rocker__shade rk-rocker__shade--off" aria-hidden="true" />
          <span className="rk-rocker__body" aria-hidden="true">
            {/* The wedge under the plate, as two sets: one cut from the OFF end (while ON is up), one from the ON end. */}
            {layers.map((h) => (
              <span
                key={`l${h}`}
                className="rk-rocker__layer rk-rocker__layer--on"
                style={{ "--rk-rocker-z": `${h - 1}px`, "--rk-rocker-height": h, "--rk-rocker-up": h / rise } as React.CSSProperties}
              />
            ))}
            {layers.map((h) => (
              <span
                key={`r${h}`}
                className="rk-rocker__layer rk-rocker__layer--off"
                style={{ "--rk-rocker-z": `${h - 1}px`, "--rk-rocker-height": h, "--rk-rocker-up": h / rise } as React.CSSProperties}
              />
            ))}
            {/* The plate: one piece, its two halves and the seam, tilted as a whole. */}
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
