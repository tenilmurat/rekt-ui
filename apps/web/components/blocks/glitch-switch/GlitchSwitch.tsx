"use client";

import { useEffect, useRef, useState } from "react";

export type GlitchSwitchState = {
  label: string;
  /** The state's colour: the border, the corner brackets and the tint of the fill and label come from it. */
  color: string;
};

export type GlitchSwitchProps = {
  /** The states it cycles through, one per click. */
  states?: GlitchSwitchState[];
  /** Which state it starts on. */
  defaultIndex?: number;
  /** How far the slices tear sideways, in px. */
  strength?: number;
  /** How long the glitch lasts, in milliseconds. */
  duration?: number;
  /** How many horizontal slices the button breaks into. */
  slices?: number;
  /** Colour fringes on some slices, from the band below. */
  fringes?: boolean;
  /** A small line under the button; empty hides it. */
  hint?: string;
  onChange?: (state: GlitchSwitchState, index: number) => void;
};

const STATES: GlitchSwitchState[] = [
  { label: "Conservative", color: "#5c8fe2" },
  { label: "Balanced", color: "#ee7059" },
  { label: "Growth", color: "#f0b94e" },
  { label: "Bold", color: "#c99ac6" },
];

/** The colour fringes: the same soft band as the Surprise button. */
const BAND = ["#c99ac6", "#ee7059", "#f0b94e", "#b6c7ea", "#5c8fe2"];

/** How often the broken frame changes, in milliseconds: a stutter, not a slide. */
const TICK = 48;

type Slice = {
  top: number;
  height: number;
  dx: number;
  /** Which face this slice shows: the old state or the new one. */
  state: number;
  /** A colour fringe: a second copy, tinted and pushed the other way. */
  fringe?: { color: string; dx: number };
};

/** Cuts 0–1 into n pieces of uneven height. */
const cut = (n: number) => {
  const weights = Array.from({ length: n }, () => 0.35 + Math.random());
  const total = weights.reduce((a, b) => a + b, 0);
  let at = 0;
  return weights.map((w) => {
    const height = w / total;
    const top = at;
    at += height;
    return { top, height };
  });
};

/**
 * A button that switches state with a glitch: on click it breaks into
 * horizontal slices that tear sideways for a few stuttered frames, the old
 * and the new label torn over each other with soft colour fringes, then
 * snaps clean onto the new state. Square, with its corners picked out in
 * brackets.
 */
export function GlitchSwitch({
  states = STATES,
  defaultIndex = 0,
  strength = 36,
  duration = 340,
  slices = 10,
  fringes = true,
  hint = "Click me",
  onChange,
}: GlitchSwitchProps) {
  const n = states.length;
  const [index, setIndex] = useState(() => Math.min(defaultIndex, n - 1));
  const [glitch, setGlitch] = useState<{ from: number; slices: Slice[] } | null>(null);
  const timer = useRef(0);
  const started = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const next = () => {
    const from = index;
    const to = (index + 1) % n;
    setIndex(to);
    onChange?.(states[to], to);
    if (n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    window.clearTimeout(timer.current);
    started.current = performance.now();
    const life = Math.max(100, duration);
    const count = Math.max(3, Math.min(16, Math.round(slices)));

    // Each tick deals a new broken frame; early on most slices still show the
    // old face, later most show the new one, and the tears shrink toward the end.
    const tick = () => {
      const p = Math.min(1, (performance.now() - started.current) / life);
      if (p >= 1) {
        setGlitch(null);
        return;
      }
      const reach = Math.max(0, strength) * (1 - p * 0.45);
      const dealt: Slice[] = cut(count).map((piece) => {
        const torn = Math.random() < 0.7;
        const dx = torn ? (Math.random() - 0.5) * 2 * reach * (Math.random() < 0.25 ? 2 : 1) : 0;
        const slice: Slice = { ...piece, dx, state: Math.random() < p ? to : from };
        if (fringes && Math.random() < 0.45) {
          slice.fringe = { color: BAND[Math.floor(Math.random() * BAND.length)], dx: dx - Math.sign(dx || 1) * (6 + Math.random() * reach * 0.6) };
        }
        return slice;
      });
      setGlitch({ from, slices: dealt });
      timer.current = window.setTimeout(tick, TICK);
    };
    tick();
  };

  const current = states[index];

  return (
    <div className="rk-glitch" data-glitching={glitch ? "true" : undefined}>
      <button
        type="button"
        className="rk-glitch__button"
        style={{ "--rk-glitch-accent": current.color } as React.CSSProperties}
        onClick={next}
        aria-live="polite"
      >
        <Face label={current.label} />
        {glitch
          ? glitch.slices.map((s, i) => {
              const state = states[s.state];
              return (
                <span key={i} className="rk-glitch__slices" aria-hidden="true">
                  <span
                    className="rk-glitch__slice"
                    style={
                      {
                        "--rk-glitch-accent": state.color,
                        clipPath: `inset(${(s.top * 100).toFixed(2)}% 0 ${((1 - s.top - s.height) * 100).toFixed(2)}% 0)`,
                        transform: `translateX(${s.dx.toFixed(1)}px)`,
                      } as React.CSSProperties
                    }
                  >
                    <Face label={state.label} />
                  </span>
                  {s.fringe ? (
                    <span
                      className="rk-glitch__slice rk-glitch__slice--fringe"
                      style={
                        {
                          "--rk-glitch-accent": s.fringe.color,
                          clipPath: `inset(${(s.top * 100).toFixed(2)}% 0 ${((1 - s.top - s.height) * 100).toFixed(2)}% 0)`,
                          transform: `translateX(${s.fringe.dx.toFixed(1)}px)`,
                        } as React.CSSProperties
                      }
                    >
                      <Face label={state.label} />
                    </span>
                  ) : null}
                </span>
              );
            })
          : null}
      </button>
      {hint ? (
        <span className="rk-glitch__hint" aria-hidden="true">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

/** The button's look: fill, border, four corner brackets and the label. Drawn once, and again inside every slice. */
function Face({ label }: { label: string }) {
  return (
    <span className="rk-glitch__face">
      <span className="rk-glitch__corner" data-at="tl" />
      <span className="rk-glitch__corner" data-at="tr" />
      <span className="rk-glitch__corner" data-at="bl" />
      <span className="rk-glitch__corner" data-at="br" />
      <span className="rk-glitch__label">{label}</span>
    </span>
  );
}
