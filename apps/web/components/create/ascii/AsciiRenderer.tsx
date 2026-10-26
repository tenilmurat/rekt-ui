"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ASCII_RATE,
  SCAN_BAND,
  cellSeed,
  type AsciiAnimationId,
} from "@/lib/create/ascii/animation";
import { CHAR_ASPECT, type AsciiGrid } from "@/lib/create/ascii/ascii";
import { usePrefersReducedMotion, useReveal } from "@/lib/create/code/animation";

/**
 * Draws the grid and animates it a row at a time. Row granularity keeps a dense
 * grid cheap: 120x60 cells is 60 nodes per frame, not 7,200. Cells that are
 * blank in the source stay blank in every animation, so transparent areas of a
 * logo never fill with noise.
 */
export function AsciiRenderer({
  grid,
  animation,
  speed,
  runId,
  ramp,
}: {
  grid: AsciiGrid;
  animation: AsciiAnimationId;
  speed: number;
  runId: number;
  ramp: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox({ width, height });
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  // One cell is CHAR_ASPECT wide for every unit of line height, so the type
  // size that fits is whichever of the two axes runs out first.
  const fontSize = useMemo(() => {
    if (!box.width || !box.height || !grid.cols) return 10;
    const byWidth = box.width / (grid.cols * CHAR_ASPECT);
    const byHeight = box.height / grid.rowCount;
    return Math.max(3, Math.min(22, Math.floor(Math.min(byWidth, byHeight) * 10) / 10));
  }, [box, grid.cols, grid.rowCount]);

  const animated = animation !== "static" && animation !== "pulse" && !reduced;
  const total = animation === "scramble" ? 100 : grid.rowCount + SCAN_BAND;

  const { revealed, churn } = useReveal({
    total,
    rate: ASCII_RATE[animation] * speed,
    runId,
    animate: animated,
  });

  const rows = useMemo(() => {
    if (!animated) return grid.rows.map((row) => ({ text: row, lit: false }));

    if (animation === "reveal") {
      return grid.rows.map((row, y) => ({ text: y < revealed ? row : "", lit: false }));
    }

    if (animation === "scan") {
      const head = revealed;
      return grid.rows.map((row, y) => ({
        text: y <= head ? row : "",
        lit: y > head - SCAN_BAND && y <= head,
      }));
    }

    // scramble: each cell resolves at its own moment, in a stable random order
    const progress = revealed / 100;
    return grid.rows.map((row, y) => {
      let text = "";
      for (let x = 0; x < row.length; x += 1) {
        const char = row[x];
        if (char === " ") {
          text += " ";
          continue;
        }
        text += cellSeed(y, x) < progress ? char : ramp[(churn + y * 7 + x * 13) % ramp.length];
      }
      return { text, lit: false };
    });
  }, [animated, animation, grid.rows, revealed, churn, ramp]);

  const pulsing = animation === "pulse" && !reduced;

  return (
    <div ref={hostRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      <pre
        aria-label="ASCII result"
        className={`select-none whitespace-pre font-mono ${pulsing ? "ascii-pulse" : ""}`}
        style={{
          fontSize,
          lineHeight: 1,
          color: "var(--ink)",
          animationDuration: pulsing ? `${(2.4 / Math.max(speed, 0.1)).toFixed(2)}s` : undefined,
        }}
      >
        {rows.map((row, index) => (
          <div key={index} style={{ color: row.lit ? "var(--accent)" : undefined, height: fontSize }}>
            {row.text || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}
