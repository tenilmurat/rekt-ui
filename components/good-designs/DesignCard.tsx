"use client";

import { ArrowUpRight } from "lucide-react";
import { BookmarkButton } from "@/components/site/BookmarkButton";
import { asset } from "@/lib/base-path";
import { hostname, type GoodDesign } from "@/lib/good-designs";

/**
 * One curated design as a gallery tile: the screenshot fills it, the name sits
 * in a pill bottom left, save bottom right. The tile opens the live site.
 */
export function DesignCard({ design }: { design: GoodDesign }) {
  return (
    <article className="group relative overflow-hidden rounded-[28px]" style={{ backgroundColor: "var(--surface)" }}>
      {/* Screenshots live in public/good-designs, 960px-wide WebP. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(design.screenshot)}
        alt=""
        loading="lazy"
        decoding="async"
        className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
        style={{ transitionTimingFunction: "var(--ease-out-strong)" }}
      />

      <a
        href={design.url}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`${design.name}: ${design.summary} — opens ${hostname(design.url)} in a new tab`}
        className="absolute inset-0 rounded-[28px] focus-visible:outline-offset-[-4px]"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-[12px] p-[14px]">
        <span
          className="flex h-[38px] min-w-0 items-center gap-[4px] rounded-full border px-[14px] text-[12.5px]"
          style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--line-soft)", color: "var(--ink)" }}
        >
          <span className="truncate">{design.name}</span>
          <ArrowUpRight size={13} strokeWidth={1.875} aria-hidden="true" className="shrink-0" style={{ color: "var(--ink-3)" }} />
        </span>
        <div className="pointer-events-auto">
          <BookmarkButton kind="design" id={design.id} label={design.name} round />
        </div>
      </div>
    </article>
  );
}
