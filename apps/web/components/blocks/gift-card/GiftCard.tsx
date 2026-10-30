"use client";

import { Gift } from "lucide-react";
import { useRef } from "react";

export type GiftCardProps = {
  /** The line-art pattern on the card. */
  pattern?: "fern" | "confetti" | "rings" | "stars";
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
 * A fern pinna, lying along +x from the rachis: long and narrow, fuller near
 * the base, drawn to a point.
 */
const pinnaPath = (length: number) => {
  const w = length * 0.2;
  const l = length;
  return `M0 0C${l * 0.15} ${-w * 1.6} ${l * 0.65} ${-w * 1.2} ${l} 0C${l * 0.65} ${w * 1.0} ${l * 0.15} ${w * 1.4} 0 0Z`;
};

/**
 * A fern frond drawn from its base at the origin along +x: a thin rachis
 * bending gently toward the tip, with pinnae on both sides, the two sides
 * offset by half a step as on a real frond, longest just above the base and
 * tapering to the tip. mirror bends it the other way. The inner group sways
 * on the base; the outer one places the frond.
 */
function Frond({
  x,
  y,
  angle,
  length,
  pairs,
  size,
  mirror = false,
  delay,
}: {
  x: number;
  y: number;
  angle: number;
  length: number;
  pairs: number;
  size: number;
  mirror?: boolean;
  delay: number;
}) {
  // The rachis: a quadratic curve from (0,0) through (cx,cy) to (ex,ey).
  const cx = length * 0.5;
  const cy = -length * 0.02;
  const ex = length;
  const ey = -length * 0.3;
  const point = (t: number) => {
    const u = 1 - t;
    return { x: 2 * u * t * cx + t * t * ex, y: 2 * u * t * cy + t * t * ey };
  };
  const tangent = (t: number) => {
    const dx = 2 * (1 - t) * cx + 2 * t * (ex - cx);
    const dy = 2 * (1 - t) * cy + 2 * t * (ey - cy);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };
  const pinnae = Array.from({ length: pairs * 2 }, (_, k) => {
    const i = k >> 1;
    const side = k % 2 ? 1 : -1;
    const t = 0.05 + ((i + (side > 0 ? 0.5 : 0)) / pairs) * 0.86;
    const p = point(t);
    const len = size * Math.min(1, 0.7 + t * 1.5) * (1 - t * 0.78);
    return { key: k, x: p.x, y: p.y, angle: tangent(t) + side * 58, len };
  });
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})${mirror ? " scale(1 -1)" : ""}`}>
      <g className="rk-gift__sway" style={{ "--rk-gift-delay": `${delay}s` } as React.CSSProperties}>
        <path className="rk-gift__stem" d={`M0 0Q${cx} ${cy} ${ex} ${ey}`} />
        {pinnae.map((p) => (
          <path key={p.key} d={pinnaPath(p.len)} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.angle.toFixed(1)})`} />
        ))}
        <path d={pinnaPath(size * 0.3)} transform={`translate(${ex} ${ey}) rotate(${tangent(1).toFixed(1)})`} />
      </g>
    </g>
  );
}

/**
 * The fern pattern, as in the design: one frond, drawn a few times at
 * different places, sizes and angles. A big one rises up the left, one
 * hangs from the top, one comes up from the bottom right and a small one
 * reaches in from the top-right corner, all clear of the gift and the mark.
 */
function Fern() {
  return (
    <>
      <Frond x={14} y={218} angle={-68} length={190} pairs={9} size={40} delay={0} />
      <Frond x={70} y={-14} angle={30} length={140} pairs={7} size={32} delay={-1.6} />
      <Frond x={214} y={222} angle={-84} length={96} pairs={5} size={28} mirror delay={-0.9} />
      <Frond x={334} y={-12} angle={135} length={80} pairs={4} size={24} mirror delay={-2.8} />
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

const PATTERNS = { fern: Fern, confetti: Confetti, rings: Rings, stars: Stars };

/**
 * A glassy gift card: a soft glow drifts slowly behind a pattern of white
 * line art (fern fronds that sway, or confetti, rings or stars), with a
 * gift at the centre and a small engraving along the edge. On hover it tips
 * toward the pointer and a sheen slides across.
 */
export function GiftCard({
  pattern = "fern",
  shape = "rounded",
  palette = "ocean",
  width = 96,
  mark = "MMXX",
  tilt = true,
  label = "Gift card",
}: GiftCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const Pattern = PATTERNS[pattern] ?? Fern;

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
          {/* The shine: the same gift at full white, seen only through a band of light that sweeps across now and then. */}
          <span className="rk-gift__glint">
            <Gift strokeWidth={2.5} />
          </span>
        </span>
        <span className="rk-gift__sheen" aria-hidden="true" />
      </div>
    </div>
  );
}
