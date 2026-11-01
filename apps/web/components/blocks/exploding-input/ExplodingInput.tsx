"use client";

import { useEffect, useRef } from "react";

export type ExplodingInputDirection = "up-left" | "up" | "up-right" | "down" | "all";

export type ExplodingInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Which way the bits fly out of the caret. "all" scatters them all round. */
  direction?: ExplodingInputDirection;
  /** What flies out: emoji from the list, or copies of the letter just typed. */
  particles?: "emoji" | "letters";
  /** The emoji to pick from, at random, when particles is "emoji". */
  emojis?: string[];
  /** How many bits each typed character sends out. */
  count?: number;
  /** How hard the bits fall back; 0 lets them float straight out. */
  gravity?: number;
  /** The bits' size, in px. */
  size?: number;
  /** The input's width, in px. */
  width?: number;
};

const DEFAULT_EMOJIS = ["🔥", "✨", "💥", "🤩", "👾", "👻", "😺", "🖤"];

/** The letters' colours: a warm-to-cool ramp, one picked at random per letter. */
const INKS = ["#ff5e5b", "#ff9b3d", "#ffc53d", "#1fc98f", "#19b5c8", "#5b8cff", "#a46bff"];

/** Each direction's centre angle (0 is right, -90 is up) and how far either side of it a bit may stray, in degrees. */
const AIM: Record<Exclude<ExplodingInputDirection, "all">, [number, number]> = {
  "up-left": [-125, 20],
  up: [-90, 25],
  "up-right": [-55, 20],
  down: [90, 35],
};

/** How long a bit lives, and how much of the end it spends fading, in seconds. */
const LIFE = 1.6;
const FADE = 0.45;
/** More than this many at once and the oldest go first. */
const MAX_BITS = 160;

/** A bit in flight: its span, place, speed, spin, size, age and the gravity it was thrown with, in px and seconds. */
type Bit = { el: HTMLSpanElement; x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; age: number; g: number };

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

/**
 * A text input that bursts as you type: every character sends a few emoji,
 * or copies of the letter itself, out of the caret. They fly the chosen way,
 * spinning, arc down under gravity and fade, and they're free to leave the
 * input and its card: they're drawn in a layer over the whole page.
 */
export function ExplodingInput({
  direction = "up",
  particles = "emoji",
  emojis = DEFAULT_EMOJIS,
  count = 3,
  gravity = 0.6,
  size = 32,
  width = 288,
  placeholder = "try@rekt.ui",
  className,
  style,
  onInput,
  ...rest
}: ExplodingInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const bitsRef = useRef<Bit[]>([]);
  const frameRef = useRef(0);
  const measureRef = useRef<CanvasRenderingContext2D | null>(null);

  // The layer the bits fly in: fixed over the whole page, on the body, so no card or dialog clips them.
  useEffect(() => {
    const layer = document.createElement("div");
    layer.className = "rk-explode__layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    layerRef.current = layer;
    return () => {
      cancelAnimationFrame(frameRef.current);
      bitsRef.current = [];
      layer.remove();
      layerRef.current = null;
    };
  }, []);

  /** Where the caret is on screen: the input's text start, plus the width of the text before the caret, less any scroll. */
  const caret = (input: HTMLInputElement) => {
    const box = input.getBoundingClientRect();
    const css = getComputedStyle(input);
    measureRef.current ??= document.createElement("canvas").getContext("2d");
    const ctx = measureRef.current;
    let text = 0;
    if (ctx) {
      ctx.font = css.font;
      text = ctx.measureText(input.value.slice(0, input.selectionStart ?? input.value.length)).width;
    }
    const x = box.left + parseFloat(css.paddingLeft) + parseFloat(css.borderLeftWidth) + text - input.scrollLeft;
    return { x: Math.min(Math.max(x, box.left), box.right), y: box.top + box.height / 2, font: css.fontFamily };
  };

  const step = (last: number) => (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    bitsRef.current = bitsRef.current.filter((b) => {
      b.age += dt;
      if (b.age >= LIFE) {
        b.el.remove();
        return false;
      }
      b.vy += b.g * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.r += b.vr * dt;
      // Each bit pops in from small over its first tenth of a second, then fades out at the end.
      const grow = Math.min(b.age / 0.1, 1);
      b.el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${b.r.toFixed(1)}deg) scale(${(b.s * (0.4 + 0.6 * grow)).toFixed(3)})`;
      b.el.style.opacity = String(Math.min(1, (LIFE - b.age) / FADE));
      return true;
    });
    frameRef.current = bitsRef.current.length ? requestAnimationFrame(step(now)) : 0;
  };

  const burst = (chars: string[]) => {
    const input = inputRef.current;
    const layer = layerRef.current;
    if (!input || !layer || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const from = caret(input);
    for (const char of chars) {
      if (particles === "letters" && !char.trim()) continue;
      for (let i = 0; i < count; i++) {
        const el = document.createElement("span");
        el.className = "rk-explode__bit";
        if (particles === "letters") {
          el.textContent = char;
          el.style.color = pick(INKS);
          el.style.fontFamily = from.font;
        } else {
          el.textContent = pick(emojis.length ? emojis : DEFAULT_EMOJIS);
        }
        el.style.fontSize = `${size}px`;
        layer.appendChild(el);
        const [aim, spread] = direction === "all" ? [Math.random() * 360, 0] : AIM[direction] ?? AIM.up;
        const angle = ((aim + (Math.random() * 2 - 1) * spread) * Math.PI) / 180;
        const speed = (direction === "down" ? 260 : 420) + Math.random() * 260;
        bitsRef.current.push({
          el,
          x: from.x,
          y: from.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: (Math.random() * 2 - 1) * 30,
          vr: (Math.random() * 2 - 1) * 360,
          s: 0.75 + Math.random() * 0.5,
          age: 0,
          g: gravity * 1800,
        });
      }
    }
    while (bitsRef.current.length > MAX_BITS) bitsRef.current.shift()?.el.remove();
    if (!frameRef.current && bitsRef.current.length) frameRef.current = requestAnimationFrame(step(performance.now()));
  };

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      spellCheck={false}
      autoComplete="off"
      {...rest}
      className={["rk-explode", className].filter(Boolean).join(" ")}
      style={{ "--rk-explode-width": `${width}px`, ...style } as React.CSSProperties}
      onInput={(event) => {
        onInput?.(event);
        const native = event.nativeEvent as InputEvent;
        if (!native.inputType?.startsWith("insert")) return;
        // A paste or a dictated word bursts once for each of its first few characters, not hundreds of times.
        burst(Array.from(native.data ?? "").slice(0, 6));
      }}
    />
  );
}
