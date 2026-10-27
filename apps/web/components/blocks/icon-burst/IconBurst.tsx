"use client";

import {
  Bell,
  Bookmark,
  CircleCheckBig,
  Flame,
  Gift,
  Heart,
  Rocket,
  Smile,
  Star,
  ThumbsUp,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** The built-in icons, by their Lucide names. */
const ICONS = {
  "circle-check-big": CircleCheckBig,
  heart: Heart,
  star: Star,
  "thumbs-up": ThumbsUp,
  bell: Bell,
  bookmark: Bookmark,
  zap: Zap,
  flame: Flame,
  rocket: Rocket,
  gift: Gift,
  trophy: Trophy,
  smile: Smile,
} satisfies Record<string, LucideIcon>;

export type IconBurstName = keyof typeof ICONS;

export type IconBurstProps = {
  /** One of the built-in icons by name, or any Lucide icon component. */
  icon?: IconBurstName | LucideIcon;
  /** The icon's size, in px. */
  size?: number;
  /** How far the dust drifts out, in px. */
  spread?: number;
  /** How long the burst lasts, in milliseconds; the icon grows back a little over halfway. */
  speed?: number;
  /** Space between dust grains, in px: smaller is finer and denser. */
  grain?: number;
  /** Colourful dust instead of the icon's own colour. */
  colorful?: boolean;
  /** A small line under the icon; empty hides it. */
  hint?: string;
  /** What the button does, for screen readers. */
  label?: string;
  onClick?: () => void;
};

/** The colourful dust: a warm-to-cool ramp, handed out round the icon so neighbours share a colour. */
const DUST = ["#ff5e5b", "#ff6f91", "#ff9b3d", "#ffd23f", "#9be15d", "#1fc98f", "#19b5c8"];

/** How often a point gets a second grain. */
const EXTRA = 0.25;

type Point = { x: number; y: number; alpha: number };
type Grain = { x: number; y: number; tx: number; ty: number; alpha: number; size: number; delay: number; life: number };
type Burst = { start: number; layers: { color: string; grains: Grain[] }[] };

/** Draws the icon on a hidden canvas and keeps one point for every few of its pixels. */
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

  const points: Point[] = [];
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

/** Fast off the mark, then a long, soft glide. */
const easeOut = (t: number) => 1 - (1 - t) ** 4;
const smoothstep = (from: number, to: number, t: number) => {
  const k = Math.min(1, Math.max(0, (t - from) / (to - from)));
  return k * k * (3 - 2 * k);
};

/**
 * One icon that bursts into dust when you click it: it vanishes into a cloud
 * of fine grains, sampled from its own pixels, that fly out, glide to a stop
 * and fade away gently, while the icon grows back from a point in the middle
 * with a little spring. The dust is the icon's colour, or colourful.
 */
export function IconBurst({
  icon = "circle-check-big",
  size = 40,
  spread = 44,
  speed = 1600,
  grain = 1,
  colorful = true,
  hint = "Click me",
  label = "Done",
  onClick,
}: IconBurstProps) {
  const Icon = typeof icon === "string" ? (ICONS[icon] ?? CircleCheckBig) : icon;
  const [gone, setGone] = useState(false);
  const iconRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const points = useRef<Point[]>([]);
  const bursts = useRef<Burst[]>([]);
  const frame = useRef(0);
  const regrow = useRef(0);
  const goneRef = useRef(false);

  // The canvas leaves room round the icon for the dust to drift into.
  const room = Math.ceil(size + spread * 2.4 + 12);

  // Sample the icon once, and again whenever it, its size or the grain changes.
  useEffect(() => {
    const svg = iconRef.current;
    if (!svg) return;
    let live = true;
    sample(svg, size, Math.max(0.5, grain), getComputedStyle(svg).color)
      .then((found) => {
        if (live) points.current = found;
      })
      .catch(() => {
        points.current = [];
      });
    return () => {
      live = false;
    };
  }, [Icon, size, grain]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      window.clearTimeout(regrow.current);
    },
    [],
  );

  // Every burst still drifting is drawn each frame, so a quick second click adds to the cloud.
  const paint = (now: number) => {
    frame.current = 0;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const duration = Math.max(300, speed);
    const half = room / 2;
    context.clearRect(-half, -half, room, room);

    bursts.current = bursts.current.filter((burst) => Math.max(0, now - burst.start) / duration < 1.15);
    for (const burst of bursts.current) {
      const t = Math.max(0, now - burst.start) / duration;
      for (const layer of burst.layers) {
        context.fillStyle = layer.color;
        for (const g of layer.grains) {
          const local = Math.min(1, Math.max(0, (t - g.delay) / g.life));
          if (local >= 1) continue;
          const k = easeOut(local);
          // Full strength through the burst, then a long, gentle fade.
          context.globalAlpha = g.alpha * (1 - smoothstep(0.2, 1, local));
          const s = g.size;
          context.fillRect(g.x + (g.tx - g.x) * k - s / 2, g.y + (g.ty - g.y) * k - s / 2, s, s);
        }
      }
    }
    context.globalAlpha = 1;
    if (bursts.current.length) frame.current = requestAnimationFrame(paint);
  };

  const burst = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (goneRef.current || !canvas || !context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = Math.max(300, speed);
    goneRef.current = true;
    setGone(true);
    regrow.current = window.setTimeout(
      () => {
        goneRef.current = false;
        setGone(false);
      },
      reduced ? 320 : duration * 0.55,
    );
    if (reduced || !points.current.length) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const side = Math.ceil(room * dpr);
    if (canvas.width !== side || canvas.height !== side) {
      canvas.width = side;
      canvas.height = side;
    }
    context.setTransform(dpr, 0, 0, dpr, side / 2, side / 2);

    // One grain per point, and now and then a second a hair off it, so the cloud is full
    // without being heavy. Each flies to a random
    // spot in a soft disc round the icon, leaning outward from where it started.
    const reach = size / 2 + spread;
    const ink = getComputedStyle(canvas).color;
    const layers = colorful ? DUST.map((color) => ({ color, grains: [] as Grain[] })) : [{ color: ink, grains: [] as Grain[] }];
    for (const p of points.current) {
      const copies = Math.random() < EXTRA ? 2 : 1;
      for (let copy = 0; copy < copies; copy++) {
        const x = p.x + (copy ? (Math.random() - 0.5) * 1.2 : 0);
        const y = p.y + (copy ? (Math.random() - 0.5) * 1.2 : 0);
        const angle = Math.random() * Math.PI * 2;
        const r = reach * Math.sqrt(Math.random());
        const away = Math.hypot(x, y) > 0.5 ? Math.atan2(y, x) : angle;
        const push = spread * 0.4 * Math.random();
        const tx = Math.cos(angle) * r * 0.75 + x * 0.25 + Math.cos(away) * push;
        const ty = Math.sin(angle) * r * 0.75 + y * 0.25 + Math.sin(away) * push;
        // Colours go round the icon like a wheel, a little loosely, so neighbours match.
        const turn = (Math.atan2(ty, tx) / (Math.PI * 2) + 1 + (Math.random() - 0.5) * 0.18) % 1;
        const layer = layers[colorful ? Math.floor(turn * layers.length) % layers.length : 0];
        layer.grains.push({
          x,
          y,
          tx,
          ty,
          // Mostly light, a few strong, so the cloud has depth instead of reading as a solid mass.
          alpha: p.alpha * (0.15 + 0.85 * Math.random() ** 1.8),
          size: 0.8 + Math.random() * 0.9,
          delay: Math.random() * 0.06,
          life: 0.7 + Math.random() * 0.3,
        });
      }
    }
    bursts.current.push({ start: performance.now(), layers });
    if (!frame.current) frame.current = requestAnimationFrame(paint);
  };

  return (
    <button
      type="button"
      className="rk-burst"
      aria-label={label}
      onClick={() => {
        burst();
        onClick?.();
      }}
    >
      <span className="rk-burst__mark" style={{ width: size + 32, height: size + 32 }}>
        <Icon ref={iconRef} className="rk-burst__icon" data-gone={gone} size={size} strokeWidth={2} aria-hidden="true" />
        <canvas ref={canvasRef} className="rk-burst__dust" style={{ width: room, height: room }} aria-hidden="true" />
      </span>
      {hint ? (
        <span className="rk-burst__hint" aria-hidden="true">
          {hint}
        </span>
      ) : null}
    </button>
  );
}
