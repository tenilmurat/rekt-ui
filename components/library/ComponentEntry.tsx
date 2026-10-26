"use client";

import { PreviewSurface } from "@/components/library/PreviewSurface";
import { SourceBadge } from "@/components/library/SourceBadge";
import type { ComponentItem } from "@/lib/registry/types";

/** One curated entry in the scrolling category page. */
export function ComponentEntry({
  item,
  index,
  deepLink,
  onOpenCode,
}: {
  item: ComponentItem;
  index: number;
  deepLink: string;
  onOpenCode: () => void;
}) {
  return (
    <article id={item.id} className="flex w-full scroll-mt-[148px] flex-col gap-[16px]">
      <header className="flex w-full items-start justify-between gap-[16px]">
        <div className="flex flex-col gap-[8px]">
          <h2 className="text-[13px] font-medium tracking-[-0.13px]" style={{ color: "var(--ink-title)" }}>
            {index + 1}- {item.title}
          </h2>
          <p className="text-[13px] tracking-[-0.13px]" style={{ color: "var(--ink-2)" }}>
            {item.description}
          </p>
        </div>
        <SourceBadge item={item} />
      </header>

      <PreviewSurface item={item} variant="default" deepLink={deepLink} onOpenCode={onOpenCode} />

      {item.sourceName ? (
        <p className="text-[12px]" style={{ color: "var(--ink-3)" }}>
          Source:{" "}
          {item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="link-quiet underline underline-offset-2"
              style={{ color: "var(--control-fg)" }}
            >
              {item.sourceName} ↗
            </a>
          ) : (
            item.sourceName
          )}
        </p>
      ) : null}
    </article>
  );
}
