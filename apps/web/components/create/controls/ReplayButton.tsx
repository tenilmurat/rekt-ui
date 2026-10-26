"use client";

import { RotateCcw } from "lucide-react";

/** Restarts the current run. Nothing else changes — same code, same settings. */
export function ReplayButton({ onReplay }: { onReplay: () => void }) {
  return (
    <button
      type="button"
      onClick={onReplay}
      aria-label="Play the animation again"
      title="Replay"
      className="control flex items-center rounded-[8px] border p-[6px] active:scale-[0.96]"
      style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)" }}
    >
      <RotateCcw size={16} strokeWidth={1.875} style={{ color: "var(--icon)" }} />
    </button>
  );
}
