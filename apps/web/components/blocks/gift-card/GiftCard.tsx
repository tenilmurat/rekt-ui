"use client";

import { Gift } from "lucide-react";
import { useRef } from "react";

export type GiftCardProps = {
  /** The line-art pattern on the card. */
  pattern?: "laurel" | "confetti" | "rings" | "stars";
  /** The card's outline. */
  shape?: "rounded" | "ticket" | "stamp";
  /** The card's colours. */
  palette?: "ocean" | "dusk" | "mint";
  /** The card's width, in px; the height follows at 1.58:1, like a bank card. Icon-sized by default, for a button or a banner. */
  width?: number;
  /** A small engraving along the right edge; empty hides it. */
  mark?: string;
  /** Tip toward the pointer on hover. */
  tilt?: boolean;
  /** What screen readers hear. */
  label?: string;
};

/** The card's viewBox, the same 1.58:1 as the card, so the pattern can be laid out in fixed units. */
const VB_W = 320;
const VB_H = 202;

/** A small seeded random, so a pattern lands the same on every render (and on the server). */
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

/**
 * An olive leaf, lying along +x from its stalk: a full, rounded back that
 * narrows to a pointed tip.
 */
const leafPath = (length: number) => {
  const w = length * 0.24;
  const l = length;
  return `M0 0C${l * 0.18} ${-w * 1.9} ${l * 0.72} ${-w * 1.5} ${l} 0C${l * 0.72} ${w * 1.5} ${l * 0.18} ${w * 1.9} 0 0Z`;
};

/**
 * A branch drawn from its base at the origin along +x: a thin stem curving
 * gently up, with leaves set alternately left and right that get a little
 * smaller toward the tip, and one leaf at the tip. The inner group sways on
 * the base; the outer one places the branch.
 */
function Branch({ x, y, angle, scale, leaves, size, delay }: { x: number; y: number; angle: number; scale: number; leaves: number; size: number; delay: number }) {
  // The stem: a quadratic curve from (0,0) through (60,-6) to (120,-28).
  const point = (t: number) => {
    const u = 1 - t;
    return { x: 2 * u * t * 60 + t * t * 120, y: 2 * u * t * -6 + t * t * -28 };
  };
  const tangent = (t: number) => {
    const dx = 2 * (1 - t) * 60 + 2 * t * 60;
    const dy = 2 * (1 - t) * -6 + 2 * t * -22;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };
  const items = Array.from({ length: leaves }, (_, i) => {
    const t = 0.18 + (i / Math.max(1, leaves - 1)) * 0.66;
    const p = point(t);
    const side = i % 2 ? 1 : -1;
    return { key: i, x: p.x, y: p.y, angle: tangent(t) + side * 40, length: size * (1 - i * 0.08) };
  });
  const tip = point(1);
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <g className="rk-gift__sway" style={{ "--rk-gift-delay": `${delay}s` } as React.CSSProperties}>
        <path className="rk-gift__stem" d="M0 0Q60 -6 120 -28" />
        {items.map((l) => (
          <path key={l.key} d={leafPath(l.length)} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.angle.toFixed(1)})`} />
        ))}
        <path d={leafPath(size * 0.9)} transform={`translate(${tip.x} ${tip.y}) rotate(${tangent(1).toFixed(1)})`} />
      </g>
    </g>
  );
}

/**
 * The laurel pattern, as in the design: a few big branches rather than many
 * small ones, so it still reads on a small card. One rises up the left, one
 * hangs from the top, one curves down the right edge, and a sprout comes up
 * in the bottom-right corner.
 */
function Laurel() {
  return (
    <>
      <Branch x={-10} y={206} angle={-50} scale={1.05} leaves={5} size={46} delay={0} />
      <Branch x={118} y={-26} angle={62} scale={0.62} leaves={3} size={46} delay={-1.6} />
      <Branch x={350} y={-6} angle={118} scale={1} leaves={4} size={46} delay={-2.8} />
      <Branch x={262} y={216} angle={-104} scale={0.62} leaves={2} size={48} delay={-0.9} />
    </>
  );
}

/** Confetti: a handful of big, soft pieces (strips, dots and small arcs), each bobbing on its own beat. */
function Confetti() {
  const rnd = seeded(23);
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => {
        // Spread over a loose grid, so the pieces never bunch up or leave a hole.
        const x = ((i % 5) + 0.2 + rnd() * 0.6) * (VB_W / 5);
        const y = (Math.floor(i / 5) + 0.15 + rnd() * 0.7) * (VB_H / 3);
        const r = rnd() * 180;
        const kind = i % 3;
        return (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(0)})`}>
            <g className="rk-gift__bob" style={{ "--rk-gift-delay": `${(-rnd() * 4).toFixed(2)}s` } as React.CSSProperties}>
              {kind === 0 ? (
                <rect x={-15} y={-5.5} width={30} height={11} rx={5.5} />
              ) : kind === 1 ? (
                <circle r={8} />
              ) : (
                <path className="rk-gift__stem rk-gift__stem--bold" d="M-14 6Q0 -14 14 6" />
              )}
            </g>
          </g>
        );
      })}
    </>
  );
}

/** Rings: a few thick circles spreading from the top-right corner, breathing out in turn. */
function Rings() {
  return (
    <g transform={`translate(${VB_W - 30} 30)`}>
      {[46, 96, 150, 208].map((r, i) => (
        <circle key={r} className="rk-gift__ring" r={r} style={{ "--rk-gift-delay": `${-i * 0.7}s` } as React.CSSProperties} />
      ))}
    </g>
  );
}

/** Stars: a few soft four-point sparkles of different sizes that twinkle in turn. */
function Stars() {
  const spots = [
    [48, 50, 26],
    [96, 150, 16],
    [34, 160, 12],
    [246, 40, 20],
    [216, 168, 14],
    [154, 24, 11],
  ];
  return (
    <>
      {spots.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path
            className="rk-gift__twinkle"
            d={`M0 ${-s}C${s * 0.12} ${-s * 0.12} ${s * 0.12} ${-s * 0.12} ${s} 0C${s * 0.12} ${s * 0.12} ${s * 0.12} ${s * 0.12} 0 ${s}C${-s * 0.12} ${s * 0.12} ${-s * 0.12} ${s * 0.12} ${-s} 0C${-s * 0.12} ${-s * 0.12} ${-s * 0.12} ${-s * 0.12} 0 ${-s}Z`}
            style={{ "--rk-gift-delay": `${(-i * 0.4).toFixed(2)}s` } as React.CSSProperties}
          />
        </g>
      ))}
    </>
  );
}

const PATTERNS = { laurel: Laurel, confetti: Confetti, rings: Rings, stars: Stars };

/**
 * A glassy gift card: a soft glow drifts slowly behind a pattern of white
 * line art (laurel branches that sway, or confetti, rings or stars), with a
 * gift at the centre and a small engraving along the edge. On hover it tips
 * toward the pointer and a sheen slides across.
 */
export function GiftCard({
  pattern = "laurel",
  shape = "rounded",
  palette = "ocean",
  width = 96,
  mark = "MMXX",
  tilt = true,
  label = "Gift card",
}: GiftCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const Pattern = PATTERNS[pattern] ?? Laurel;

  // The tilt is written straight to CSS variables, so a pointer move never re-renders.
  const lean = (event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!tilt || !card || event.pointerType === "touch") return;
    const box = card.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    card.style.setProperty("--rk-gift-ry", `${(px * 14).toFixed(2)}deg`);
    card.style.setProperty("--rk-gift-rx", `${(-py * 12).toFixed(2)}deg`);
    card.style.setProperty("--rk-gift-shine", `${((px + 0.5) * 100).toFixed(1)}%`);
  };

  const settle = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.removeProperty("--rk-gift-ry");
    card.style.removeProperty("--rk-gift-rx");
    card.style.removeProperty("--rk-gift-shine");
  };

  return (
    <div className="rk-gift" data-palette={palette} data-shape={shape} style={{ "--rk-gift-w": `${width}px` } as React.CSSProperties}>
      <div ref={cardRef} className="rk-gift__card" role="img" aria-label={label} onPointerMove={lean} onPointerLeave={settle}>
        {/* The glow: two soft blobs drifting over the base gradient. */}
        <span className="rk-gift__glow" aria-hidden="true" />
        <svg className="rk-gift__pattern" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g className="rk-gift__drift">
            <Pattern />
          </g>
          {mark ? (
            <text className="rk-gift__mark" transform={`translate(${VB_W - 34} ${VB_H / 2 - 14}) rotate(74)`}>
              {mark}
            </text>
          ) : null}
        </svg>
        <span className="rk-gift__icon" aria-hidden="true">
          <Gift strokeWidth={2.5} />
        </span>
        <span className="rk-gift__sheen" aria-hidden="true" />
      </div>
    </div>
  );
}
