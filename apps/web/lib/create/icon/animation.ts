/**
 * What the tool drives on an Animate UI icon.
 *
 * Their wrapper takes an `animation` prop: every icon carries its own bespoke
 * `default` motion, and two shared ones draw the strokes on by animating
 * pathLength — `path` once, `path-loop` back and forth. So the two kinds of
 * motion are theirs, not something rebuilt here.
 */
export type IconAnimationId = "default" | "path" | "path-loop";

export const ICON_ANIMATIONS: { id: IconAnimationId; label: string; hint: string }[] = [
  { id: "default", label: "Default", hint: "the icon's own motion" },
  { id: "path", label: "Sketch", hint: "draws the strokes on" },
  { id: "path-loop", label: "Sketch Loop", hint: "draws on and off, forever" },
];

export const animationHint = (id: IconAnimationId) =>
  ICON_ANIMATIONS.find((a) => a.id === id)?.hint ?? "";

export const LOOP_DELAY = { min: 0, max: 2, step: 0.1, default: 0.4 } as const;
