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
 * A fern leaf, lying along +x from the stem: plump, pointed at both ends,
 * its tip curling a little toward -y.
 */
const leafPath = (length: number) => {
  const l = length;
  const w = length * 0.22;
  return `M0 0C${l * 0.2} ${-w * 1.5} ${l * 0.62} ${-w * 1.6} ${l} ${-w * 0.25}C${l * 0.7} ${w * 0.9} ${l * 0.25} ${w * 0.9} 0 0Z`;
};

/**
 * A fern branch drawn from its base at the origin along +x: a straight stem
 * with four pairs of big leaves leaning toward the tip, the lower leaf of
 * each pair a step behind the upper, and one leaf at the tip. Each leaf's tip
 * curls toward the branch's tip. The inner group sways on the base; the
 * outer one places the branch.
 */
function Fern({ x, y, angle, length, delay }: { x: number; y: number; angle: number; length: number; delay: number }) {
  const leaf = length * 0.3;
  const leaves = [0.14, 0.36, 0.58, 0.78].flatMap((t, i) =>
    [-1, 1].map((side) => ({
      key: `${i}${side}`,
      at: (t + (side > 0 ? 0.05 : 0)) * length,
      side,
      length: leaf * (i === 3 ? 0.9 : 1),
    })),
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <g className="rk-gift__sway" style={{ "--rk-gift-delay": `${delay}s` } as React.CSSProperties}>
        <path className="rk-gift__stem" d={`M0 0H${length}`} style={{ strokeWidth: length * 0.04 }} />
        {leaves.map((l) => (
          <path
            key={l.key}
            d={leafPath(l.length)}
            // The leaf's tip curls toward -y, so the upper leaves are mirrored to curl toward the branch's tip too.
            transform={`translate(${l.at.toFixed(1)} 0) rotate(${l.side * 42})${l.side < 0 ? " scale(1 -1)" : ""}`}
          />
        ))}
        <path d={leafPath(length * 0.34)} transform={`translate(${length * 0.97} 0)`} />
      </g>
    </g>
  );
}

/**
 * The fern pattern, as in the design: the same branch at a few places, sizes
 * and angles. One rises from the bottom left, one rises along the right edge,
 * one reaches down from the top and a small one lies along the bottom, all
 * clear of the gift.
 */
function Ferns() {
  return (
    <>
      <Fern x={-4} y={198} angle={-48} length={140} delay={0} />
      <Fern x={332} y={214} angle={-112} length={150} delay={-2.2} />
      <Fern x={156} y={-30} angle={152} length={96} delay={-1.4} />
      <Fern x={136} y={228} angle={-18} length={88} delay={-3.1} />
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

const PATTERNS = { fern: Ferns, confetti: Confetti, rings: Rings, stars: Stars };

/**
 * A glassy gift card: a soft glow drifts slowly behind a pattern of white
 * line art (fern branches that sway, or confetti, rings or stars), with a
 * softly glowing gift at the centre. On hover it tips toward the pointer
 * and a sheen slides across.
 */
export function GiftCard({
  pattern = "fern",
  shape = "rounded",
  palette = "ocean",
  width = 96,
  tilt = true,
  label = "Gift card",
}: GiftCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const Pattern = PATTERNS[pattern] ?? Ferns;

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
        </svg>
        {/* A soft white bloom behind the gift, as if it gave off light. */}
        <span className="rk-gift__bloom" aria-hidden="true" />
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
