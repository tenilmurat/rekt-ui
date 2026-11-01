"use client";

import { useEffect, useRef, useState } from "react";

export type StackGalleryItem = {
  /** Names the card for screen readers. */
  title: string;
  /** Any CSS background: the card itself when there's no image, or what shows under the image while it loads. */
  background?: string;
  /** An image URL; it covers the card. */
  image?: string;
};

export type StackGalleryProps = {
  /** How many cards show in the stack at once; the rest wait, hidden, behind the last one. */
  visible?: number;
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

/** Where the built-in pictures are served from: public/blocks/stack-gallery/, under the site's base path if it has one. */
const picture = (name: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/blocks/stack-gallery/${name}.jpg`;

/** Each fruit painting, with a colour close to its own that shows while it loads. */
const FRUIT: Record<string, StackGalleryItem> = {
  lemon: { title: "Lemon", image: picture("lemon"), background: "#2f5a26" },
  strawberry: { title: "Strawberry", image: picture("strawberry"), background: "#dfe3ea" },
  banana: { title: "Banana", image: picture("banana"), background: "#d99a55" },
  watermelon: { title: "Watermelon", image: picture("watermelon"), background: "#132b5a" },
  kiwi: { title: "Kiwi", image: picture("kiwi"), background: "#f2a5b2" },
  raspberry: { title: "Raspberry", image: picture("raspberry"), background: "#e9e6ef" },
  cherry: { title: "Cherry", image: picture("cherry"), background: "#4e8f2c" },
};

/** The built-in cards: the seven paintings twice over, the second round in another order so the same one never sits next to itself. */
const ITEMS: StackGalleryItem[] = [
  "lemon", "strawberry", "banana", "watermelon", "kiwi", "raspberry", "cherry",
  "banana", "cherry", "lemon", "watermelon", "raspberry", "strawberry", "kiwi",
].map((name) => FRUIT[name]);

/** How much wheel movement makes one step, and the shortest gap between steps it can make. */
const WHEEL_STEP = 60;
const WHEEL_GAP_MS = 180;

/**
 * A card's motion: dropping away from the front, rising back into it, or
 * fading in at its place after a drop that landed it in view. from is where a
 * dropping card was on screen when it set off.
 */
type Motion = { kind: "drop" | "rise" | "enter"; id: number; from?: string };

const ANIMATION: Record<Motion["kind"], string> = {
  drop: "rk-gallery-drop",
  rise: "rk-gallery-drop",
  enter: "rk-gallery-enter",
};

/**
 * A gallery of cards stacked in depth: each card further back stands a
 * little higher and smaller, so you see the top edge of every one. Scroll,
 * press the arrow keys or click a card to bring it forward; the cards in
 * front of it tip forward and drop gently away one after another, the stack
 * moves up a place each time, and the next waiting card fades in at the
 * back. It loops. Hovering a card in the stack lifts it.
 */
export function StackGallery({
  visible = 8,
  depth = 46,
  speed = 650,
  wheel = true,
  items = ITEMS,
  onChange,
  onOpen,
}: StackGalleryProps) {
  const n = items.length;
  // Always keep at least one card hidden, so a single drop never has to reappear in view.
  const shown = Math.max(1, Math.min(Math.round(visible), n - 1));
  const [front, setFront] = useState(0);
  const [motions, setMotions] = useState<Record<number, Motion>>({});
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /** Steps still to take (forward is positive), taken one at a time so each card drops in turn. */
  const pending = useRef(0);
  const timer = useRef(0);
  const motionId = useRef(0);
  const frontRef = useRef(0);
  frontRef.current = front;

  const stepGap = Math.max(60, speed * 0.2);

  /*
    One place at a time, a short gap apart, so a long jump is a quick run of
    single steps: each card drops from wherever it is on screen right then
    (still gliding forward from the last step, say), and the stack's
    transitions pick up from where they are, so the run flows without jumps.
  */
  const takeStep = () => {
    timer.current = 0;
    if (pending.current === 0 || n < 2) return;
    const dir = pending.current > 0 ? 1 : -1;
    pending.current -= dir;
    const current = frontRef.current;
    const next = (current + dir + n) % n;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Forward: the front card drops away. Back: a hidden card rises to the front.
      const moving = dir > 0 ? current : next;
      const el = cardRefs.current[moving];
      const from = dir > 0 && el ? getComputedStyle(el).transform : "none";
      const motion: Motion = { kind: dir > 0 ? "drop" : "rise", id: ++motionId.current };
      if (from !== "none") motion.from = from;
      setMotions((m) => ({ ...m, [moving]: motion }));
    }
    frontRef.current = next;
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

  return (
    <section
      className="rk-gallery"
      aria-roledescription="carousel"
      aria-label="Gallery"
      style={
        {
          "--rk-gallery-depth": `${Math.max(0, depth)}px`,
          "--rk-gallery-speed": `${Math.max(0, speed)}ms`,
        } as React.CSSProperties
      }
    >
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
          const hidden = d >= shown;
          const motion = motions[index];
          return (
            <button
              key={index}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              type="button"
              className="rk-gallery__card"
              data-front={d === 0}
              data-hidden={hidden}
              data-motion={motion?.kind}
              tabIndex={d === 0 ? 0 : -1}
              aria-hidden={hidden || undefined}
              aria-label={d === 0 ? `${item.title}, ${index + 1} of ${n}` : `Show ${item.title}`}
              aria-current={d === 0 ? "true" : undefined}
              style={
                {
                  // Hidden cards wait in the last place, so the next one fades in where it belongs.
                  "--d": Math.min(d, shown - 1),
                  "--rk-gallery-from": motion?.from,
                  // Moving cards ride above the stack, and an earlier drop stays in front of a later one.
                  zIndex: motion && motion.kind !== "enter" ? 1_000_000 - motion.id : n - d,
                  background: item.image ? `center / cover no-repeat url("${item.image}")${item.background ? `, ${item.background}` : ""}` : item.background,
                } as React.CSSProperties
              }
              onClick={() => (d === 0 ? onOpen?.(item, index) : go(d))}
              onAnimationEnd={(event) => {
                const name = event.animationName;
                setMotions((m) => {
                  const done = m[index];
                  if (!done || ANIMATION[done.kind] !== name) return m;
                  const rest = { ...m };
                  delete rest[index];
                  // A drop that landed the card back in view (a long jump) fades it in at its place.
                  const place = (index - frontRef.current + n) % n;
                  if (done.kind === "drop" && place < shown) rest[index] = { kind: "enter", id: done.id };
                  return rest;
                });
              }}
            />
          );
        })}
        <span className="rk-gallery__shadow" aria-hidden="true" />
      </div>
      <p className="rk-gallery__status" aria-live="polite">
        {items[front]?.title}
      </p>
    </section>
  );
}
