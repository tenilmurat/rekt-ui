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
  /** Where the pattern's shapes sit: 0 is the designed layout; any other number shuffles them, and the same number always lands the same. */
  layout?: number;
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
 * A fern leaf, lying along +x from the stem: pinched where it joins the stem
 * (so the stem shows between the leaves), plump in the middle and pointed,
 * its tip curling a little toward -y.
 */
const leafPath = (length: number) => {
  const l = length;
  const w = length * 0.27;
  return `M0 0C${l * 0.3} ${-w * 0.2} ${l * 0.42} ${-w * 1.9} ${l} ${-w * 0.25}C${l * 0.74} ${w * 0.9} ${l * 0.4} ${w * 0.6} 0 0Z`;
};

/**
 * A fern branch drawn from its base at the origin along +x: a sturdy,
 * straight stem, bare for its first fifth, then four pairs of big leaves
 * leaning toward the tip, the lower leaf of each pair a step behind the
 * upper, and one leaf at the tip. Each leaf's tip
 * curls toward the branch's tip. The inner group sways on the base; the
 * outer one places the branch.
 */
function Fern({ x, y, angle, length, delay }: { x: number; y: number; angle: number; length: number; delay: number }) {
  const leaf = length * 0.3;
  const leaves = [0.2, 0.4, 0.6, 0.78].flatMap((t, i) =>
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
        <path className="rk-gift__stem" d={`M0 0H${length}`} style={{ strokeWidth: length * 0.05 }} />
        {leaves.map((l) => (
          <path
            key={l.key}
            d={leafPath(l.length)}
            // The leaf's tip curls toward -y, so the upper leaves are mirrored to curl toward the branch's tip too.
            transform={`translate(${l.at.toFixed(1)} 0) rotate(${l.side * 48})${l.side < 0 ? " scale(1 -1)" : ""}`}
          />
        ))}
        <path d={leafPath(length * 0.34)} transform={`translate(${length * 0.97} 0)`} />
      </g>
    </g>
  );
}

/**
 * Where a fern can grow without crossing the gift: [x, y, angle, length],
 * one list per side of the card, so two branches never crowd one corner.
 * The first spot on each side is the designed layout.
 */
const FERN_SPOTS = [
  [
    [-4, 198, -48, 140], // rising from the bottom left
    [-20, 40, 25, 110], // reaching in from the left
  ],
  [
    [156, -30, 152, 96], // reaching down from the top
    [40, -24, 70, 100], // hanging from the top left
  ],
  [
    [332, 214, -112, 150], // rising along the right edge
    [300, -20, 120, 100], // hanging from the top right
    [340, 120, -160, 90], // reaching in from the right
  ],
  [
    [136, 228, -18, 88], // lying along the bottom
    [196, 228, -162, 88], // lying along the bottom, the other way
  ],
];

/** The random source for a shuffled layout; the same layout number always lands the same. */
const shuffled = (layout: number, salt: number) => seeded(layout * 7919 + salt);

/**
 * The fern pattern, as in the design: the same branch at a few places, sizes
 * and angles, all clear of the gift. A shuffled layout picks one spot on
 * each side of the card and turns and sizes each branch a little.
 */
function Ferns({ layout }: { layout: number }) {
  const rnd = shuffled(layout, 11);
  const spots = FERN_SPOTS.map((side) => {
    if (!layout) return side[0];
    const [x, y, angle, length] = side[Math.floor(rnd() * side.length)];
    return [x, y, angle + (rnd() - 0.5) * 20, length * (0.85 + rnd() * 0.3)];
  });
  return (
    <>
      {spots.map(([x, y, angle, length], i) => (
        <Fern key={i} x={x} y={y} angle={Math.round(angle)} length={Math.round(length)} delay={-[0, 1.4, 2.2, 3.1][i]} />
      ))}
    </>
  );
}

/** Confetti: a handful of big, soft pieces (strips, dots and small arcs), each bobbing on its own beat. */
function Confetti({ layout }: { layout: number }) {
  const rnd = layout ? shuffled(layout, 23) : seeded(23);
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

/** Rings: a few thick circles spreading from a corner (the top right, or any corner when shuffled), breathing out in turn. */
function Rings({ layout }: { layout: number }) {
  const rnd = shuffled(layout, 5);
  const corners = [
    [VB_W - 30, 30],
    [30, 30],
    [30, VB_H - 30],
    [VB_W - 30, VB_H - 30],
  ];
  const [x, y] = layout ? corners[Math.floor(rnd() * 4)] : corners[0];
  const grow = layout ? 0.85 + rnd() * 0.3 : 1;
  return (
    <g transform={`translate(${x} ${y})`}>
      {[46, 96, 150, 208].map((r, i) => (
        <circle key={r} className="rk-gift__ring" r={Math.round(r * grow)} style={{ "--rk-gift-delay": `${-i * 0.7}s` } as React.CSSProperties} />
      ))}
    </g>
  );
}

/**
 * Stars: a few soft four-point sparkles of different sizes that twinkle in
 * turn. Shuffled, there's one in each sixth of the card, the middle two kept
 * above and below the gift.
 */
function Stars({ layout }: { layout: number }) {
  let spots = [
    [48, 50, 26],
    [96, 150, 16],
    [34, 160, 12],
    [246, 40, 20],
    [216, 168, 14],
    [154, 24, 11],
  ];
  if (layout) {
    const rnd = shuffled(layout, 3);
    spots = Array.from({ length: 6 }, (_, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = (col + 0.15 + rnd() * 0.7) * (VB_W / 3);
      const y = col === 1 ? (row ? 166 + rnd() * 24 : 14 + rnd() * 26) : (row + 0.15 + rnd() * 0.7) * (VB_H / 2);
      return [Math.round(x), Math.round(y), Math.round(10 + rnd() * 16)];
    });
  }
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
  layout = 0,
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
            <Pattern layout={Math.round(Math.abs(layout))} />
          </g>
        </svg>
        {/* A soft white bloom behind the gift, as if it gave off light. */}
        <span className="rk-gift__bloom" aria-hidden="true" />
        <span className="rk-gift__icon" aria-hidden="true">
          <Gift strokeWidth={3} />
          {/* A thin bright line down the middle of each stroke, so the outline reads as a frosted glass tube. */}
          <span className="rk-gift__core">
            <Gift strokeWidth={1.2} />
          </span>
          {/* The shine: the same gift at full white, seen only through a band of light that sweeps across now and then. */}
          <span className="rk-gift__glint">
            <Gift strokeWidth={3} />
          </span>
        </span>
        <span className="rk-gift__sheen" aria-hidden="true" />
      </div>
    </div>
  );
}
