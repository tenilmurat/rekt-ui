"use client";

import { Lock, Maximize2 } from "lucide-react";
import type { UiBlock } from "@/lib/ui/types";
import { useBlockValues } from "@/lib/ui/use-block-values";
import { useInView } from "@/lib/use-in-view";

export const DEFAULT_CARD_HEIGHT = 380;

/**
 * One component on the wall, live and usable in place. Its name (bottom left)
 * and the round button (bottom right) open it with its controls and code.
 */
export function BlockCard({ block, onOpen }: { block: UiBlock; onOpen: () => void }) {
  const { ref, active } = useInView<HTMLElement>();
  const { values, startedAt } = useBlockValues(block);
  const Component = block.component;

  return (
    <article
      ref={ref}
      className="relative overflow-hidden rounded-[28px]"
      style={{ height: block.cardHeight ?? DEFAULT_CARD_HEIGHT, backgroundColor: "var(--surface)" }}
    >
      <div className="flex h-full w-full items-center justify-center px-[24px] pb-[40px]">
        {/* Off screen, the card drops its preview so nothing runs unseen. */}
        {active ? <Component key={startedAt} {...values} /> : null}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-[12px] p-[14px]">
        <button
          type="button"
          onClick={onOpen}
          className="control pointer-events-auto flex h-[38px] items-center gap-[6px] rounded-full border px-[14px] text-[12.5px] active:scale-[0.97]"
          style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)", color: "var(--ink)" }}
        >
          {block.title}
          {block.tier === "pro" ? <Lock size={12} strokeWidth={2} aria-label="Pro" style={{ color: "var(--ink-3)" }} /> : null}
        </button>
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${block.title} with its code`}
          title="Open"
          className="control pointer-events-auto flex size-[38px] items-center justify-center rounded-full border active:scale-[0.94]"
          style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)", color: "var(--icon)" }}
        >
          <Maximize2 size={15} strokeWidth={1.875} />
        </button>
      </div>
    </article>
  );
}

/** Stand-in cards for an empty wall, so the layout reads before anything is published. */
export function GhostCard({ height }: { height: number }) {
  return (
    <div aria-hidden="true" className="relative overflow-hidden rounded-[28px]" style={{ height, backgroundColor: "var(--surface)" }}>
      <div className="absolute bottom-[14px] left-[14px] h-[38px] w-[112px] rounded-full" style={{ backgroundColor: "var(--hover-2)" }} />
      <div className="absolute bottom-[14px] right-[14px] size-[38px] rounded-full" style={{ backgroundColor: "var(--hover-2)" }} />
    </div>
  );
}
