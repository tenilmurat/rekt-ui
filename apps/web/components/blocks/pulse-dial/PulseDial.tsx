"use client";

import { useEffect, useRef, useState } from "react";

export type PulseDialProps = {
  /** The dial's width and height, in px. */
  size?: number;
  /** The dust's colour: a soft violet, or the dial's own ink. */
  tone?: "violet" | "ink";
  /** How many grains a burst throws. */
  grains?: number;
  /** How long a burst takes to reach the rim and fade, in milliseconds. */
  speed?: number;
  /** Burst on its own every few seconds, as well as on click. */
  auto?: boolean;
  /** A small line under the dial; empty hides it. */
  hint?: string;
  /** What the button does, for screen readers. */
  label?: string;
  onClick?: () => void;
};

/** The Rekt mark: a rounded square frame. */
const LOGO_PATH =
  "M19 0C21.2091 0 23 1.79086 23 4V16C23 18.2091 21.2091 20 19 20H4C1.79094 19.9999 0 18.2091 0 16V4C0 1.79092 1.79094 0 4 0H19ZM5 4C4.44772 4 4 4.44772 4 5V15C4 15.5523 4.44772 16 5 16H18C18.5523 16 19 15.5523 19 15V5C19 4.44772 18.5523 4 18 4H5Z";

const TONES = {
  violet: "#6f62e0",
  ink: "#141210",
};

/** Seconds between bursts with auto on. */
const AUTO_EVERY = 2.6;

type Grain = {
  angle: number;
  /** Where it starts, as a share of the rim's radius. */
  from: number;
  /** How far it gets, as a share of the rim's radius. */
  to: number;
  /** A little sideways drift, in radians over the flight. */
  drift: number;
  size: number;
  alpha: number;
  delay: number;
  life: number;
};
type Burst = { start: number; grains: Grain[] };

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const smoothstep = (a: number, b: number, t: number) => {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
/** A roughly bell-shaped random number in −1…1. */
const bell = () => (Math.random() + Math.random() + Math.random()) / 1.5 - 1;

/**
 * A round dial with the Rekt mark at its centre, ringed by thin circles,
 * two slowly turning arcs and a crown of ticks. Click it and a cloud of
 * fine dust bursts from the mark, swells into a ring as it crosses the
 * dial and fades at the rim, while the mark itself gives a small pulse.
 */
export function PulseDial({
  size = 240,
  tone = "violet",
  grains = 1800,
  speed = 1400,
  auto = false,
  hint = "Click me",
  label = "Pulse",
  onClick,
}: PulseDialProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bursts = useRef<Burst[]>([]);
  const frame = useRef(0);
  const [pulse, setPulse] = useState(0);
  const color = TONES[tone] ?? TONES.violet;

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Draws every burst still in flight, each frame, until none is left.
  const paint = (now: number) => {
    frame.current = 0;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const side = Math.ceil(size * dpr);
    if (canvas.width !== side || canvas.height !== side) {
      canvas.width = side;
      canvas.height = side;
    }
    context.setTransform(dpr, 0, 0, dpr, side / 2, side / 2);
    context.clearRect(-size / 2, -size / 2, size, size);
    const rim = size / 2;
    const duration = Math.max(300, speed);

    bursts.current = bursts.current.filter((b) => (now - b.start) / duration < 1.1);
    context.fillStyle = color;
    for (const b of bursts.current) {
      const t = (now - b.start) / duration;
      // The glow at the heart of the burst: bright at first, gone by a third.
      const heart = 1 - smoothstep(0, 0.35, t);
      if (heart > 0) {
        const glow = context.createRadialGradient(0, 0, 0, 0, 0, rim * 0.22);
        glow.addColorStop(0, `${color}${Math.round(heart * 0.35 * 255).toString(16).padStart(2, "0")}`);
        glow.addColorStop(1, `${color}00`);
        context.fillStyle = glow;
        context.fillRect(-rim, -rim, size, size);
        context.fillStyle = color;
      }
      for (const g of b.grains) {
        const local = Math.min(1, Math.max(0, (t - g.delay) / g.life));
        if (local >= 1 || local <= 0) continue;
        const k = easeOut(local);
        const r = rim * (g.from + (g.to - g.from) * k);
        const a = g.angle + g.drift * k;
        // In quickly, out slowly as it nears the rim.
        context.globalAlpha = g.alpha * smoothstep(0, 0.08, local) * (1 - smoothstep(0.55, 1, local));
        context.fillRect(Math.cos(a) * r - g.size / 2, Math.sin(a) * r - g.size / 2, g.size, g.size);
      }
    }
    context.globalAlpha = 1;
    if (bursts.current.length) frame.current = requestAnimationFrame(paint);
  };

  const burst = () => {
    setPulse((p) => p + 1);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const count = Math.max(50, Math.min(4000, Math.round(grains)));
    const dust: Grain[] = [];
    for (let i = 0; i < count; i++) {
      // Most grains start near the mark and fly to the rim; the spread in
      // speed is what turns the cloud into a thick ring on its way out.
      const reach = 0.78 + Math.random() * 0.26;
      dust.push({
        angle: Math.random() * Math.PI * 2,
        from: 0.06 + Math.abs(bell()) * 0.12,
        to: reach,
        drift: bell() * 0.35,
        size: 1 + Math.random() * 1.4,
        alpha: 0.35 + Math.random() ** 1.4 * 0.65,
        delay: Math.random() * 0.12,
        life: 0.78 + Math.random() * 0.22,
      });
    }
    bursts.current.push({ start: performance.now(), grains: dust });
    if (!frame.current) frame.current = requestAnimationFrame(paint);
  };

  // Auto: a burst every few seconds, the way a signal pulses on its own.
  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(burst, AUTO_EVERY * 1000);
    const first = window.setTimeout(burst, 400);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, grains, speed]);

  const ticks = Array.from({ length: 36 }, (_, i) => (i / 36) * 360);

  return (
    <div className="rk-pulse" style={{ "--rk-pulse-dust": color } as React.CSSProperties}>
      <button
        type="button"
        className="rk-pulse__dial"
        style={{ width: size, height: size }}
        aria-label={label}
        onClick={() => {
          burst();
          onClick?.();
        }}
      >
        {/* The rings, in SVG so they stay crisp at any size. */}
        <svg className="rk-pulse__rings" viewBox="-100 -100 200 200" aria-hidden="true">
          <circle className="rk-pulse__ring" r="98" />
          <circle className="rk-pulse__ring rk-pulse__ring--soft" r="86" />
          <circle className="rk-pulse__ring" r="72" />
          <circle className="rk-pulse__ring rk-pulse__ring--soft" r="56" />
          {/* Two arcs that turn slowly, in opposite directions. */}
          <g className="rk-pulse__arc rk-pulse__arc--cw">
            <circle r="86" pathLength="100" strokeDasharray="28 72" />
          </g>
          <g className="rk-pulse__arc rk-pulse__arc--ccw">
            <circle r="72" pathLength="100" strokeDasharray="18 82" strokeDashoffset="-50" />
          </g>
          {/* The crown of ticks inside. */}
          <g className="rk-pulse__ticks">
            {ticks.map((deg) => (
              <line key={deg} x1="0" y1="-44" x2="0" y2={deg % 90 === 0 ? -38 : -40.5} transform={`rotate(${deg})`} />
            ))}
          </g>
        </svg>
        <canvas ref={canvasRef} className="rk-pulse__dust" style={{ width: size, height: size }} aria-hidden="true" />
        <span key={pulse} className="rk-pulse__mark" data-pulse={pulse > 0 ? "true" : undefined} aria-hidden="true">
          <svg viewBox="0 0 23 20">
            <path d={LOGO_PATH} fillRule="evenodd" />
          </svg>
        </span>
      </button>
      {hint ? (
        <span className="rk-pulse__hint" aria-hidden="true">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
