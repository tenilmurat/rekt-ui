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
/** How quickly ticks catch up with the pointer, and the peak with the chosen section, in ms. Higher is gentler. */
const EASE_MS = 150;
const GLIDE_MS = 220;

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const bell = (distance: number, reach: number) => Math.exp(-((distance / Math.max(1, reach)) ** 2));

/**
 * A vertical ruler of ticks that grow toward the pointer, like a magnifier
 * passing over them. Every few ticks is a section; its name fades in as you
 * get close. The chosen section turns orange and keeps a peak of its own, and
 * clicking anywhere jumps to the nearest section.
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
  /** Where the chosen section's peak is now, and where it's heading. */
  const peakY = useRef<number | null>(null);
  const peakTarget = useRef<number | null>(null);
  /** Each tick's current growth, eased toward its target every frame. */
  const growth = useRef<number[]>([]);
  const frame = useRef(0);
  const last = useRef(0);

  const step = Math.max(0, between) + 1;
  const ticks = Array.from({ length: (sections.length - 1) * step + 1 }, (_, i) => ({
    section: i % step === 0 ? i / step : null,
  }));

  /*
    Each tick's target is a bell curve of its distance from the pointer, or
    from the chosen section's peak, whichever is higher. Every frame the
    current value closes part of the gap (more the longer the frame), so the
    ruler swells and settles smoothly, and the frames stop once it's still.
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
    const target = peakTarget.current;
    if (target !== null) {
      const y = peakY.current ?? target;
      peakY.current = y + (target - y) * ease(GLIDE_MS);
      if (Math.abs(target - peakY.current) > 0.05) moving = true;
      else peakY.current = target;
    }

    const items = Array.from(list.children) as HTMLElement[];
    const first = items[0]?.offsetTop ?? 0;
    const centres = items.map((tick) => tick.offsetTop - first + tick.offsetHeight / 2);
    centres.forEach((centre, i) => {
      const pointer = pointerY.current === null ? 0 : bell(pointerY.current - centre, reach);
      const peak = peakY.current === null ? 0 : bell(peakY.current - centre, reach);
      const goal = Math.max(pointer, peak);
      const g = growth.current[i] ?? 0;
      let next = g + (goal - g) * ease(EASE_MS);
      if (Math.abs(goal - next) > 0.002) moving = true;
      else next = goal;
      growth.current[i] = next;
      items[i].style.setProperty("--rk-ruler-g", next.toFixed(3));
    });

    if (moving) frame.current = requestAnimationFrame(paint);
    else last.current = 0;
  };

  const schedule = () => {
    if (!frame.current) frame.current = requestAnimationFrame(paint);
  };

  // Aim the peak at the chosen section's tick.
  useEffect(() => {
    const tick = listRef.current?.children[active * step] as HTMLElement | undefined;
    const first = listRef.current?.children[0] as HTMLElement | undefined;
    if (!tick || !first) return;
    peakTarget.current = tick.offsetTop - first.offsetTop + tick.offsetHeight / 2;
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
