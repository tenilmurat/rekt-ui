"use client";

import { useLayoutEffect, useRef, useState } from "react";

export type ContentsMarkerProps = {
  /** Where the dot sits: "after" the chosen label's text, or "before" the list in a gutter. */
  position?: "before" | "after";
  /** How far the dot's path bows out on its way to the next section, 0–100. */
  arc?: number;
  /** How long the dot takes to fly to the next section, in milliseconds. */
  speed?: number;
  /** The heading above the list. */
  title?: string;
  /** The sections, in order. */
  items?: string[];
  /** Called when a section is chosen. */
  onSelect?: (item: string, index: number) => void;
};

type Point = { x: number; y: number };

const ITEMS = ["Overview", "Install", "Usage", "Theming", "Changelog"];
/** The dot's radius, the space after a label, and the gutter's centre for "before". */
const RADIUS = 3.5;
const GAP = 10;
const GUTTER_X = -14;

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const translate = (p: Point) => `translate(${(p.x - RADIUS).toFixed(2)}px, ${(p.y - RADIUS).toFixed(2)}px)`;

/**
 * A table of contents with a single dot that marks the chosen section. When
 * you choose another, the dot flies there along a curve that bows outward,
 * and settles beside the new label. Hovering only darkens the text. Choosing
 * a section scrolls to the element with its id, when the page has one.
 */
export function ContentsMarker({
  position = "after",
  arc = 50,
  speed = 560,
  title = "Contents",
  items = ITEMS,
  onSelect,
}: ContentsMarkerProps) {
  const [active, setActive] = useState(0);
  const dotRef = useRef<HTMLSpanElement | null>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const placed = useRef<{ point: Point; position: string } | null>(null);
  const flight = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const dot = dotRef.current;
    const label = labelRefs.current[active];
    if (!dot || !label) return;

    const to: Point = {
      x: position === "after" ? label.offsetLeft + label.offsetWidth + GAP : GUTTER_X,
      y: label.offsetTop + label.offsetHeight / 2,
    };

    // Start from where the dot is on screen right now, even if it's mid-flight.
    let from = placed.current?.position === position ? placed.current.point : null;
    if (from && flight.current?.playState === "running") {
      const m = new DOMMatrixReadOnly(getComputedStyle(dot).transform);
      from = { x: m.e + RADIUS, y: m.f + RADIUS };
    }
    flight.current?.cancel();

    // The dot rests at the target; the flight below plays over the top of that.
    dot.style.transform = translate(to);
    dot.dataset.ready = "true";
    placed.current = { point: to, position };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!from || reduced || (from.x === to.x && from.y === to.y)) return;

    // A quadratic curve whose control point sits out to the side the dot lives on,
    // further out the longer the trip, so it reads as one smooth swing.
    const side = position === "after" ? 1 : -1;
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const bow = side * (10 + distance * 0.45) * (Math.min(100, Math.max(0, arc)) / 100);
    const control: Point = {
      x: (side > 0 ? Math.max(from.x, to.x) : Math.min(from.x, to.x)) + bow,
      y: (from.y + to.y) / 2,
    };
    const STEPS = 28;
    const frames = Array.from({ length: STEPS + 1 }, (_, k) => {
      const t = k / STEPS;
      const u = 1 - t;
      return {
        transform: translate({
          x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
          y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
        }),
      };
    });
    flight.current = dot.animate(frames, {
      duration: Math.max(0, speed),
      easing: "cubic-bezier(0.32, 0.72, 0, 1)",
    });
  }, [active, position, items, arc, speed]);

  const choose = (index: number) => {
    setActive(index);
    onSelect?.(items[index], index);
    document.getElementById(slug(items[index]))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="rk-cmark" data-position={position} aria-label={title}>
      <p className="rk-cmark__title">{title}</p>
      <div className="rk-cmark__body">
        {/* Hidden until it has been placed, so it never flies in from the corner. */}
        <span ref={dotRef} className="rk-cmark__dot" aria-hidden="true" />
        <ol className="rk-cmark__list">
          {items.map((item, index) => (
            <li key={item}>
              <a
                href={`#${slug(item)}`}
                className="rk-cmark__link"
                aria-current={index === active ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  choose(index);
                }}
              >
                <span
                  ref={(el) => {
                    labelRefs.current[index] = el;
                  }}
                  className="rk-cmark__label"
                >
                  {item}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
