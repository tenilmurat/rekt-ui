"use client";

import { Lock } from "lucide-react";
import { BookmarkButton } from "@/components/site/BookmarkButton";
import { usePreviewState } from "@/lib/preview-state";
import type { UiBlock } from "@/lib/ui/catalog";
import { useInView } from "@/lib/use-in-view";

export const DEFAULT_CARD_HEIGHT = 380;

/**
 * One component on the wall: the live preview fills the card, the name sits in
 * a pill bottom left, save bottom right. Pressing the card opens it.
 */
export function BlockCard({ block, onOpen }: { block: UiBlock; onOpen: () => void }) {
  const { ref, active } = useInView<HTMLElement>();
  const { presetId, startedAt } = usePreviewState(block.id);
  const preset = block.presets?.find((p) => p.id === presetId) ?? block.presets?.[0];
  const Preview = block.component;

  return (
    <article
      ref={ref}
      className="group relative overflow-hidden rounded-[28px]"
      style={{ height: block.cardHeight ?? DEFAULT_CARD_HEIGHT, backgroundColor: "var(--surface)" }}
    >
      <div className="pointer-events-none flex h-full w-full items-center justify-center px-[24px]">
        <Preview key={startedAt} {...(preset?.props ?? {})} paused={!active} startedAt={startedAt} />
      </div>

      {/* The whole card opens the component; the save button sits above this layer. */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${block.title}`}
        className="absolute inset-0 rounded-[28px] focus-visible:outline-offset-[-4px]"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-[12px] p-[14px]">
        <span
          className="flex h-[38px] items-center gap-[6px] rounded-full border px-[14px] text-[12.5px]"
          style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--line-soft)", color: "var(--ink)" }}
        >
          {block.title}
          {block.tier === "pro" ? <Lock size={12} strokeWidth={2} aria-label="Pro" style={{ color: "var(--ink-3)" }} /> : null}
        </span>
        <div className="pointer-events-auto">
          <BookmarkButton kind="component" id={block.id} label={block.title} round />
        </div>
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
