"use client";

import { useLayoutEffect, useRef, useState } from "react";

export type ContentsMarkerProps = {
  /** Surface of the panel. */
  fill?: "light" | "dark";
  /** "hover" moves the marker to whatever is pointed at; "click" only when an item is chosen. */
  follow?: "hover" | "click";
  /** How far the marker overshoots before it settles, 0–100. */
  bounce?: number;
  /** The heading above the list. */
  title?: string;
  /** The sections, in order. */
  items?: string[];
  /** Called when a section is chosen. */
  onSelect?: (item: string, index: number) => void;
};

const ITEMS = ["Overview", "Install", "Usage", "Theming", "Changelog"];

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * A table of contents with a single dot that springs to the section you point
 * at, overshooting a little before it settles. Choosing a section scrolls to
 * the element with its id, when the page has one.
 */
export function ContentsMarker({
  fill = "dark",
  follow = "hover",
  bounce = 60,
  title = "Contents",
  items = ITEMS,
  onSelect,
}: ContentsMarkerProps) {
  const [active, setActive] = useState(0);
  const [pointed, setPointed] = useState<number | null>(null);
  const [markerY, setMarkerY] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);

  const shown = follow === "hover" && pointed !== null ? pointed : active;

  // Measure where the shown item sits; the marker moves there with CSS.
  useLayoutEffect(() => {
    const item = listRef.current?.children[shown] as HTMLElement | undefined;
    if (item) setMarkerY(item.offsetTop + item.offsetHeight / 2);
  }, [shown, items]);

  const choose = (index: number) => {
    setActive(index);
    onSelect?.(items[index], index);
    document.getElementById(slug(items[index]))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // An overshooting curve: the bigger the second control point, the bigger the bounce.
  const overshoot = 1 + (Math.min(100, Math.max(0, bounce)) / 100) * 0.9;

  return (
    <nav
      className="rk-cmark"
      data-fill={fill}
      aria-label={title}
      style={
        {
          "--rk-cmark-y": `${markerY ?? 0}px`,
          "--rk-cmark-ease": `cubic-bezier(0.34, ${overshoot.toFixed(2)}, 0.64, 1)`,
        } as React.CSSProperties
      }
    >
      <p className="rk-cmark__title">{title}</p>
      <div className="rk-cmark__body">
        {/* Hidden until measured, so it doesn't fly in from the top on first paint. */}
        <span className="rk-cmark__dot" data-ready={markerY !== null} aria-hidden="true" />
        <ol ref={listRef} className="rk-cmark__list" onPointerLeave={() => setPointed(null)}>
          {items.map((item, index) => (
            <li key={item}>
              <a
                href={`#${slug(item)}`}
                className="rk-cmark__link"
                data-shown={index === shown}
                aria-current={index === active ? "location" : undefined}
                onPointerEnter={() => setPointed(index)}
                onFocus={() => setPointed(index)}
                onBlur={() => setPointed(null)}
                onClick={(event) => {
                  event.preventDefault();
                  choose(index);
                }}
              >
                {item}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
