"use client";

import { useEffect, useRef, useState } from "react";

/** The reveals REKT / CODE can play. */
export type AnimationId =
  | "typewriter"
  | "scramble"
  | "scramble-in"
  | "line-reveal"
  | "word-reveal"
  | "highlight";

export const ANIMATIONS: { id: AnimationId; label: string }[] = [
  { id: "typewriter", label: "Typewriter" },
  { id: "scramble", label: "Scramble" },
  { id: "scramble-in", label: "Scramble In" },
  { id: "line-reveal", label: "Line Reveal" },
  { id: "word-reveal", label: "Word Reveal" },
  { id: "highlight", label: "Highlight" },
];

/**
 * One Speed value drives every animation. Each one counts in its own unit —
 * characters, lines, tokens — so the rate is mapped per animation to keep the
 * slider feeling the same wherever it sits.
 */
export const RATE_PER_SECOND: Record<AnimationId, number> = {
  typewriter: 48, // characters per second
  scramble: 34, // characters per second
  "scramble-in": 55, // characters per second, counted inside every line at once
  "line-reveal": 7, // lines per second
  "word-reveal": 64, // characters per second; a token appears once its first character is due
  highlight: 2.5, // lines per second
};

/** Which unit a given animation counts in. */
export const countsLines = (animation: AnimationId) =>
  animation === "line-reveal" || animation === "highlight";

/**
 * Counts characters *within* a line, with every line running at once: typing and
 * scrambling together. Text appears left to right as it is typed, a few
 * scrambled characters ride the leading edge, and nothing is drawn past it — but
 * every line starts at the same moment, so the block fills in as one. Short
 * lines land first; nothing moves and nothing reflows.
 */
export const countsLineChars = (animation: AnimationId) => animation === "scramble-in";

/** True for the animations that need characters re-rolled while they run. */
export const scrambles = (animation: AnimationId) =>
  animation === "scramble" || animation === "scramble-in";

/** Characters churning at the leading edge of each line. */
export const SCRAMBLE_EDGE = 5;

/** The longest line decides when a Scramble In run is finished. */
export const longestLine = (code: string) =>
  code.split("\n").reduce((longest, line) => Math.max(longest, line.length), 1);

export const SPEED = { min: 0.25, max: 2, step: 0.05, default: 1 } as const;

/** Characters the scramble draws from while a position is still unresolved. */
const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{}[]()<>/\\|=+-*&^%$#@!?;:.,~";

export const scrambleChar = (seed: number) => POOL[Math.abs(seed) % POOL.length];

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** How often scrambled characters are re-rolled, in milliseconds. */
const CHURN_MS = 45;

/**
 * The clock every animation runs on.
 *
 * One frame loop produces both numbers — how many units are revealed and which
 * churn frame the scramble is on — and state is only pushed when one of them
 * actually changes. Two sources of truth (a frame loop plus a separate interval)
 * is what made this stutter: they landed out of phase and each one re-rendered
 * the whole block.
 *
 * `runId` is the replay handle: change it and the clock starts from zero with
 * every other setting untouched. With reduced motion the run begins finished.
 */
export function useReveal({
  total,
  rate,
  runId,
  animate,
  loop = false,
  hold = 0,
}: {
  total: number;
  rate: number;
  runId: number;
  animate: boolean;
  /** Start again when the run finishes — what a loader wants. */
  loop?: boolean;
  /** Units to sit on the finished state before looping. */
  hold?: number;
}) {
  const [state, setState] = useState({ revealed: total, churn: 0 });
  const frame = useRef(0);
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    if (!animate || total <= 0) {
      setState({ revealed: total, churn: 0 });
      return;
    }

    setState({ revealed: 0, churn: 0 });
    const start = performance.now();

    const cycle = total + hold;

    const tick = (now: number) => {
      const elapsed = now - start;
      const counted = Math.floor((elapsed / 1000) * rate);
      const revealed = loop ? Math.min(counted % cycle, total) : Math.min(counted, total);
      const churn = Math.floor(elapsed / CHURN_MS);
      const current = latest.current;
      // skip the render entirely when neither number moved
      if (revealed !== current.revealed || churn !== current.churn) {
        setState({ revealed, churn });
      }
      if (loop || revealed < total) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [total, rate, runId, animate, loop, hold]);

  return state;
}
