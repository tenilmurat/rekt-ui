"use client";

import { Camera, Link2, Mic, PenLine, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export type BubbleMenuItem = {
  /** Passed to onSelect when the bubble is pressed. */
  id: string;
  /** Shown on the big bubble (when labels are on) and always read to screen readers. */
  label: string;
  icon: LucideIcon;
  /** The glass's tint, top colour then bottom colour. */
  tint?: [string, string];
};

export type BubbleMenuProps = {
  /**
   * Up to four items, most important first: the first gets the big bubble,
   * the second the medium one and the last two the small ones, so the sizes
   * read as the menu's hierarchy.
   */
  items?: BubbleMenuItem[];
  /** Open when it first appears. */
  defaultOpen?: boolean;
  /** Show the main action's label on the big bubble; the others show only their icon either way. */
  labels?: boolean;
  /** Let the open bubbles drift gently, each on its own beat. */
  float?: boolean;
  /** The whole menu's size, as a percentage of the design. */
  scale?: number;
  /** Close the menu after an item is pressed. */
  closeOnSelect?: boolean;
  /** Called with the pressed item's id. */
  onSelect?: (id: string) => void;
};

const DEFAULT_ITEMS: BubbleMenuItem[] = [
  { id: "post", label: "New post", icon: PenLine, tint: ["#6f98bb", "#2c4a68"] },
  { id: "photo", label: "Photo", icon: Camera, tint: ["#f2a7c3", "#8d6fc4"] },
  { id: "voice", label: "Voice", icon: Mic, tint: ["#b3b77a", "#5f6a3a"] },
  { id: "link", label: "Link", icon: Link2, tint: ["#ffa071", "#c4506e"] },
];

/**
 * Where each bubble sits, as in the design: its diameter and its centre's
 * offset from the button's centre, in design px. Biggest first, so the order
 * of the items is the order of importance. The last is a small glass bead
 * with no action, there for the look.
 */
const SLOTS = [
  { size: 150, x: 47.5, y: -112 },
  { size: 87, x: -72, y: -140.5 },
  { size: 70, x: -23, y: -204 },
  { size: 70, x: -55.5, y: -62 },
];
const BEAD = { size: 24, x: 29.5, y: -202 };

/** The button's plus, from the design: a filled cross, white at the centre fading to half at the ends. Turned 45° it's the close. */
function Plus() {
  const id = useId();
  return (
    <svg viewBox="0 0 42 42" fill="none" aria-hidden="true">
      <path
        d="M21 7C21.9665 7 22.75 7.7835 22.75 8.75V19.25H33.25C34.2165 19.25 35 20.0335 35 21C35 21.9665 34.2165 22.75 33.25 22.75H22.75V33.25C22.75 34.2165 21.9665 35 21 35C20.0335 35 19.25 34.2165 19.25 33.25V22.75H8.75C7.7835 22.75 7 21.9665 7 21C7 20.0335 7.7835 19.25 8.75 19.25H19.25V8.75C19.25 7.7835 20.0335 7 21 7Z"
        fill={`url(#${id})`}
      />
      <defs>
        <radialGradient id={id} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(21 21) rotate(90) scale(14)">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.5" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/**
 * A round button that opens a cluster of glass bubbles above it. The
 * bubbles' sizes are the menu's hierarchy: the main action is the big one,
 * the next the medium, the rest small. They spring out of the button in
 * turn and fold back into it when it closes; the plus turns into a cross.
 */
export function BubbleMenu({
  items = DEFAULT_ITEMS,
  defaultOpen = false,
  labels = true,
  float = true,
  scale = 100,
  closeOnSelect = true,
  onSelect,
}: BubbleMenuProps) {
  const [open, setOpen] = useState(defaultOpen);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const shown = items.slice(0, SLOTS.length);

  // A press anywhere outside closes it.
  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Escape closes, and goes no further, so a dialog or popover the menu sits in stays open; the arrow keys step through the bubbles, biggest first.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      // React may listen on the document itself (Next.js does), next to the dialog's own listener there.
      event.nativeEvent.stopImmediatePropagation();
      close();
      return;
    }
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!open || !step) return;
    event.preventDefault();
    const at = itemRefs.current.findIndex((el) => el === document.activeElement);
    const next = at < 0 ? 0 : (at + step + shown.length) % shown.length;
    itemRefs.current[next]?.focus();
  };

  return (
    <div
      ref={rootRef}
      className="rk-bubble"
      data-open={open}
      data-float={float}
      style={{ "--rk-bubble-u": `${Math.max(40, scale) / 100}px` } as React.CSSProperties}
      onKeyDown={onKeyDown}
    >
      <div id={menuId} role="menu" aria-label="Create" className="rk-bubble__menu" inert={!open}>
        {shown.map((item, i) => {
          const slot = SLOTS[i];
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              role="menuitem"
              aria-label={item.label}
              className="rk-bubble__item"
              data-rank={i}
              style={
                {
                  "--rk-bubble-size": slot.size,
                  "--rk-bubble-x": slot.x,
                  "--rk-bubble-y": slot.y,
                  "--rk-bubble-i": i,
                  "--rk-bubble-top": item.tint?.[0],
                  "--rk-bubble-low": item.tint?.[1],
                } as React.CSSProperties
              }
              onClick={() => {
                onSelect?.(item.id);
                if (closeOnSelect) close();
              }}
            >
              <span className="rk-bubble__glass">
                <Icon className="rk-bubble__icon" strokeWidth={1.75} aria-hidden="true" />
                {labels && i === 0 ? <span className="rk-bubble__label">{item.label}</span> : null}
              </span>
            </button>
          );
        })}
        <span
          className="rk-bubble__item rk-bubble__item--bead"
          aria-hidden="true"
          style={
            {
              "--rk-bubble-size": BEAD.size,
              "--rk-bubble-x": BEAD.x,
              "--rk-bubble-y": BEAD.y,
              "--rk-bubble-i": shown.length,
            } as React.CSSProperties
          }
        >
          <span className="rk-bubble__glass" />
        </span>
      </div>
      <button
        ref={triggerRef}
        type="button"
        className="rk-bubble__trigger"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="rk-bubble__plus">
          <Plus />
        </span>
      </button>
    </div>
  );
}
