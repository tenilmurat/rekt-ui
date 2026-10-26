"use client";

import { useInView } from "@/lib/use-in-view";
import { usePreviewState } from "@/lib/preview-state";
import { PresetBar } from "@/components/library/PresetBar";
import { PreviewActions } from "@/components/library/PreviewActions";
import { SourceBadge } from "@/components/library/SourceBadge";
import type { ComponentItem } from "@/lib/registry/types";

/**
 * The grey canvas card from both frames. `variant="default"` is the 360px card
 * in the scrolling list; `variant="full"` fills the viewport and carries the
 * source mark, title and description inside the card.
 */
export function PreviewSurface({
  item,
  variant,
  deepLink,
  onOpenCode,
}: {
  item: ComponentItem;
  variant: "default" | "full";
  deepLink: string;
  onOpenCode: () => void;
}) {
  const { ref, active } = useInView<HTMLDivElement>();
  const { presetId, startedAt, setPreset, restart } = usePreviewState(item.id);

  const presets = item.presets ?? [];
  const currentPreset = presets.find((p) => p.id === presetId) ?? presets[0];
  const Preview = item.component;
  const full = variant === "full";
  // "bare" is a list-view treatment: a component that carries its own frame
  // doesn't get a card around it there. Full View keeps the standard canvas —
  // badge, title and presets belong on it — and the component drops its own
  // frame instead, so there is still only ever one.
  const bare = item.surface === "bare" && !full;
  if (bare) {
    return (
      <div ref={ref} className={`flex w-full flex-col gap-[12px] ${full ? "h-full justify-center" : ""}`}>
        <div className="flex items-center justify-end gap-[8px]">
          {full ? <SourceBadge item={item} size={30} /> : null}
          <PreviewActions
            item={item}
            deepLink={deepLink}
            onOpenCode={onOpenCode}
            onReplay={item.replay ? restart : undefined}
          />
        </div>

        <div className="flex w-full justify-center">
          <Preview
            key={startedAt}
            {...(currentPreset?.props ?? {})}
            paused={!active}
            startedAt={startedAt}
            expanded={full}
          />
        </div>

        {presets.length ? (
          <div className="flex justify-center">
            <PresetBar
              presets={presets}
              activeId={currentPreset?.id ?? ""}
              onSelect={setPreset}
              label={item.title}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-[16px] border"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--line)",
        height: full ? "100%" : 360,
      }}
    >
      {full ? (
        <div className="absolute left-[23px] top-[69px] flex flex-col gap-[8px]">
          <p className="text-[13px] font-medium tracking-[-0.13px]" style={{ color: "var(--ink-title)" }}>
            {item.title}
          </p>
          <p className="text-[13px] tracking-[-0.13px]" style={{ color: "var(--ink-2)" }}>
            {item.description}
          </p>
        </div>
      ) : null}

      {/* Full View carries the source mark where the design puts it: top left of
          the canvas. Leaving Full View is the sidebar button (and Escape). */}
      {full ? (
        <div className="absolute left-[23px] top-[19px]">
          <SourceBadge item={item} size={30} />
        </div>
      ) : null}

      <div className="absolute right-[19px] top-[19px] z-10">
        <PreviewActions
          item={item}
          deepLink={deepLink}
          onOpenCode={onOpenCode}
          onReplay={item.replay ? restart : undefined}
        />
      </div>

      <div className="flex h-full w-full items-center justify-center px-[24px]">
        {/* keyed on the start time: replaying gives a fresh mount, so a one-shot
            animation plays from the beginning */}
        <Preview
          key={startedAt}
          {...(currentPreset?.props ?? {})}
          paused={!active}
          startedAt={startedAt}
          expanded={full}
        />
      </div>

      {presets.length ? (
        <div className="absolute bottom-[16px] left-1/2 flex max-w-[calc(100%-32px)] -translate-x-1/2 justify-center">
          <PresetBar
            presets={presets}
            activeId={currentPreset?.id ?? ""}
            onSelect={setPreset}
            label={item.title}
          />
        </div>
      ) : null}
    </div>
  );
}
