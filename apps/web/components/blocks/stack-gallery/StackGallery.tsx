"use client";

import { useEffect, useRef, useState } from "react";

export type StackGalleryItem = {
  /** The small line above the title. */
  eyebrow: string;
  title: string;
  /** Any CSS background, used when there's no image. */
  background?: string;
  /** An image URL; it covers the card. */
  image?: string;
};

export type StackGalleryProps = {
  /** How far apart the cards stand in depth, in px. */
  depth?: number;
  /** How long a card takes to move, in milliseconds. */
  speed?: number;
  /** Step through the cards with the mouse wheel or trackpad while over the stack. */
  wheel?: boolean;
  /** The cards, front first. */
  items?: StackGalleryItem[];
  /** Called when the front card changes, and when it's clicked. */
  onChange?: (item: StackGalleryItem, index: number) => void;
  onOpen?: (item: StackGalleryItem, index: number) => void;
};

const ITEMS: StackGalleryItem[] = [
  { eyebrow: "Warm tone", title: "Ember", background: "radial-gradient(120% 90% at 20% 15%, #ffb36b, #ff5a1f 45%, #a8230d)" },
  { eyebrow: "Ocean study", title: "Tide", background: "linear-gradient(160deg, #08202e, #0f6b78 55%, #8fe0d6)" },
  {
    eyebrow: "Pastel wave",
    title: "Bloom",
    background:
      "radial-gradient(60% 70% at 25% 75%, #f7a8cf, transparent 70%), radial-gradient(55% 65% at 78% 28%, #a9dcff, transparent 70%), #e7d6ff",
  },
  { eyebrow: "Golden hour", title: "Dune", background: "linear-gradient(170deg, #ffd47e, #f2a048 50%, #8f421f)" },
  {
    eyebrow: "Night sky",
    title: "Aurora",
    background:
      "radial-gradient(70% 55% at 30% 62%, rgb(29 233 182 / 0.75), transparent 70%), radial-gradient(60% 60% at 80% 25%, #7c4dff, transparent 70%), #080d28",
  },
  { eyebrow: "Alpine", title: "Frost", background: "linear-gradient(180deg, #f1f5f9, #c8d5e3 60%, #8ea2b8)" },
  {
    eyebrow: "Chromatic",
    title: "Velvet",
    background:
      "radial-gradient(55% 60% at 72% 18%, #ffd166, transparent 70%), radial-gradient(60% 65% at 25% 92%, #7b2ff7, transparent 70%), #ff3d81",
  },
  { eyebrow: "Violet hour", title: "Dusk", background: "linear-gradient(160deg, #170f3b, #4a2a98 52%, #e07ac0)" },
];

/** How much wheel movement makes one step, and the shortest gap between steps it can make. */
const WHEEL_STEP = 60;
const WHEEL_GAP_MS = 180;

type Motion = { kind: "drop" | "rise"; id: number };

/**
 * A gallery of cards stacked in depth: each card further back stands a
 * little higher and smaller, so you see the top edge of every one. Scroll,
 * press the arrow keys or click a card to bring it forward; the front card
 * tips forward and drops away, and the rest of the stack moves up a place.
 * It loops. Hovering a card in the stack lifts it.
 */
export function StackGallery({
  depth = 46,
  speed = 650,
  wheel = true,
  items = ITEMS,
  onChange,
  onOpen,
}: StackGalleryProps) {
  const n = items.length;
  const [front, setFront] = useState(0);
  const [motions, setMotions] = useState<Record<number, Motion>>({});
  const stageRef = useRef<HTMLDivElement | null>(null);
  /** Steps still to take (forward is positive), taken one at a time so each card drops in turn. */
  const pending = useRef(0);
  const timer = useRef(0);
  const motionId = useRef(0);
  const frontRef = useRef(0);
  frontRef.current = front;

  const stepGap = Math.max(60, speed * 0.22);

  const takeStep = () => {
    timer.current = 0;
    if (pending.current === 0 || n < 2) return;
    const dir = pending.current > 0 ? 1 : -1;
    pending.current -= dir;
    const current = frontRef.current;
    const next = (current + dir + n) % n;
    // Forward: the front card drops away to the back. Back: the last card rises to the front.
    const moving = dir > 0 ? current : next;
    const id = ++motionId.current;
    setMotions((m) => ({ ...m, [moving]: { kind: dir > 0 ? "drop" : "rise", id } }));
    setFront(next);
    onChange?.(items[next], next);
    if (pending.current !== 0) timer.current = window.setTimeout(takeStep, stepGap);
  };

  const go = (steps: number) => {
    pending.current = Math.max(-n, Math.min(n, pending.current + steps));
    if (!timer.current) takeStep();
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The wheel: a non-passive listener, so scrolling over the stack steps it instead of the page.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !wheel) return;
    let travelled = 0;
    let lastStep = 0;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      travelled += event.deltaY;
      const now = performance.now();
      if (Math.abs(travelled) < WHEEL_STEP || now - lastStep < WHEEL_GAP_MS) return;
      go(travelled > 0 ? 1 : -1);
      travelled = 0;
      lastStep = now;
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wheel, n, stepGap]);

  const current = items[front];

  return (
    <section
      className="rk-gallery"
      aria-roledescription="carousel"
      aria-label="Gallery"
      style={
        {
          "--rk-gallery-depth": `${Math.max(0, depth)}px`,
          "--rk-gallery-speed": `${Math.max(0, speed)}ms`,
          "--rk-gallery-last": n - 1,
        } as React.CSSProperties
      }
    >
      {/* Keyed on the front card, so the caption fades in afresh each time it changes. */}
      <header key={front} className="rk-gallery__caption" aria-live="polite">
        <span className="rk-gallery__eyebrow">{current?.eyebrow}</span>
        <span className="rk-gallery__title">{current?.title}</span>
      </header>

      <div
        ref={stageRef}
        className="rk-gallery__stage"
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowRight") go(1);
          else if (event.key === "ArrowUp" || event.key === "ArrowLeft") go(-1);
          else return;
          event.preventDefault();
        }}
      >
        {items.map((item, index) => {
          const d = (index - front + n) % n;
          const motion = motions[index];
          return (
            <button
              key={index}
              type="button"
              className="rk-gallery__card"
              data-front={d === 0}
              data-motion={motion?.kind}
              tabIndex={d === 0 ? 0 : -1}
              aria-label={d === 0 ? `${item.title}, ${index + 1} of ${n}` : `Show ${item.title}`}
              aria-current={d === 0 ? "true" : undefined}
              style={
                {
                  "--d": d,
                  zIndex: n - d,
                  background: item.image ? `center / cover no-repeat url("${item.image}")` : item.background,
                } as React.CSSProperties
              }
              onClick={() => (d === 0 ? onOpen?.(item, index) : go(d))}
              onAnimationEnd={() =>
                setMotions((m) => {
                  if (m[index]?.id !== motion?.id) return m;
                  const rest = { ...m };
                  delete rest[index];
                  return rest;
                })
              }
            />
          );
        })}
        <span className="rk-gallery__shadow" aria-hidden="true" />
      </div>
    </section>
  );
}
