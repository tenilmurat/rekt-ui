"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

export type ContentsHookProps = {
  /** Surface of the panel. */
  fill?: "light" | "dark";
  /** "hover" hooks whatever is pointed at; "click" only the chosen section. */
  follow?: "hover" | "click";
  /** The hook's line style. */
  line?: "solid" | "dashed";
  /** How long the hook takes to draw, in milliseconds. */
  speed?: number;
  /** The heading above the list. */
  title?: string;
  /** The sections, in order. */
  items?: string[];
  /** Called when a section is chosen. */
  onSelect?: (item: string, index: number) => void;
};

const ITEMS = ["Overview", "Install", "Usage", "Theming", "Changelog"];
const RAIL_X = 6;
const GUTTER = 28;

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * A table of contents on a thin rail. The active section gets a hook: a line
 * that draws itself down the rail and curves out to the item. Choosing a
 * section scrolls to the element with its id, when the page has one.
 */
export function ContentsHook({
  fill = "dark",
  follow = "hover",
  line = "dashed",
  speed = 420,
  title = "Contents",
  items = ITEMS,
  onSelect,
}: ContentsHookProps) {
  const [active, setActive] = useState(0);
  const [pointed, setPointed] = useState<number | null>(null);
  const [box, setBox] = useState<{ y: number; height: number } | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);
  const maskId = useId();

  const shown = follow === "hover" && pointed !== null ? pointed : active;

  useLayoutEffect(() => {
    const item = listRef.current?.children[shown] as HTMLElement | undefined;
    const body = bodyRef.current;
    if (item && body) setBox({ y: item.offsetTop + item.offsetHeight / 2, height: body.offsetHeight });
  }, [shown, items]);

  const choose = (index: number) => {
    setActive(index);
    onSelect?.(items[index], index);
    document.getElementById(slug(items[index]))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Down the rail from the item above, round the corner, out to the text.
  const hook = box
    ? `M ${RAIL_X} ${Math.max(0, box.y - 22)} L ${RAIL_X} ${box.y - 7} Q ${RAIL_X} ${box.y} ${RAIL_X + 7} ${box.y} L ${GUTTER - 6} ${box.y}`
    : "";

  return (
    <nav
      className="rk-chook"
      data-fill={fill}
      aria-label={title}
      style={{ "--rk-chook-duration": `${Math.max(0, speed)}ms` } as React.CSSProperties}
    >
      <p className="rk-chook__title">{title}</p>
      <div ref={bodyRef} className="rk-chook__body">
        {box ? (
          <svg className="rk-chook__svg" width={GUTTER} height={box.height} viewBox={`0 0 ${GUTTER} ${box.height}`} aria-hidden="true">
            <line className="rk-chook__rail" x1={RAIL_X} y1={0} x2={RAIL_X} y2={box.height} />
            {/* Keyed on the section, so each new hook draws from the start. */}
            <g key={shown}>
              {line === "dashed" ? (
                <>
                  {/* A dashed line can't draw itself, so a solid copy draws as its mask. */}
                  <mask id={maskId} maskUnits="userSpaceOnUse">
                    <path className="rk-chook__draw" d={hook} pathLength={1} stroke="#fff" />
                  </mask>
                  <path className="rk-chook__hook rk-chook__hook--dashed" d={hook} mask={`url(#${maskId})`} />
                </>
              ) : (
                <path className="rk-chook__hook rk-chook__draw" d={hook} pathLength={1} />
              )}
            </g>
          </svg>
        ) : null}
        <ol ref={listRef} className="rk-chook__list" onPointerLeave={() => setPointed(null)}>
          {items.map((item, index) => (
            <li key={item}>
              <a
                href={`#${slug(item)}`}
                className="rk-chook__link"
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
