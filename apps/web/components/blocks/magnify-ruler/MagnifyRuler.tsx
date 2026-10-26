"use client";

import { useEffect, useRef, useState } from "react";

export type MagnifyRulerProps = {
  /** Surface of the panel. */
  fill?: "light" | "dark";
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

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * A vertical ruler of ticks that grow toward the pointer, like a magnifier
 * passing over them. Every few ticks is a section; its name fades in as you
 * get close, and clicking anywhere jumps to the nearest section.
 */
export function MagnifyRuler({
  fill = "light",
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
  const frame = useRef(0);

  const step = Math.max(0, between) + 1;
  const ticks = Array.from({ length: (sections.length - 1) * step + 1 }, (_, i) => ({
    section: i % step === 0 ? i / step : null,
  }));

  // Grow each tick by a bell curve of its distance from the pointer.
  const paint = () => {
    frame.current = 0;
    const list = listRef.current;
    if (!list) return;
    const top = list.getBoundingClientRect().top;
    for (const tick of Array.from(list.children) as HTMLElement[]) {
      const y = pointerY.current;
      const centre = tick.getBoundingClientRect().top - top + tick.offsetHeight / 2;
      const g = y === null ? 0 : Math.exp(-(((y - centre) / Math.max(1, reach)) ** 2));
      tick.style.setProperty("--rk-ruler-g", g.toFixed(3));
    }
  };

  const schedule = () => {
    if (!frame.current) frame.current = requestAnimationFrame(paint);
  };

  useEffect(() => {
    schedule();
    return () => {
      // Clear the id too: a cancelled frame left in the ref would block every later paint.
      cancelAnimationFrame(frame.current);
      frame.current = 0;
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
    if (!list) return;
    const li = element.closest("li");
    if (li) pointerY.current = li.offsetTop + li.offsetHeight / 2;
    schedule();
  };

  return (
    <nav
      className="rk-ruler"
      data-fill={fill}
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
