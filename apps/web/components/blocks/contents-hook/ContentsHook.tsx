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
export type ContentsHookSection = {
  label: string;
  /** The section's colour: its rail bar, its hook and its active icon. */
  color?: string;
  items: ContentsHookItem[];
};

export type ContentsHookProps = {
  /** The tree connectors' line style. */
  line?: "solid" | "dashed";
  /** How long the hook takes to draw, in milliseconds. */
  speed?: number;
  /** Show each item's icon. */
  icons?: boolean;
  /** The sections, each with its colour and items. */
  sections?: ContentsHookSection[];
  /** Called when an item is chosen. */
  onSelect?: (section: string, item: string) => void;
};

const SECTIONS: ContentsHookSection[] = [
  {
    label: "Getting started",
    color: "#3b6ef5",
    items: [
      { label: "Introduction", icon: BookOpen },
      { label: "Installation", icon: Download },
      { label: "CLI", icon: Terminal },
    ],
  },
  {
    label: "Components",
    color: "#f2622e",
    items: [
      { label: "Buttons", icon: MousePointerClick },
      { label: "Cards", icon: LayoutGrid },
      { label: "Navigation", icon: Compass },
    ],
  },
  {
    label: "Theming",
    color: "#14a37f",
    items: [
      { label: "Colours", icon: Palette },
      { label: "Typography", icon: Type },
      { label: "Motion", icon: Sparkles },
    ],
  },
];

const FALLBACK_COLOR = "#141210";

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Item row height in px; the connectors are drawn to it. */
const ROW = 32;
const MID = ROW / 2;

/** The hook for item `index`: from the top of the list, down the trunk, round the corner, out to the item. */
const hookPath = (index: number) => {
  const y = index * ROW + MID;
  return `M 1 0 V ${y - 6} Q 1 ${y} 7 ${y} H 14`;
};

/**
 * A sidebar of sections on a thin rail, each in its own colour. Opening a
 * section unfolds its items on tree connectors; the chosen item gets a hook
 * that draws itself from the top of the list down to it, and a bar on the
 * rail moves straight to the open section. Choosing an item scrolls to the
 * element with its id, when the page has one.
 */
export function ContentsHook({
  line = "solid",
  speed = 700,
  icons = true,
  sections = SECTIONS,
  onSelect,
}: ContentsHookProps) {
  const [open, setOpen] = useState(0);
  const [active, setActive] = useState<{ section: number; item: number }>({ section: 0, item: 0 });
  const [bar, setBar] = useState<{ y: number; height: number } | null>(null);
  const headerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const baseId = useId();

  /*
    Place the bar where the open heading will be once the panels have finished
    moving, so it travels there in one straight move. Any panel above it is
    folding away: right now it still has its full height, so taking that off
    the heading's current position gives where the heading ends up.
  */
  useLayoutEffect(() => {
    const header = headerRefs.current[open];
    if (!header) return;
    let folding = 0;
    for (let k = 0; k < open; k++) folding += panelRefs.current[k]?.offsetHeight ?? 0;
    setBar({ y: header.offsetTop - folding, height: header.offsetHeight });
  }, [open, sections]);

  const choose = (section: number, item: number) => {
    setActive({ section, item });
    const label = sections[section].items[item].label;
    onSelect?.(sections[section].label, label);
    document.getElementById(slug(label))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="rk-chook"
      data-line={line}
      aria-label="Sidebar"
      style={
        {
          "--rk-chook-duration": `${Math.max(0, speed)}ms`,
          "--rk-chook-row": `${ROW}px`,
          "--rk-chook-bar": sections[open]?.color ?? FALLBACK_COLOR,
        } as React.CSSProperties
      }
    >
      <span className="rk-chook__rail" aria-hidden="true">
        {bar ? (
          <span className="rk-chook__bar" style={{ transform: `translateY(${bar.y}px)`, height: bar.height }} />
        ) : null}
      </span>

      {sections.map((section, s) => {
        const isOpen = s === open;
        const panelId = `${baseId}-${s}`;
        const hooked = isOpen && active.section === s ? active.item : null;
        return (
          <div
            key={section.label}
            className="rk-chook__section"
            data-open={isOpen}
            style={{ "--rk-chook-accent": section.color ?? FALLBACK_COLOR } as React.CSSProperties}
          >
            <button
              ref={(el) => {
                headerRefs.current[s] = el;
              }}
              type="button"
              className="rk-chook__heading"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(s)}
            >
              {section.label}
            </button>

            {/* Unfolds with a grid-rows transition; closed items are inert, so Tab skips them. */}
            <div
              ref={(el) => {
                panelRefs.current[s] = el;
              }}
              id={panelId}
              className="rk-chook__panel"
              inert={!isOpen}
            >
              <ol className="rk-chook__items">
                {/* The hook: one path from the top of the list to the chosen item, drawn on top of the tree. */}
                {hooked !== null ? (
                  <svg
                    className="rk-chook__hooks"
                    width="16"
                    height={section.items.length * ROW}
                    viewBox={`0 0 16 ${section.items.length * ROW}`}
                    aria-hidden="true"
                  >
                    <path key={`${s}-${hooked}`} className="rk-chook__hook" d={hookPath(hooked)} pathLength={1} />
                  </svg>
                ) : null}

                {section.items.map((item, i) => {
                  const last = i === section.items.length - 1;
                  const isActive = active.section === s && active.item === i;
                  const Icon = item.icon;
                  return (
                    <li key={item.label} className="rk-chook__item">
                      {/* Tree connector: down from the row above, round the corner, out to the item. */}
                      <svg className="rk-chook__tree" width="16" height={ROW} viewBox={`0 0 16 ${ROW}`} aria-hidden="true">
                        <path className="rk-chook__branch" d={`M 1 0 V ${MID - 6} Q 1 ${MID} 7 ${MID} H 14`} />
                        {last ? null : <path className="rk-chook__branch" d={`M 1 ${MID - 6} V ${ROW}`} />}
                      </svg>
                      <a
                        href={`#${slug(item.label)}`}
                        className="rk-chook__link"
                        aria-current={isActive ? "location" : undefined}
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
