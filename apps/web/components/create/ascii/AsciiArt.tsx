"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { AsciiRenderer } from "@/components/create/ascii/AsciiRenderer";
import type { AsciiAnimationId } from "@/lib/create/ascii/animation";
import {
  columnsForDensity,
  generateAsciiGrid,
  loadImage,
  svgToImage,
  trimGrid,
  type AsciiGrid,
} from "@/lib/create/ascii/ascii";
import { getCharacterSet, type CharacterSetId } from "@/lib/create/ascii/charsets";

export type AsciiArtProps = {
  sourceType: "icon" | "logo" | "image";
  /** Lucide icon name, kebab-case, when sourceType is "icon". */
  icon?: string | null;
  /** Object URL or path for an uploaded logo or image. */
  src?: string | null;
  characterSet?: CharacterSetId;
  customCharacters?: string;
  animation?: AsciiAnimationId;
  /** 0-1: how many columns the grid gets. */
  density?: number;
  speed?: number;
  invert?: boolean;
  /** Change it to play the animation again. */
  runId?: number;
  /** The finished grid, so the page can export it as an image. */
  onGrid?: (rows: string[] | null) => void;
};

/**
 * Icon, logo or image in — animated ASCII out.
 *
 * All three sources take the same path: become an <img>, get drawn into a
 * canvas the size of the grid, and are read one pixel per character. The icon
 * is rendered off-screen by Lucide first and serialised, so it goes through the
 * same pipeline as an upload rather than a renderer of its own.
 */
export function AsciiArt({
  sourceType,
  icon,
  src,
  characterSet = "classic",
  customCharacters = "",
  animation = "static",
  density = 0.6,
  speed = 1,
  invert = false,
  runId = 0,
  onGrid,
}: AsciiArtProps) {
  const iconHostRef = useRef<HTMLSpanElement | null>(null);
  const [grid, setGrid] = useState<AsciiGrid | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Lucide fetches an icon on demand, so the SVG lands after this renders.
  const [iconReady, setIconReady] = useState(0);

  useEffect(() => {
    const host = iconHostRef.current;
    if (!host || sourceType !== "icon") return;
    const observer = new MutationObserver(() => setIconReady((n) => n + 1));
    observer.observe(host, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [sourceType]);

  const cols = columnsForDensity(density);
  const ramp = getCharacterSet(characterSet, customCharacters);

  useEffect(() => {
    let cancelled = false;

    async function build() {
      setError(null);
      try {
        let image: HTMLImageElement | null = null;

        if (sourceType === "icon") {
          const svg = iconHostRef.current?.querySelector("svg");
          if (!svg) return; // Lucide loads the icon asynchronously; the effect reruns
          const markup = new XMLSerializer().serializeToString(svg);
          image = await svgToImage(markup);
        } else if (src) {
          image = await loadImage(src);
        }

        if (!image || cancelled) return;
        const built = generateAsciiGrid({ image, cols, characterSet, customCharacters, invert });
        if (!built || cancelled) return;
        const trimmed = trimGrid(built);
        setGrid(trimmed);
        onGrid?.(trimmed.rows);
      } catch {
        if (!cancelled) {
          setGrid(null);
          onGrid?.(null);
          setError("That file could not be read");
        }
      }
    }

    build();
    return () => {
      cancelled = true;
    };
    // onGrid is a reporting callback; re-running on its identity would loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceType, icon, src, cols, characterSet, customCharacters, invert, iconReady]);

  const placeholder = useMemo(() => {
    if (error) return error;
    if (sourceType === "icon" && !icon) return "Choose a Lucide icon";
    if (sourceType !== "icon" && !src) return `Upload a ${sourceType}`;
    return null;
  }, [error, sourceType, icon, src]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* off-screen, and the source of truth for the icon's shape */}
      <span
        ref={iconHostRef}
        aria-hidden="true"
        className="pointer-events-none absolute opacity-0"
        style={{ left: -9999, top: 0 }}
      >
        {sourceType === "icon" && icon ? (
          <DynamicIcon name={icon as IconName} size={512} strokeWidth={1.5} color="#000000" />
        ) : null}
      </span>

      {grid && !placeholder ? (
        <AsciiRenderer grid={grid} animation={animation} speed={speed} runId={runId} ramp={ramp} />
      ) : (
        <p className="text-[13px]" style={{ color: "var(--ink-3)" }}>
          {placeholder ?? "Converting…"}
        </p>
      )}
    </div>
  );
}

export default AsciiArt;
