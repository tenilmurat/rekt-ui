"use client";

import ShimmerText from "@/components/previews/kokonut/text/shimmer-text";
import type { PreviewProps } from "@/lib/registry/types";

/** Their gradient, held still — what a paused or reduced-motion preview shows. */
const GRADIENT =
  "bg-[length:200%_100%] bg-gradient-to-r from-neutral-950 via-neutral-400 to-neutral-950 bg-clip-text font-bold text-transparent dark:from-white dark:via-neutral-600 dark:to-white";

/**
 * Registry-ready wrapper.
 *
 * The key carries `duration`: Motion keeps a running loop on the transition it
 * started with, so changing the prop alone leaves the shimmer at its old speed.
 * A new key remounts it, and the preset takes effect immediately.
 *
 * Off-screen the animating component is unmounted and the same text is left in
 * place, so no loop runs out of view and the card is never blank.
 */
export function ShimmerTextPreview({
  paused = false,
  startedAt,
  expanded,
  text = "Text Shimmer",
  duration = 2.5,
}: PreviewProps & { text?: string; duration?: number }) {
  const size = expanded ? "text-[44px]" : "text-3xl";

  if (paused) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className={`${GRADIENT} ${size}`}>{text}</span>
      </div>
    );
  }

  return (
    <ShimmerText
      key={`${startedAt}-${duration}`}
      text={text}
      duration={duration}
      className={size}
    />
  );
}
