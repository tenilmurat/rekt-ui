"use client";

import { useEffect, useState, type ReactNode } from "react";

/** 1 column on phones, 2 on tablets, 3 from 1024px — the wall's breakpoints. */
function useColumnCount() {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const two = window.matchMedia("(min-width: 640px)");
    const three = window.matchMedia("(min-width: 1024px)");
    const update = () => setCount(three.matches ? 3 : two.matches ? 2 : 1);
    update();
    two.addEventListener("change", update);
    three.addEventListener("change", update);
    return () => {
      two.removeEventListener("change", update);
      three.removeEventListener("change", update);
    };
  }, []);
  return count;
}

/**
 * Columns of cards with uneven heights. Each card goes into the currently
 * shortest column, so the wall stays level and reading order runs left to
 * right before it runs down.
 */
export function Masonry<T>({
  items,
  height,
  render,
  getKey,
}: {
  items: T[];
  /** Card height, used to balance the columns. */
  height: (item: T) => number;
  render: (item: T) => ReactNode;
  getKey: (item: T) => string;
}) {
  const count = useColumnCount();
  const columns: T[][] = Array.from({ length: count }, () => []);
  const totals = new Array(count).fill(0);
  for (const item of items) {
    const shortest = totals.indexOf(Math.min(...totals));
    columns[shortest].push(item);
    totals[shortest] += height(item) + 12;
  }

  return (
    <div className="flex gap-[12px]">
      {columns.map((column, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col gap-[12px]">
          {column.map((item) => (
            <div key={getKey(item)}>{render(item)}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
