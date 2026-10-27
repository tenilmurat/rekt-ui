"use client";

import { useEffect, useId, useRef } from "react";

export type MorphLoaderProps = {
  /** Width and height, in px. */
  size?: number;
  /** How long each shape lasts, morph included, in milliseconds. */
  speed?: number;
  /** The colours it travels through. */
  palette?: "spectrum" | "sunset" | "lagoon";
  /** What screen readers hear. */
  label?: string;
};

/** Colour ramps, in order; the gradient blends two neighbours and slides to the next pair with each shape. */
const PALETTES: Record<NonNullable<MorphLoaderProps["palette"]>, string[]> = {
  spectrum: ["#ff5e5b", "#ff9b3d", "#ffd23f", "#9be15d", "#1fc98f", "#19b5c8"],
  sunset: ["#ff5e5b", "#ff6f91", "#ff9b3d", "#ffc94d", "#ff8a5c"],
  lagoon: ["#9be15d", "#3fd68a", "#1fc98f", "#19b5c8", "#5fd4c4"],
};

/** Points around the outline. */
const POINTS = 144;

const TAU = Math.PI * 2;
const angles = Array.from({ length: POINTS }, (_, i) => (i / POINTS) * TAU);

/** Softens a radius list by averaging each point with its neighbours, wrapping round. */
const smooth = (radii: number[], reach: number) =>
  radii.map((_, i) => {
    let sum = 0;
    for (let k = -reach; k <= reach; k++) sum += radii[(i + k + POINTS) % POINTS];
    return sum / (reach * 2 + 1);
  });

/** Scales a shape so they all cover the same area, so none looks bigger than the rest. */
const equalArea = (radii: number[]) => {
  const mean = Math.sqrt(radii.reduce((sum, r) => sum + r * r, 0) / POINTS);
  return radii.map((r) => r / mean);
};

const polygon = (sides: number) =>
  angles.map((a) => {
    const sector = TAU / sides;
    const local = ((a + Math.PI / 2) % sector) - sector / 2;
    return Math.cos(sector / 2) / Math.cos(local);
  });

/**
 * Turns a shape so its corners and lobes sit as close as they can to the
 * previous shape's, so the morph between them travels the shortest way.
 */
const alignTo = (previous: number[], next: number[]) => {
  let best = 0;
  let bestCost = Infinity;
  for (let shift = 0; shift < POINTS; shift++) {
    let cost = 0;
    for (let i = 0; i < POINTS; i++) cost += (previous[i] - next[(i + shift) % POINTS]) ** 2;
    if (cost < bestCost) [best, bestCost] = [shift, cost];
  }
  return next.map((_, i) => next[(i + best) % POINTS]);
};

/**
 * Each shape is a radius per angle, so any two morph by blending their radii.
 * The order counts up: two sides, three, four, five, eight petals, then the
 * four-lobed clover eases back into the circle.
 */
const SHAPES: number[][] = [
  // Circle
  angles.map(() => 1),
  // Oval
  angles.map((a) => (1.16 * 0.8) / Math.hypot(0.8 * Math.cos(a), 1.16 * Math.sin(a))),
  // Triangle with rounded corners
  smooth(smooth(polygon(3), 9), 6),
  // Square with rounded corners
  smooth(smooth(polygon(4), 7), 5),
  // Pentagon with rounded corners
  smooth(smooth(polygon(5), 5), 3),
  // Bloom: eight soft petals
  smooth(
    angles.map((a) => 1 + 0.17 * Math.cos(8 * a)),
    2,
  ),
  // Clover: four overlapping lobes
  smooth(
    angles.map((a) => 0.72 + 0.34 * Math.abs(Math.cos(2 * a)) ** 0.7),
    3,
  ),
]
  .map(equalArea)
  .reduce<number[][]>((chain, shape) => [...chain, chain.length ? alignTo(chain[chain.length - 1], shape) : shape], []);

/**
 * Half linear, half sine: soft through each shape but never quite still, so
 * the morph keeps flowing from one shape into the next without a pause.
 */
const flow = (t: number) => t / 2 + (1 - Math.cos(Math.PI * t)) / 4;

const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const channel = (shift: number) => {
    const ca = (pa >> shift) & 255;
    const cb = (pb >> shift) & 255;
    return Math.round(ca + (cb - ca) * t);
  };
  return `rgb(${channel(16)} ${channel(8)} ${channel(0)})`;
};

/**
 * The ramp walks up and back down rather than wrapping, so the gradient only
 * ever blends neighbours and never crosses the wheel through grey.
 */
const colorAt = (colors: string[], k: number) => {
  const period = Math.max(1, (colors.length - 1) * 2);
  const at = k % period;
  return colors[at < colors.length ? at : period - at];
};

/** The outline as a path, turned by the given angle in radians. */
const outline = (radii: number[], turn = 0) =>
  radii
    .map((r, i) => {
      const a = angles[i] + turn;
      return `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(3)} ${(Math.sin(a) * r).toFixed(3)}`;
    })
    .join("") + "Z";

/**
 * A loading mark: one soft shape that keeps turning while it morphs from
 * circle to oval, triangle, square, pentagon, petals and clover, and back
 * round. Its two-tone gradient walks up and back down a colour ramp, one
 * colour per shape, so it reads as one living thing.
 */
export function MorphLoader({ size = 56, speed = 800, palette = "spectrum", label = "Loading" }: MorphLoaderProps) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const highlightRef = useRef<SVGPathElement | null>(null);
  const fillRef = useRef<SVGLinearGradientElement | null>(null);
  const stopA = useRef<SVGStopElement | null>(null);
  const stopB = useRef<SVGStopElement | null>(null);
  const id = useId().replace(/:/g, "");
  const colors = PALETTES[palette] ?? PALETTES.spectrum;

  useEffect(() => {
    const step = Math.max(200, speed);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const start = performance.now();

    const paint = (now: number) => {
      // A frame's timestamp can be a little earlier than the start.
      const t = reduced ? 0 : Math.max(0, now - start) / step;
      const index = Math.floor(t);
      const within = t - index;
      // Always on the way to the next shape; there's no hold.
      const p = flow(within);
      const from = SHAPES[index % SHAPES.length];
      const to = SHAPES[(index + 1) % SHAPES.length];
      // A steady turn, plus a gentle extra eighth of a turn eased through each morph.
      const turn = (t * 60 + (index + p) * 45) % 360;
      const d = outline(
        from.map((r, i) => r + (to[i] - r) * p),
        (turn * Math.PI) / 180,
      );
      pathRef.current?.setAttribute("d", d);
      highlightRef.current?.setAttribute("d", d);
      // The colours turn a little faster than the shape, so they visibly flow even on the
      // circle, where a turn alone can't be seen. The sheen stays put, like light from one side.
      const sweep = (turn + t * 40) % 360;
      fillRef.current?.setAttribute("gradientTransform", `rotate(${sweep.toFixed(2)})`);

      // Colours drift at a constant pace, so they never pause either.
      const a = mixHex(colorAt(colors, index), colorAt(colors, index + 1), within);
      const b = mixHex(colorAt(colors, index + 1), colorAt(colors, index + 2), within);
      stopA.current?.setAttribute("stop-color", a);
      stopB.current?.setAttribute("stop-color", b);

      if (!reduced) frame = requestAnimationFrame(paint);
    };

    frame = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(frame);
  }, [speed, colors]);

  return (
    <span className="rk-morph" role="status" style={{ width: size, height: size }}>
      <svg className="rk-morph__mark" viewBox="-1.5 -1.5 3 3" aria-hidden="true">
        <defs>
          <linearGradient ref={fillRef} id={`${id}-fill`} x1="-1" y1="-1" x2="1" y2="1" gradientUnits="userSpaceOnUse">
            <stop ref={stopA} offset="0" stopColor={colors[0]} />
            <stop ref={stopB} offset="1" stopColor={colors[1]} />
          </linearGradient>
          {/* A soft sheen on one side, so the shape has a little body. */}
          <radialGradient id={`${id}-sheen`} cx="-0.5" cy="-0.6" r="1.1" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity="0.26" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path ref={pathRef} d={outline(SHAPES[0])} fill={`url(#${id}-fill)`} />
        <path ref={highlightRef} d={outline(SHAPES[0])} fill={`url(#${id}-sheen)`} />
      </svg>
      <span className="rk-morph__label">{label}</span>
    </span>
  );
}
