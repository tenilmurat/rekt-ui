"use client";

import { useEffect, useRef, useState } from "react";

export type MagnifyRulerProps = {
  /** How far from the pointer ticks still grow, in px. */
  reach?: number;
  /** How much a tick under the pointer grows, in px. */
  strength?: number;
  /** Show section names beside the long ticks as the pointer nears them. */
  labels?: boolean;
  /** The sections; each gets a long tick. */
  sections?: string[];
  /** Short ticks between two sections. */
  between?: number;
  /** Called when a section is chosen. */
  onSelect?: (section: string, index: number) => void;
};

const SECTIONS = ["Overview", "Install", "Usage", "Theming", "Changelog"];
/** How quickly ticks catch up with the pointer, in ms. Higher is gentler. */
const EASE_MS = 150;
/** The orange's trip to a new section: time per tick it passes, its limits, and how long each tick takes to fade behind it. */
const TRAVEL_PER_TICK_MS = 26;
const TRAVEL_MIN_MS = 360;
const TRAVEL_MAX_MS = 1000;
const TRAIL_MS = 240;

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const bell = (distance: number, reach: number) => Math.exp(-((distance / Math.max(1, reach)) ** 2));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

type Travel = { from: number; to: number; start: number; duration: number };

/**
 * A vertical ruler of ticks that grow toward the pointer, like a magnifier
 * passing over them. Every few ticks is a section; its name fades in as you
 * get close. The chosen section is orange; choose another and the orange
 * steps there tick by tick, fading behind it. Clicking anywhere jumps to the
 * nearest section.
 */
export function MagnifyRuler({
  reach = 56,
  strength = 28,
  labels = true,
  sections = SECTIONS,
  between = 9,
  onSelect,
}: MagnifyRulerProps) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement | null>(null);
  const pointerY = useRef<number | null>(null);
  /** Each tick's current growth and orange, eased toward their targets every frame. */
  const growth = useRef<number[]>([]);
  const accent = useRef<number[]>([]);
  /** The tick the orange is heading for, and its trip there (in ticks) while it's moving. */
  const accentTick = useRef<number | null>(null);
  const travel = useRef<Travel | null>(null);
  /** Where the orange's head was last frame, so every tick it passes lights up, even on a long frame. */
  const head = useRef<number | null>(null);
  const frame = useRef(0);
  const last = useRef(0);

  const step = Math.max(0, between) + 1;
  const ticks = Array.from({ length: (sections.length - 1) * step + 1 }, (_, i) => ({
    section: i % step === 0 ? i / step : null,
  }));

  /*
    Each tick's growth aims for a bell curve of its distance from the pointer.
    Every frame the current value closes part of the gap (more the longer the
    frame), so the ruler swells and settles smoothly.

    The orange works the same way: while it travels, its head moves tick by
    tick from the old section to the new one, every tick it reaches lights up
    fully, and then fades back unless it's the new section's. The frames stop
    once everything is still.
  */
  const paint = (now: number) => {
    frame.current = 0;
    const list = listRef.current;
    if (!list) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dt = last.current ? Math.min(64, now - last.current) : 16;
    last.current = now;
    const ease = (ms: number) => (reduced ? 1 : 1 - Math.exp(-dt / ms));

    let moving = false;
    const items = Array.from(list.children) as HTMLElement[];

    // Move the orange's head along its trip and light every tick it passed this frame.
    const trip = travel.current;
    if (trip) {
      // A frame's timestamp can be a little earlier than the click that started the trip.
      const progress = reduced ? 1 : Math.min(1, Math.max(0, (now - trip.start) / trip.duration));
      const at = trip.from + (trip.to - trip.from) * easeInOut(progress);
      const previous = head.current ?? trip.from;
      const lo = Math.max(0, Math.round(Math.min(previous, at)));
      const hi = Math.min(items.length - 1, Math.round(Math.max(previous, at)));
      for (let i = lo; i <= hi; i++) accent.current[i] = 1;
      head.current = at;
      if (progress < 1) moving = true;
      else travel.current = null;
    }

    const first = items[0]?.offsetTop ?? 0;
    const centres = items.map((tick) => tick.offsetTop - first + tick.offsetHeight / 2);
    centres.forEach((centre, i) => {
      const goal = pointerY.current === null ? 0 : bell(pointerY.current - centre, reach);
      const g = growth.current[i] ?? 0;
      let next = g + (goal - g) * ease(EASE_MS);
      if (Math.abs(goal - next) > 0.002) moving = true;
      else next = goal;
      growth.current[i] = next;

      // The new section stays orange once the head has reached it; everything else fades.
      const lit = i === accentTick.current && !travel.current ? 1 : 0;
      const a = accent.current[i] ?? 0;
      let tint = a + (lit - a) * ease(TRAIL_MS);
      if (Math.abs(lit - tint) > 0.002) moving = true;
      else tint = lit;
      accent.current[i] = tint;

      items[i].style.setProperty("--rk-ruler-g", next.toFixed(3));
      items[i].style.setProperty("--rk-ruler-a", tint.toFixed(3));
    });

    if (moving) frame.current = requestAnimationFrame(paint);
    else last.current = 0;
  };

  const schedule = () => {
    if (!frame.current) frame.current = requestAnimationFrame(paint);
  };

  // Send the orange to the chosen section: straight there the first time, tick by tick after that.
  useEffect(() => {
    const to = active * step;
    const from = travel.current ? head.current : accentTick.current;
    accentTick.current = to;
    if (from === null || from === to) {
      travel.current = null;
      accent.current[to] = 1;
    } else {
      const distance = Math.abs(to - from);
      travel.current = {
        from,
        to,
        start: performance.now(),
        duration: Math.min(TRAVEL_MAX_MS, Math.max(TRAVEL_MIN_MS, distance * TRAVEL_PER_TICK_MS)),
      };
      head.current = from;
    }
    schedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step]);

  useEffect(() => {
    schedule();
    return () => {
      // Clear the id too: a cancelled frame left in the ref would block every later paint.
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      last.current = 0;
    };
    // Repaint when the shape of the ruler changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reach, sections.length, between]);

  const choose = (index: number) => {
    setActive(index);
    onSelect?.(sections[index], index);
    document.getElementById(slug(sections[index]))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Clicking between long ticks picks the nearest section.
  const chooseNearest = (clientY: number) => {
    const list = listRef.current;
    if (!list) return;
    const ratio = (clientY - list.getBoundingClientRect().top) / list.offsetHeight;
    choose(Math.min(sections.length - 1, Math.max(0, Math.round(ratio * (sections.length - 1)))));
  };

  // Keyboard focus magnifies around the focused section, as the pointer would.
  const focusAt = (element: HTMLElement) => {
    const list = listRef.current;
    const li = element.closest("li");
    const first = list?.children[0] as HTMLElement | undefined;
    if (li && first) pointerY.current = li.offsetTop - first.offsetTop + li.offsetHeight / 2;
    schedule();
  };

  return (
    <nav
      className="rk-ruler"
      aria-label="Sections"
      style={{ "--rk-ruler-strength": `${Math.max(0, strength)}px` } as React.CSSProperties}
    >
      <ol
        ref={listRef}
        className="rk-ruler__ticks"
        onPointerMove={(event) => {
          pointerY.current = event.clientY - event.currentTarget.getBoundingClientRect().top;
          schedule();
        }}
        onPointerLeave={() => {
          pointerY.current = null;
          schedule();
        }}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          chooseNearest(event.clientY);
        }}
      >
        {ticks.map((tick, i) =>
          tick.section === null ? (
            <li key={i} className="rk-ruler__tick" aria-hidden="true">
              <span className="rk-ruler__line" />
            </li>
          ) : (
            <li key={i} className="rk-ruler__tick rk-ruler__tick--major" data-active={tick.section === active}>
              <button
                type="button"
                className="rk-ruler__button"
                aria-current={tick.section === active ? "location" : undefined}
                onClick={() => choose(tick.section!)}
                onFocus={(event) => focusAt(event.currentTarget)}
                onBlur={() => {
                  pointerY.current = null;
                  schedule();
                }}
              >
                <span className="rk-ruler__line" />
                <span className="rk-ruler__label" data-visible={labels}>
                  {sections[tick.section]}
                </span>
              </button>
            </li>
          ),
        )}
      </ol>
    </nav>
  );
}
