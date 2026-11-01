"use client";

import { useEffect, useMemo, useRef, type PointerEvent as ReactPointerEvent } from "react";

export type KeyboardProps = {
  /** White keys on a white case, or dark keys on a dark case. */
  look?: "white" | "dark";
  /** 0–1: how wide the patch of keys that sinks around the pointer is. */
  intensity?: number;
  /** Also press the keys you type on your own keyboard, while it's on screen. */
  typing?: boolean;
  /** The widest it gets, in px; it shrinks to fit narrower spaces. */
  width?: number;
};

/** A 60% layout, back row first: each key is [KeyboardEvent.code, width in key units]. Every row is 15 units. */
const ROWS: [string, number][][] = [
  [["Backquote", 1], ...digits(), ["Minus", 1], ["Equal", 1], ["Backspace", 2]],
  [["Tab", 1.5], ...letters("QWERTYUIOP"), ["BracketLeft", 1], ["BracketRight", 1], ["Backslash", 1.5]],
  [["CapsLock", 1.75], ...letters("ASDFGHJKL"), ["Semicolon", 1], ["Quote", 1], ["Enter", 2.25]],
  [["ShiftLeft", 2.25], ...letters("ZXCVBNM"), ["Comma", 1], ["Period", 1], ["Slash", 1], ["ShiftRight", 2.75]],
  [
    ["ControlLeft", 1.25], ["MetaLeft", 1.25], ["AltLeft", 1.25], ["Space", 6.25],
    ["AltRight", 1.25], ["MetaRight", 1.25], ["ContextMenu", 1.25], ["ControlRight", 1.25],
  ],
];

function digits(): [string, number][] {
  return "1234567890".split("").map((d) => [`Digit${d}`, 1]);
}
function letters(row: string): [string, number][] {
  return row.split("").map((l) => [`Key${l}`, 1]);
}

/** Pixels per key unit, and the isometric axes: x runs down to the right, y down to the left, z straight up. */
const S = 26;
const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;
const RISE = 0.82;

/** Heights in key units: the case, a keycap, and how far a key can travel. */
const CASE_H = 0.55;
const KEY_H = 0.5;
const TRAVEL = 0.36;
const TOP = CASE_H + KEY_H;

type Pt = [number, number];
type Outline = { pts: Pt[]; right: number; front: number; left: number };

const project = ([x, y]: Pt, z: number): Pt => [(x - y) * COS * S, (x + y) * SIN * S - z * RISE * S];

/**
 * A rounded rectangle on the ground plane, as a loop of points from the back
 * left corner round clockwise, with the three points a side view needs: the
 * rightmost and leftmost on screen, and the front corner between them.
 */
function outline(x0: number, y0: number, x1: number, y1: number, r: number, steps = 4): Outline {
  const corners: [number, number, number][] = [
    [x0 + r, y0 + r, 180],
    [x1 - r, y0 + r, 270],
    [x1 - r, y1 - r, 0],
    [x0 + r, y1 - r, 90],
  ];
  const pts: Pt[] = [];
  for (const [cx, cy, from] of corners) {
    for (let i = 0; i <= steps; i++) {
      const a = ((from + (90 * i) / steps) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  }
  const arc = steps + 1;
  return { pts, right: arc + steps / 2, front: 2 * arc + steps / 2, left: 3 * arc + steps / 2 };
}

const path = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`;

/** The two faces you can see of a box with this outline: from the rightmost point to the front corner, and on to the leftmost. */
function sides(bottom: Outline, top: Outline, z0: number, z1: number) {
  const face = (from: number, to: number) => {
    const lower = bottom.pts.slice(from, to + 1).map((p) => project(p, z0));
    const upper = top.pts.slice(from, to + 1).map((p) => project(p, z1)).reverse();
    return path([...lower, ...upper]);
  };
  return { right: face(bottom.right, bottom.front), left: face(bottom.front, bottom.left) };
}

type Key = {
  code: string;
  /** Its cell, a full key unit deep: the pointer's distance is measured to this. */
  x: number;
  y: number;
  w: number;
  base: Outline;
  cap: Outline;
};

const GAP = 0.05;
const INSET = 0.1;

function layout(): Key[] {
  return ROWS.flatMap((row, y) => {
    let x = 0;
    return row.map(([code, w]) => {
      const key = {
        code,
        x,
        y,
        w,
        base: outline(x + GAP, y + GAP, x + w - GAP, y + 1 - GAP, 0.12),
        cap: outline(x + GAP + INSET, y + GAP + INSET, x + w - GAP - INSET, y + 1 - GAP - INSET, 0.1),
      };
      x += w;
      return key;
    });
  });
}

/** One keycap's three faces, with its top sunk this far. */
function keyPaths(key: Key, sink: number) {
  const z = TOP - sink;
  return { ...sides(key.base, key.cap, CASE_H, z), top: path(key.cap.pts.map((p) => project(p, z))) };
}

const PAD = 0.35;
const WIDE = 15;
const DEEP = 5;

function frame() {
  const shell = outline(-PAD, -PAD, WIDE + PAD, DEEP + PAD, 0.45, 6);
  const plate = outline(-0.1, -0.1, WIDE + 0.1, DEEP + 0.1, 0.25);
  const corners = [project([-PAD, DEEP + PAD], 0), project([WIDE + PAD, -PAD], 0), project([WIDE + PAD, DEEP + PAD], 0), project([-PAD, -PAD], TOP)];
  const x = corners[0][0] - 2;
  const y = corners[3][1] - 2;
  return {
    sides: sides(shell, shell, 0, CASE_H),
    top: path(shell.pts.map((p) => project(p, CASE_H))),
    plate: path(plate.pts.map((p) => project(p, CASE_H))),
    viewBox: `${x.toFixed(1)} ${y.toFixed(1)} ${(corners[1][0] + 2 - x).toFixed(1)} ${(corners[2][1] + 2 - y).toFixed(1)}`,
  };
}

/** How far a point on the ground is from a key's cell; 0 inside it. */
const distance = (k: Key, px: number, py: number) =>
  Math.hypot(Math.max(k.x - px, 0, px - (k.x + k.w)), Math.max(k.y - py, 0, py - (k.y + 1)));

const EDITABLE = "input, textarea, select, [contenteditable=''], [contenteditable='true']";

/**
 * An isometric keyboard in thin lines. The key under the pointer sinks all the
 * way and its neighbours follow it down, less the further away they are;
 * typing on your own keyboard presses the same keys.
 */
export function Keyboard({ look = "white", intensity = 0.5, typing = true, width = 560 }: KeyboardProps) {
  const keys = useMemo(layout, []);
  const shell = useMemo(frame, []);
  const svg = useRef<SVGSVGElement>(null);
  const groups = useRef<(SVGGElement | null)[]>([]);
  const live = useRef({ pointer: null as Pt | null, pressed: new Set<string>(), radius: 0, start: () => {} });
  live.current.radius = 0.35 + Math.min(Math.max(intensity, 0), 1) * 2.6;

  useEffect(() => {
    const state = live.current;
    const depth = new Float32Array(keys.length);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = 0;

    const step = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const ease = still.matches ? 1 : 1 - Math.exp(-dt * 22);
      const { pointer, pressed, radius } = state;
      let moving = false;
      keys.forEach((key, i) => {
        const d = pointer ? distance(key, pointer[0], pointer[1]) : Infinity;
        const near = Math.max(0, 1 - d / radius) ** 1.6;
        const target = TRAVEL * (pressed.has(key.code) ? 1 : near);
        const next = depth[i] + (target - depth[i]) * ease;
        const g = groups.current[i];
        if (g) g.toggleAttribute("data-hot", d === 0 || pressed.has(key.code));
        if (Math.abs(next - depth[i]) < 0.0005) return;
        depth[i] = Math.abs(target - next) < 0.0005 ? target : next;
        moving = true;
        if (!g) return;
        const p = keyPaths(key, depth[i]);
        const [right, left, top] = g.children;
        right.setAttribute("d", p.right);
        left.setAttribute("d", p.left);
        top.setAttribute("d", p.top);
      });
      raf = moving ? requestAnimationFrame(step) : 0;
      if (!raf) last = 0;
    };
    state.start = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    return () => {
      cancelAnimationFrame(raf);
      state.start = () => {};
    };
  }, [keys]);

  useEffect(() => {
    if (!typing) return;
    const el = svg.current;
    const state = live.current;
    let visible = false;
    const seen = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    if (el) seen.observe(el);
    const press = (e: KeyboardEvent) => {
      if (!visible || e.repeat || (e.target as Element | null)?.closest?.(EDITABLE)) return;
      if (!keys.some((k) => k.code === e.code)) return;
      state.pressed.add(e.code);
      state.start();
    };
    const release = (e: KeyboardEvent) => {
      if (state.pressed.delete(e.code)) state.start();
    };
    const clear = () => {
      state.pressed.clear();
      state.start();
    };
    window.addEventListener("keydown", press);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", clear);
    return () => {
      seen.disconnect();
      window.removeEventListener("keydown", press);
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", clear);
      state.pressed.clear();
    };
  }, [typing, keys]);

  const move = (e: ReactPointerEvent<SVGSVGElement>) => {
    const matrix = svg.current?.getScreenCTM()?.inverse();
    if (!matrix) return;
    const at = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix);
    // Back from the screen to the key tops: x − y from across, x + y from down, at the height of a resting key.
    const across = at.x / (COS * S);
    const down = (at.y + TOP * RISE * S) / (SIN * S);
    live.current.pointer = [(down + across) / 2, (down - across) / 2];
    live.current.start();
  };
  const leave = () => {
    live.current.pointer = null;
    live.current.start();
  };

  return (
    <svg
      ref={svg}
      className="rk-kb"
      data-look={look}
      viewBox={shell.viewBox}
      style={{ maxWidth: width }}
      role="img"
      aria-label="A keyboard whose keys sink under the pointer"
      onPointerMove={move}
      onPointerLeave={leave}
      onPointerCancel={leave}
    >
      <g className="rk-kb__case">
        <path className="rk-kb__right" d={shell.sides.right} />
        <path className="rk-kb__left" d={shell.sides.left} />
        <path className="rk-kb__top" d={shell.top} />
        <path className="rk-kb__plate" d={shell.plate} />
      </g>
      {keys.map((key, i) => {
        const p = keyPaths(key, 0);
        return (
          <g key={key.code} className="rk-kb__key" ref={(g) => void (groups.current[i] = g)}>
            <path className="rk-kb__right" d={p.right} />
            <path className="rk-kb__left" d={p.left} />
            <path className="rk-kb__top" d={p.top} />
          </g>
        );
      })}
    </svg>
  );
}
