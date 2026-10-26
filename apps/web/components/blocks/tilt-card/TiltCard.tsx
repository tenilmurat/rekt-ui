"use client";

import { useEffect, useRef, useState } from "react";

export type TiltCardProps = {
  /** "lift" leans the card toward the pointer; "sink" presses it away, as if pushed. */
  direction?: "lift" | "sink";
  /** Largest tilt, in degrees. */
  tilt?: number;
  /** How strongly the far side darkens and the shadow moves, 0–100. */
  shade?: number;
  /** Corner radius, in px. */
  corner?: number;
  /** A soft light that follows the pointer across the surface. */
  glare?: boolean;
  /** "holo" is a dark card with an iridescent foil that follows the pointer; "color" is soft colour fields. */
  finish?: "holo" | "color";
  /** The small line at the top left of the front. */
  label?: string;
  /** The small mark at the top right of the front. */
  index?: string;
  /** The name on the front. */
  title?: string;
  /** The line under the name. */
  caption?: string;
  /** The heading on the back. */
  backTitle?: string;
  /** The text on the back. */
  backText?: string;
};

type Pose = { rx: number; ry: number; gx: number; gy: number; glow: number };
const REST: Pose = { rx: 0, ry: 0, gx: 50, gy: 50, glow: 0 };

/** A Sierpinski triangle as a list of SVG polygons, three levels deep. */
function sierpinski(depth: number): string[] {
  const out: string[] = [];
  type P = [number, number];
  const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const split = (a: P, b: P, c: P, level: number) => {
    if (level === 0) {
      out.push([a, b, c].map((p) => p.map((n) => n.toFixed(2)).join(",")).join(" "));
      return;
    }
    const ab = mid(a, b);
    const bc = mid(b, c);
    const ca = mid(c, a);
    split(a, ab, ca, level - 1);
    split(ab, b, bc, level - 1);
    split(ca, bc, c, level - 1);
  };
  split([50, 2], [2, 85], [98, 85], depth);
  return out;
}

const TRIANGLES = sierpinski(3);

/** The same triangle as an image, used to cut the emblem's foil to its hairlines. */
const TRIANGLE_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 87">${TRIANGLES.map(
    (p) => `<polygon points="${p}" fill="none" stroke="#000" stroke-width="1.1" stroke-linejoin="round"/>`,
  ).join("")}</svg>`,
)}")`;

/**
 * A card that tilts in 3D under the pointer, with a glare and a shade that
 * follow it, and turns over to its back when pressed. The motion eases toward
 * the pointer each frame, so it stays smooth however fast the pointer moves.
 */
export function TiltCard({
  direction = "lift",
  tilt = 12,
  shade = 50,
  corner = 24,
  glare = true,
  finish = "holo",
  label = "Rekt UI",
  index = "No. 001",
  title = "Holographic",
  caption = "Tilt card edition",
  backTitle = "The other side",
  backText = "Press the card again to turn it back. It tilts on this side too.",
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const target = useRef<Pose>({ ...REST });
  const current = useRef<Pose>({ ...REST });
  const frame = useRef(0);
  const [flipped, setFlipped] = useState(false);

  // Write the pose as CSS variables; the stylesheet does the rest.
  const paint = () => {
    const card = cardRef.current;
    if (!card) return;
    const p = current.current;
    card.style.setProperty("--rk-tilt-rx", `${p.rx.toFixed(2)}deg`);
    card.style.setProperty("--rk-tilt-ry", `${p.ry.toFixed(2)}deg`);
    card.style.setProperty("--rk-tilt-gx", `${p.gx.toFixed(1)}%`);
    card.style.setProperty("--rk-tilt-gy", `${p.gy.toFixed(1)}%`);
    card.style.setProperty("--rk-tilt-glow", p.glow.toFixed(3));
    // The shadow drifts away from the raised edge.
    card.style.setProperty("--rk-tilt-sx", `${(-p.ry * 1.2).toFixed(1)}px`);
    card.style.setProperty("--rk-tilt-sy", `${(p.rx * 1.2 + 18).toFixed(1)}px`);
  };

  // Ease the current pose toward the target, and stop once it has settled.
  const step = () => {
    const c = current.current;
    const t = target.current;
    let moving = false;
    for (const key of Object.keys(c) as (keyof Pose)[]) {
      const delta = t[key] - c[key];
      if (Math.abs(delta) > 0.01) moving = true;
      c[key] += delta * 0.14;
    }
    paint();
    frame.current = moving ? requestAnimationFrame(step) : 0;
  };

  const start = () => {
    if (!frame.current) frame.current = requestAnimationFrame(step);
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    const sign = direction === "sink" ? -1 : 1;
    target.current = {
      rx: py * tilt * 2 * sign,
      ry: -px * tilt * 2 * sign,
      gx: (px + 0.5) * 100,
      gy: (py + 0.5) * 100,
      glow: 1,
    };
    start();
  };

  const onPointerLeave = () => {
    target.current = { ...REST, gx: current.current.gx, gy: current.current.gy };
    start();
  };

  return (
    <div
      className="rk-tilt"
      style={
        {
          "--rk-tilt-radius": `${corner}px`,
          "--rk-tilt-shade": Math.min(100, Math.max(0, shade)) / 100,
        } as React.CSSProperties
      }
    >
      {/* A div with button semantics, not a <button>: browsers flatten 3D
          content inside a real button, which would break the flip. */}
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        className="rk-tilt__card"
        aria-pressed={flipped}
        aria-label={`${title}. ${flipped ? "Showing the back" : "Showing the front"}. Press to turn it over.`}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        <span className="rk-tilt__flipper" data-flipped={flipped}>
          <span className="rk-tilt__face rk-tilt__front" data-finish={finish} aria-hidden={flipped}>
            {finish === "holo" ? (
              <>
                {/* Fine wavy lines the foil shows through. */}
                <span className="rk-tilt__lines" />
                <span className="rk-tilt__foil" />
                <span className="rk-tilt__emblem" style={{ "--rk-tilt-tri": TRIANGLE_MASK } as React.CSSProperties}>
                  <svg viewBox="0 0 100 87" className="rk-tilt__triangle">
                    {TRIANGLES.map((points) => (
                      <polygon key={points} points={points} />
                    ))}
                  </svg>
                  <span className="rk-tilt__emblem-foil" />
                </span>
              </>
            ) : (
              <span className="rk-tilt__art" />
            )}
            <span className="rk-tilt__top">
              <span className="rk-tilt__label">{label}</span>
              <span className="rk-tilt__label">{index}</span>
            </span>
            <span className="rk-tilt__name">
              <span className="rk-tilt__title">{title}</span>
              <span className="rk-tilt__caption">{caption}</span>
            </span>
            <span className="rk-tilt__shade" />
            {glare ? <span className="rk-tilt__glare" /> : null}
          </span>
          <span className="rk-tilt__face rk-tilt__back" aria-hidden={!flipped}>
            <span className="rk-tilt__label">{label}</span>
            <span className="rk-tilt__back-title">{backTitle}</span>
            <span className="rk-tilt__back-text">{backText}</span>
            <span className="rk-tilt__hint">Press to turn back</span>
            <span className="rk-tilt__shade" />
            {glare ? <span className="rk-tilt__glare" /> : null}
          </span>
        </span>
      </div>
    </div>
  );
}
