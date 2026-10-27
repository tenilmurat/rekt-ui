"use client";

import { CircleCheckBig } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type IconBurstProps = {
  /** The icon's size, in px. */
  size?: number;
  /** How far the dust drifts out, in px. */
  spread?: number;
  /** How long the burst lasts, in milliseconds; the icon grows back a little over halfway. */
  speed?: number;
  /** Space between dust grains, in px: smaller is finer and denser. */
  grain?: number;
  /** What the icon means, for screen readers. */
  label?: string;
  onClick?: () => void;
};

type Grain = { x: number; y: number; tx: number; ty: number; alpha: number; delay: number; life: number };

/** Draws the icon on a hidden canvas and keeps one grain for every few of its pixels. */
const sample = async (svg: SVGSVGElement, size: number, step: number, color: string) => {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const markup = new XMLSerializer().serializeToString(svg).replaceAll("currentColor", color);
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  await image.decode();

  const side = Math.ceil(size * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const context = canvas.getContext("2d");
  if (!context) return [];
  context.drawImage(image, 0, 0, side, side);
  const { data } = context.getImageData(0, 0, side, side);

  const points: { x: number; y: number; alpha: number }[] = [];
  const stride = Math.max(1, Math.round(step * dpr));
  for (let y = 0; y < side; y += stride) {
    for (let x = 0; x < side; x += stride) {
      const alpha = data[(y * side + x) * 4 + 3] / 255;
      // Centred on the icon, in CSS px.
      if (alpha > 0.3) points.push({ x: x / dpr - size / 2, y: y / dpr - size / 2, alpha });
    }
  }
  return points;
};

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * One icon that bursts into dust on hover: it vanishes into a cloud of fine
 * grains, sampled from its own pixels, that drift outward and fade, and then
 * it grows back from a point in the middle with a little spring. Hover again
 * once it's back to replay it.
 */
export function IconBurst({
  size = 40,
  spread = 34,
  speed = 900,
  grain = 1.25,
  label = "Done",
  onClick,
}: IconBurstProps) {
  const [gone, setGone] = useState(false);
  const iconRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const points = useRef<{ x: number; y: number; alpha: number }[]>([]);
  const frame = useRef(0);
  const regrow = useRef(0);
  const busy = useRef(false);

  // The canvas leaves room round the icon for the dust to drift into.
  const room = size + spread * 2 + 8;

  // Sample the icon once, and again whenever its size or grain changes.
  useEffect(() => {
    const svg = iconRef.current;
    if (!svg) return;
    let live = true;
    const color = getComputedStyle(svg).color;
    sample(svg, size, Math.max(0.5, grain), color)
      .then((found) => {
        if (live) points.current = found;
      })
      .catch(() => {
        points.current = [];
      });
    return () => {
      live = false;
    };
  }, [size, grain]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      window.clearTimeout(regrow.current);
    },
    [],
  );

  const burst = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (busy.current || !canvas || !context) return;
    busy.current = true;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = Math.max(200, speed);
    setGone(true);
    regrow.current = window.setTimeout(() => setGone(false), duration * (reduced ? 0.4 : 0.58));
    if (reduced || !points.current.length) {
      window.setTimeout(() => (busy.current = false), duration);
      return;
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.ceil(room * dpr);
    canvas.height = Math.ceil(room * dpr);
    context.setTransform(dpr, 0, 0, dpr, (room * dpr) / 2, (room * dpr) / 2);
    context.fillStyle = getComputedStyle(canvas).color;

    // Each grain drifts to a random spot in a soft disc round the icon, leaning outward
    // from where it started, so the outline loosens into one even cloud of dust.
    const reach = size / 2 + spread;
    const grains: Grain[] = points.current.map((p) => {
      const angle = Math.random() * Math.PI * 2;
      const r = reach * Math.sqrt(Math.random());
      const away = Math.hypot(p.x, p.y) > 0.5 ? Math.atan2(p.y, p.x) : angle;
      const push = spread * 0.35 * Math.random();
      return {
        x: p.x,
        y: p.y,
        tx: Math.cos(angle) * r * 0.75 + p.x * 0.25 + Math.cos(away) * push,
        ty: Math.sin(angle) * r * 0.75 + p.y * 0.25 + Math.sin(away) * push,
        alpha: p.alpha * (0.55 + Math.random() * 0.45),
        delay: Math.random() * 0.12,
        life: 0.55 + Math.random() * 0.45,
      };
    });

    const start = performance.now();
    const half = room / 2;
    const paint = (now: number) => {
      const t = Math.max(0, now - start) / duration;
      context.clearRect(-half, -half, room, room);
      for (const g of grains) {
        const local = Math.min(1, Math.max(0, (t - g.delay) / g.life));
        if (local >= 1) continue;
        const k = easeOut(local);
        // Holds most of its strength through the drift, then thins out.
        context.globalAlpha = g.alpha * (1 - local ** 2.2);
        context.fillRect(g.x + (g.tx - g.x) * k - 0.5, g.y + (g.ty - g.y) * k - 0.5, 1, 1);
      }
      context.globalAlpha = 1;
      if (t < 1.2) frame.current = requestAnimationFrame(paint);
      else {
        context.clearRect(-half, -half, room, room);
        busy.current = false;
      }
    };
    frame.current = requestAnimationFrame(paint);
  };

  return (
    <button
      type="button"
      className="rk-burst"
      aria-label={label}
      style={{ width: size + 32, height: size + 32 }}
      onPointerEnter={burst}
      onFocus={burst}
      onClick={() => {
        burst();
        onClick?.();
      }}
    >
      <CircleCheckBig
        ref={iconRef}
        className="rk-burst__icon"
        data-gone={gone}
        size={size}
        strokeWidth={2}
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        className="rk-burst__dust"
        style={{ width: room, height: room }}
        aria-hidden="true"
      />
    </button>
  );
}
