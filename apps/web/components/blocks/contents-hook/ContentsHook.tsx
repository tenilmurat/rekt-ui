"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import {
  BookOpen,
  Compass,
  Download,
  LayoutGrid,
  MousePointerClick,
  Palette,
  Sparkles,
  Terminal,
  Type,
  type LucideIcon,
} from "lucide-react";

export type ContentsHookItem = { label: string; icon?: LucideIcon };
export type ContentsHookSection = { label: string; items: ContentsHookItem[] };

export type ContentsHookProps = {
  /** "hover" hooks whatever item is pointed at; "click" only the chosen one. */
  follow?: "hover" | "click";
  /** The tree connectors' line style. */
  line?: "solid" | "dashed";
  /** How long the active hook takes to draw, in milliseconds. */
  speed?: number;
  /** Show each item's icon. */
  icons?: boolean;
  /** The sections, each with its items. */
  sections?: ContentsHookSection[];
  /** Called when an item is chosen. */
  onSelect?: (section: string, item: string) => void;
};

const SECTIONS: ContentsHookSection[] = [
  {
    label: "Getting started",
    items: [
      { label: "Introduction", icon: BookOpen },
      { label: "Installation", icon: Download },
      { label: "CLI", icon: Terminal },
    ],
  },
  {
    label: "Components",
    items: [
      { label: "Buttons", icon: MousePointerClick },
      { label: "Cards", icon: LayoutGrid },
      { label: "Navigation", icon: Compass },
    ],
  },
  {
    label: "Theming",
    items: [
      { label: "Colours", icon: Palette },
      { label: "Typography", icon: Type },
      { label: "Motion", icon: Sparkles },
    ],
  },
];

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Item row height in px; the connectors are drawn to it. */
const ROW = 32;
const MID = ROW / 2;

/**
 * A sidebar of sections on a thin rail. Opening a section unfolds its items
 * on tree connectors; the active item's connector redraws itself as a hook,
 * and a bar on the rail slides to the open section. Choosing an item scrolls
 * to the element with its id, when the page has one.
 */
export function ContentsHook({
  follow = "hover",
  line = "solid",
  speed = 420,
  icons = true,
  sections = SECTIONS,
  onSelect,
}: ContentsHookProps) {
  const [open, setOpen] = useState(0);
  const [active, setActive] = useState<{ section: number; item: number }>({ section: 0, item: 0 });
  const [pointed, setPointed] = useState<number | null>(null);
  const [bar, setBar] = useState<{ y: number; height: number } | null>(null);
  const headerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navRef = useRef<HTMLElement | null>(null);
  const baseId = useId();

  // The item that gets the hook: pointed at (with Follow: Hover) or chosen, in the open section.
  const hooked =
    follow === "hover" && pointed !== null ? pointed : active.section === open ? active.item : null;

  // The rail's bar sits beside the open section's heading. While a panel folds
  // or unfolds the headings below it move, so the bar re-measures every time
  // the sidebar changes size and rides along with them.
  useLayoutEffect(() => {
    const measure = () => {
      const header = headerRefs.current[open];
      if (header) setBar({ y: header.offsetTop, height: header.offsetHeight });
    };
    measure();
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [open, sections]);

  const choose = (section: number, item: number) => {
    setActive({ section, item });
    const label = sections[section].items[item].label;
    onSelect?.(sections[section].label, label);
    document.getElementById(slug(label))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      ref={navRef}
      className="rk-chook"
      data-line={line}
      aria-label="Sidebar"
      style={{ "--rk-chook-duration": `${Math.max(0, speed)}ms`, "--rk-chook-row": `${ROW}px` } as React.CSSProperties}
    >
      <span className="rk-chook__rail" aria-hidden="true">
        {bar ? (
          <span
            className="rk-chook__bar"
            style={{ transform: `translateY(${bar.y}px)`, height: bar.height } as React.CSSProperties}
          />
        ) : null}
      </span>

      {sections.map((section, s) => {
        const isOpen = s === open;
        const panelId = `${baseId}-${s}`;
        return (
          <div key={section.label} className="rk-chook__section" data-open={isOpen}>
            <button
              ref={(el) => {
                headerRefs.current[s] = el;
              }}
              type="button"
              className="rk-chook__heading"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => {
                setOpen(s);
                setPointed(null);
              }}
            >
              {section.label}
            </button>

            {/* Unfolds with a grid-rows transition; closed items are inert, so Tab skips them. */}
            <div id={panelId} className="rk-chook__panel" inert={!isOpen}>
              <ol className="rk-chook__items" onPointerLeave={() => setPointed(null)}>
                {section.items.map((item, i) => {
                  const last = i === section.items.length - 1;
                  const isActive = active.section === s && active.item === i;
                  const isHooked = isOpen && hooked === i;
                  const Icon = item.icon;
                  return (
                    <li key={item.label} className="rk-chook__item">
                      {/* Tree connector: down from the row above, round the corner, out to the item. */}
                      <svg className="rk-chook__tree" width="16" height={ROW} viewBox={`0 0 16 ${ROW}`} aria-hidden="true">
                        <path className="rk-chook__branch" d={`M 1 0 V ${MID - 5} Q 1 ${MID} 6 ${MID} H 14`} />
                        {last ? null : <path className="rk-chook__branch" d={`M 1 ${MID - 5} V ${ROW}`} />}
                        {isHooked ? (
                          <path
                            key={`${s}-${i}`}
                            className="rk-chook__hook"
                            d={`M 1 0 V ${MID - 5} Q 1 ${MID} 6 ${MID} H 14`}
                            pathLength={1}
                          />
                        ) : null}
                      </svg>
                      <a
                        href={`#${slug(item.label)}`}
                        className="rk-chook__link"
                        data-hooked={isHooked}
                        aria-current={isActive ? "location" : undefined}
                        onPointerEnter={() => setPointed(i)}
                        onFocus={() => setPointed(i)}
                        onBlur={() => setPointed(null)}
                        onClick={(event) => {
                          event.preventDefault();
                          choose(s, i);
                        }}
                      >
                        {icons && Icon ? <Icon className="rk-chook__icon" size={14} strokeWidth={1.75} aria-hidden="true" /> : null}
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
