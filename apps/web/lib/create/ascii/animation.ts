"use client";

/**
 * The five ASCII animations. They share the clock the code tool uses
 * (`useReveal` in lib/create/code/animation.ts): one frame loop, integer
 * counters, no second interval fighting it.
 */
export type AsciiAnimationId = "static" | "reveal" | "scramble" | "scan" | "pulse";

export const ASCII_ANIMATIONS: { id: AsciiAnimationId; label: string }[] = [
  { id: "static", label: "Static" },
  { id: "reveal", label: "Reveal" },
  { id: "scramble", label: "Scramble" },
  { id: "scan", label: "Scan" },
  { id: "pulse", label: "Pulse" },
];

/** Rows per second for the row-based animations; scramble counts in percent. */
export const ASCII_RATE: Record<AsciiAnimationId, number> = {
  static: 1,
  reveal: 26, // rows per second
  scramble: 62, // percent of the run per second
  scan: 30, // rows per second
  pulse: 1, // handled by CSS, not the counter
};

/** Rows the scan band covers as it travels. */
export const SCAN_BAND = 3;

/** Deterministic 0-1 per cell, so a scramble resolves in a stable random order. */
export function cellSeed(row: number, col: number) {
  const n = Math.sin(row * 127.1 + col * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
