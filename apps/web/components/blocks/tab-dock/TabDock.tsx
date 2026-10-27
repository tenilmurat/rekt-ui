"use client";

import { Bell, CircleHelp, House, Settings, Shield, type LucideIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type TabDockItem = {
  id: string;
  /** Shown beside the icon while the tab is selected; screen readers always hear it. */
  label: string;
  icon: LucideIcon;
};

export type TabDockProps = {
  /** The tabs, left to right. */
  items?: TabDockItem[];
  /** The tab that starts selected. */
  defaultValue?: string;
  /** The resize line sits after this many tabs; 0 hides it. */
  divider?: number;
  /** The menu's size, as a scale: 1 is the default size. Dragging the line changes it. */
  size?: number;
  /** The smallest and largest sizes the line can drag to. */
  minSize?: number;
  maxSize?: number;
  /** How long the move between tabs takes, in milliseconds. */
  speed?: number;
  /** Let the line resize the menu. */
  resizable?: boolean;
  onChange?: (id: string) => void;
  onResize?: (size: number) => void;
};

const ITEMS: TabDockItem[] = [
  { id: "home", label: "Home", icon: House },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help", icon: CircleHelp },
  { id: "privacy", label: "Privacy", icon: Shield },
];

/** How far the pointer travels for the size to change by 1, in px. */
const DRAG_PER_STEP = 180;
/** How much an arrow key changes the size. */
const KEY_STEP = 0.05;

/** The same ease the tabs use in CSS: a quick start that settles softly. */
const ease = (t: number) => 1 - (1 - t) ** 3;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * A row of icon tabs where only the selected one shows its name, in a soft
 * pill that glides from tab to tab as the name opens out. A thin line between
 * the groups works like the separator in the macOS Dock: hover it and the
 * cursor turns into up-and-down chevrons; drag up to make the whole menu
 * bigger, down to make it smaller.
 */
export function TabDock({
  items = ITEMS,
  defaultValue,
  divider = 2,
  size = 1,
  minSize = 0.8,
  maxSize = 1.25,
  speed = 420,
  resizable = true,
  onChange,
  onResize,
}: TabDockProps) {
  const [value, setValue] = useState(defaultValue ?? items[2]?.id ?? items[0]?.id);
  const [scale, setScale] = useState(() => clamp(size, minSize, maxSize));
  const [dragging, setDragging] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  /** Where the pill is now, so a new glide starts from there. */
  const pill = useRef<{ x: number; w: number } | null>(null);
  const frame = useRef(0);
  const drag = useRef<{ y: number; scale: number } | null>(null);

  // A new Size from outside (the controls, say) replaces the dragged one.
  useEffect(() => setScale(clamp(size, minSize, maxSize)), [size, minSize, maxSize]);

  const place = (x: number, w: number) => {
    pill.current = { x, w };
    const el = pillRef.current;
    if (!el) return;
    el.style.transform = `translateX(${x}px)`;
    el.style.width = `${w}px`;
  };

  // The tab's layout box, not its rect on screen, so a transformed parent can't skew it.
  const target = () => {
    const tab = tabRefs.current[value];
    return tab ? { x: tab.offsetLeft, w: tab.offsetWidth } : null;
  };

  /*
    The tabs open and close their names with a CSS transition, so the chosen
    tab's box keeps moving for the whole glide. Each frame the pill blends
    from where it set off toward where that box is right then, and at the end
    it sits exactly on it.
  */
  useLayoutEffect(() => {
    const end = target();
    if (!end) return;
    cancelAnimationFrame(frame.current);
    const from = pill.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!from || reduced) {
      place(end.x, end.w);
      return;
    }
    const start = performance.now();
    const duration = Math.max(1, speed);
    let last = "";
    const step = (now: number) => {
      frame.current = 0;
      const goal = target();
      if (!goal) return;
      const t = Math.min(1, (now - start) / duration);
      const k = ease(t);
      place(from.x + (goal.x - from.x) * k, from.w + (goal.w - from.w) * k);
      // Past the end, keep sitting on the tab until it stops moving, in case its name is still opening.
      const at = `${goal.x} ${goal.w}`;
      if (t < 1 || at !== last) frame.current = requestAnimationFrame(step);
      last = at;
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, speed]);

  // A resize (the line, the controls, fonts arriving) moves the tabs: keep the pill on its tab.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const settle = () => {
      if (frame.current) return;
      const end = target();
      if (end) place(end.x, end.w);
    };
    // The bar and every tab, since a tab can change size while the bar can't (in a tight spot).
    const observer = new ResizeObserver(settle);
    observer.observe(bar);
    for (const tab of Object.values(tabRefs.current)) if (tab) observer.observe(tab);
    // A name that finishes opening after the glide has stopped also puts the pill back on its tab.
    bar.addEventListener("transitionend", settle);
    return () => {
      observer.disconnect();
      bar.removeEventListener("transitionend", settle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const select = (id: string) => {
    if (id === value) return;
    setValue(id);
    onChange?.(id);
  };

  const resize = (next: number) => {
    const clamped = clamp(Math.round(next * 100) / 100, minSize, maxSize);
    setScale(clamped);
    onResize?.(clamped);
  };

  // Arrow keys move between tabs and select as they go; Home and End jump to the ends.
  const onTabKey = (event: React.KeyboardEvent, index: number) => {
    const last = items.length - 1;
    const next =
      event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : -1;
    if (next < 0) return;
    event.preventDefault();
    const id = items[next].id;
    select(id);
    tabRefs.current[id]?.focus();
  };

  const line = resizable && divider > 0 && divider < items.length;

  return (
    <div
      ref={barRef}
      className="rk-dock"
      data-dragging={dragging || undefined}
      style={
        {
          "--rk-dock-scale": scale,
          "--rk-dock-speed": `${Math.max(0, speed)}ms`,
        } as React.CSSProperties
      }
    >
      <span ref={pillRef} className="rk-dock__pill" aria-hidden="true" />
      <div className="rk-dock__tabs" role="tablist" aria-label="Menu">
        {items.map((item, index) => {
          const Icon = item.icon;
          const selected = item.id === value;
          return (
            <div key={item.id} className="rk-dock__slot">
              {line && index === divider ? (
                <span
                  className="rk-dock__line"
                  role="separator"
                  tabIndex={0}
                  aria-orientation="vertical"
                  aria-label="Resize menu"
                  aria-valuemin={minSize * 100}
                  aria-valuemax={maxSize * 100}
                  aria-valuenow={Math.round(scale * 100)}
                  aria-valuetext={`${Math.round(scale * 100)}%`}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    drag.current = { y: event.clientY, scale };
                    setDragging(true);
                  }}
                  onPointerMove={(event) => {
                    if (!drag.current) return;
                    // Up makes it bigger, like the Dock.
                    resize(drag.current.scale + (drag.current.y - event.clientY) / DRAG_PER_STEP);
                  }}
                  onPointerUp={() => {
                    drag.current = null;
                    setDragging(false);
                  }}
                  onPointerCancel={() => {
                    drag.current = null;
                    setDragging(false);
                  }}
                  onKeyDown={(event) => {
                    const delta =
                      event.key === "ArrowUp" || event.key === "ArrowRight" ? KEY_STEP
                      : event.key === "ArrowDown" || event.key === "ArrowLeft" ? -KEY_STEP
                      : 0;
                    if (event.key === "Home") resize(minSize);
                    else if (event.key === "End") resize(maxSize);
                    else if (delta) resize(scale + delta);
                    else return;
                    event.preventDefault();
                  }}
                />
              ) : null}
              <button
                ref={(el) => {
                  tabRefs.current[item.id] = el;
                }}
                type="button"
                role="tab"
                className="rk-dock__tab"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(item.id)}
                onKeyDown={(event) => onTabKey(event, index)}
              >
                <Icon className="rk-dock__icon" strokeWidth={2} aria-hidden="true" />
                <span className="rk-dock__label">
                  <span className="rk-dock__text">{item.label}</span>
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
