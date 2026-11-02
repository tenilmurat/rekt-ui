"use client";

import { useCallback, useId, useRef, useState, useSyncExternalStore, type ButtonHTMLAttributes } from "react";
import { flushSync } from "react-dom";

export type ThemeTogglerShape = "circle" | "diamond" | "hexagon" | "star";

export type ThemeTogglerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  /** The shape the new theme is revealed through, growing until it covers the page. */
  shape?: ThemeTogglerShape;
  /** Where the reveal grows from: the button, or the middle of the screen. */
  from?: "button" | "center";
  /** How long the reveal takes, in milliseconds. */
  duration?: number;
  /** The icon's width and height, in px. */
  size?: number;
  /**
   * Called with the new theme. Pass it when something else owns the theme
   * (next-themes' setTheme, say); without it the toggler saves the choice to
   * localStorage under "theme" itself.
   */
  onThemeChange?: (theme: "light" | "dark") => void;
};

/** The page is dark while <html> has the class "dark" — the convention shadcn and next-themes use. */
const isDarkNow = () => document.documentElement.classList.contains("dark");
const subscribe = (change: () => void) => {
  const watch = new MutationObserver(change);
  watch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => watch.disconnect();
};

/**
 * The start and end clip-paths of the reveal, in percentages of the viewport
 * (the box the snapshot is clipped against): the shape shrunk to a point at
 * (x, y), and grown until even its innermost edge is past the farthest corner.
 */
function clips(shape: ThemeTogglerShape, x: number, y: number, w: number, h: number): [string, string] {
  const far = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
  const at = (px: number, py: number) => `${((px / w) * 100).toFixed(3)}% ${((py / h) * 100).toFixed(3)}%`;
  if (shape === "circle") {
    // A circle's percentage radius is measured against the box's diagonal ÷ √2.
    const r = (far / (Math.hypot(w, h) / Math.SQRT2)) * 100;
    return [`circle(0% at ${at(x, y)})`, `circle(${r.toFixed(3)}% at ${at(x, y)})`];
  }
  const points = shape === "star" ? 10 : shape === "hexagon" ? 6 : 4;
  // How far in the shape's edge dips, as a share of its outer radius: a star's notches, a polygon's flat sides.
  const inner = shape === "star" ? 0.42 * Math.cos(Math.PI / 5) : Math.cos(Math.PI / points);
  const polygon = (r: number) =>
    `polygon(${Array.from({ length: points }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / points;
      const k = shape === "star" && i % 2 ? 0.42 : 1;
      return at(x + r * k * Math.cos(a), y + r * k * Math.sin(a));
    }).join(", ")})`;
  return [polygon(0), polygon((far / inner) * 1.02)];
}

/**
 * A sun that turns into a moon. Clicking it switches the whole page between
 * light and dark: the new theme is revealed through a shape that grows out of
 * the button until it covers the screen, using the View Transitions API.
 */
export function ThemeToggler({
  shape = "circle",
  from = "button",
  duration = 500,
  size = 32,
  onThemeChange,
  className,
  style,
  ...props
}: ThemeTogglerProps) {
  const dark = useSyncExternalStore(subscribe, isDarkNow, () => false);
  const button = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const bite = useId();
  // The icon only animates once it's been clicked, so it doesn't play on load.
  const [touched, setTouched] = useState(false);

  const toggle = useCallback(() => {
    const el = button.current;
    if (!el || busy.current) return;
    setTouched(true);
    const next = isDarkNow() ? "light" : "dark";
    const apply = () => {
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.style.colorScheme = next;
      if (onThemeChange) onThemeChange(next);
      else {
        try {
          localStorage.setItem("theme", next);
        } catch {}
      }
    };

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || typeof document.startViewTransition !== "function") {
      apply();
      return;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    const box = el.getBoundingClientRect();
    const [x, y] = from === "center" ? [w / 2, h / 2] : [box.left + box.width / 2, box.top + box.height / 2];
    const path = clips(shape, x, y, w, h);
    const root = document.documentElement;
    // Holds the new snapshot clipped to nothing until the animation below starts, so it never flashes in whole.
    root.dataset.rkThemeVt = "";
    root.style.setProperty("--rk-theme-vt-from", path[0]);
    busy.current = true;

    const transition = document.startViewTransition(() => flushSync(apply));
    transition.ready
      .then(() =>
        root.animate(
          { clipPath: path },
          { duration, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards", pseudoElement: "::view-transition-new(root)" },
        ),
      )
      .catch(() => {});
    transition.finished
      .finally(() => {
        busy.current = false;
        delete root.dataset.rkThemeVt;
        root.style.removeProperty("--rk-theme-vt-from");
      })
      .catch(() => {});
  }, [shape, from, duration, onThemeChange]);

  return (
    <button
      ref={button}
      type="button"
      className={["rk-theme", className].filter(Boolean).join(" ")}
      data-dark={dark || undefined}
      data-touched={touched || undefined}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
      onClick={toggle}
      style={{ ...style, ["--rk-theme-size" as string]: `${size}px` }}
      {...props}
    >
      <svg className="rk-theme__icon" viewBox="0 0 24 24" aria-hidden="true">
        <mask id={bite}>
          <rect width="24" height="24" fill="#fff" />
          {/* The bite that turns the disc into a crescent; it waits off to the top right while it's a sun. */}
          <circle className="rk-theme__bite" cx="18.5" cy="5.5" r="7.5" fill="#000" />
        </mask>
        <circle className="rk-theme__core" cx="12" cy="12" r="9" mask={`url(#${bite})`} />
        <g className="rk-theme__rays">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1="12" y1="1.6" x2="12" y2="3.4" transform={`rotate(${i * 45} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
}
