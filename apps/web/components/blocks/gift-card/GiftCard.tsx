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

/** An almond leaf, lying along +x from its stalk. */
const leafPath = (length: number, width: number) =>
  `M0 0Q${length / 2} ${-width} ${length} 0Q${length / 2} ${width} 0 0Z`;

/**
 * A laurel branch, drawn from its base at the origin along +x: a gently
 * curving stem with leaves in pairs that shrink toward the tip. The inner
 * group sways on its base; the outer one places the branch.
 */
function Branch({ x, y, angle, scale, leaves, delay, leaf = 1 }: { x: number; y: number; angle: number; scale: number; leaves: number; delay: number; leaf?: number }) {
  // The stem: a quadratic curve from (0,0) through (55,-8) to (110,-30).
  const point = (t: number) => {
    const u = 1 - t;
    return { x: 2 * u * t * 55 + t * t * 110, y: 2 * u * t * -8 + t * t * -30 };
  };
  const tangent = (t: number) => {
    const dx = 2 * (1 - t) * 55 + 2 * t * (110 - 55);
    const dy = 2 * (1 - t) * -8 + 2 * t * (-30 + 8);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };
  const items = Array.from({ length: leaves }, (_, i) => {
    const t = 0.12 + (i / leaves) * 0.82;
    const p = point(t);
    const size = 1 - i / (leaves * 1.6);
    return [-1, 1].map((side) => ({
      key: `${i}${side}`,
      x: p.x,
      y: p.y,
      angle: tangent(t) + side * 48,
      length: 28 * size * leaf,
      width: 12 * size * leaf,
    }));
  }).flat();
  const tip = point(1);
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <g className="rk-gift__sway" style={{ "--rk-gift-delay": `${delay}s` } as React.CSSProperties}>
        <path className="rk-gift__stem" d="M0 0Q55 -8 110 -30" />
        {items.map((l) => (
          <path key={l.key} d={leafPath(l.length, l.width)} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.angle.toFixed(1)})`} />
        ))}
        <path d={leafPath(24 * leaf, 10 * leaf)} transform={`translate(${tip.x} ${tip.y}) rotate(${tangent(1).toFixed(1)})`} />
      </g>
    </g>
  );
}

/**
 * The laurel pattern, as in the design: a few big, soft shapes rather than
 * many small ones. A branch of broad leaves up the left, a thick crescent at
 * the top, and down the right two crossing stems with a big leaf at the top
 * edge and a sprout of two leaves at the bottom.
 */
function Laurel() {
  return (
    <>
      <Branch x={-12} y={194} angle={-44} scale={1.2} leaves={3} leaf={1.7} delay={0} />
      <g className="rk-gift__sway" style={{ "--rk-gift-delay": "-1.4s", transformOrigin: "102px 34px" } as React.CSSProperties}>
        <path className="rk-gift__stem rk-gift__stem--thick" d="M82 44A22 22 0 1 1 124 28" />
      </g>
      <g className="rk-gift__sway" style={{ "--rk-gift-delay": "-2.6s", transformOrigin: "252px 202px" } as React.CSSProperties}>
        <path className="rk-gift__stem rk-gift__stem--thick" d="M306 30Q292 118 250 206" />
        <path className="rk-gift__stem rk-gift__stem--thick" d="M224 108Q262 96 304 58" />
        <path d={leafPath(64, 24)} transform="translate(300 54) rotate(-96)" />
        <path d={leafPath(50, 20)} transform="translate(258 196) rotate(-150)" />
        <path d={leafPath(44, 18)} transform="translate(258 196) rotate(-22)" />
      </g>
    </>
  );
}

/** Confetti: small strips and dots scattered over the card, each bobbing on its own beat. */
function Confetti() {
  const rnd = seeded(11);
  return (
    <>
      {Array.from({ length: 30 }, (_, i) => {
        const x = rnd() * VB_W;
        const y = rnd() * VB_H;
        const r = rnd() * 180;
        const dot = rnd() < 0.35;
        return (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(0)})`}>
            <g className="rk-gift__bob" style={{ "--rk-gift-delay": `${(-rnd() * 4).toFixed(2)}s` } as React.CSSProperties}>
              {dot ? <circle r={2 + rnd() * 1.5} /> : <rect x={-6} y={-1.6} width={12} height={3.2} rx={1.6} />}
            </g>
          </g>
        );
      })}
    </>
  );
}

/** Rings: thin circles spreading from the top-right corner, breathing out in turn. */
function Rings() {
  return (
    <g transform={`translate(${VB_W - 40} 34)`}>
      {[34, 70, 108, 148, 190, 234].map((r, i) => (
        <circle key={r} className="rk-gift__ring" r={r} style={{ "--rk-gift-delay": `${-i * 0.6}s` } as React.CSSProperties} />
      ))}
    </g>
  );
}

/** Stars: four-point sparkles of a few sizes that twinkle in turn. */
function Stars() {
  const rnd = seeded(5);
  return (
    <>
      {Array.from({ length: 20 }, (_, i) => {
        const x = rnd() * VB_W;
        const y = rnd() * VB_H;
        const s = 3 + rnd() * 7;
        return (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
            <path
              className="rk-gift__twinkle"
              d={`M0 ${-s}Q0 0 ${s} 0Q0 0 0 ${s}Q0 0 ${-s} 0Q0 0 0 ${-s}Z`}
              style={{ "--rk-gift-delay": `${(-rnd() * 3).toFixed(2)}s` } as React.CSSProperties}
            />
          </g>
        );
      })}
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
