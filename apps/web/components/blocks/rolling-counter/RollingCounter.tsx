"use client";

import { useEffect, useState } from "react";

export type RollingCounterProps = {
  /** Surface of the card. */
  fill?: "light" | "dark";
  /** Count up on its own, one step every `every` seconds. */
  auto?: boolean;
  /** Seconds between automatic steps. */
  every?: number;
  /** The number it starts from. */
  start?: number;
  /** The line above the number. */
  label?: string;
};

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * A number whose digits roll to their new value, like a mechanical counter.
 * Press +1 to step it, or switch `auto` on to have it count by itself.
 */
export function RollingCounter({
  fill = "dark",
  auto = false,
  every = 2,
  start = 1284,
  label = "Visitors today",
}: RollingCounterProps) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => setValue((v) => v + 1), Math.max(0.5, every) * 1000);
    return () => window.clearInterval(id);
  }, [auto, every]);

  const text = value.toLocaleString("en-US");

  return (
    <div className="rk-counter" data-fill={fill}>
      <span className="rk-counter__label">{label}</span>
      <div className="rk-counter__row">
        <span className="rk-counter__value" aria-hidden="true">
          {[...text].map((char, i) => {
            // Keyed from the right, so existing columns keep rolling as the number grows.
            const key = text.length - i;
            return /\d/.test(char) ? (
              <span key={key} className="rk-counter__digit">
                <span className="rk-counter__reel" style={{ transform: `translateY(${-Number(char) * 10}%)` }}>
                  {DIGITS.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </span>
              </span>
            ) : (
              <span key={key} className="rk-counter__separator">
                {char}
              </span>
            );
          })}
        </span>
        <span className="rk-counter__sr">{text}</span>
        <button type="button" className="rk-counter__button" onClick={() => setValue((v) => v + 1)} aria-label="Add one">
          +1
        </button>
      </div>
    </div>
  );
}
