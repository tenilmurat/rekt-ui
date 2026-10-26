"use client";

import { ArrowUpRight } from "lucide-react";
import { asset } from "@/lib/base-path";
import { BookmarkButton } from "@/components/site/BookmarkButton";
import { hostname, type GoodDesign } from "@/lib/good-designs";

/** One curated design: screenshot, name, what it is. The card opens the live site. */
export function DesignCard({ design }: { design: GoodDesign }) {
  return (
    <article className="group relative flex flex-col gap-[10px]">
      <a
        href={design.url}
        target="_blank"
        rel="noreferrer noopener"
        className="block overflow-hidden rounded-[10px] border"
        style={{ borderColor: "var(--line)", backgroundColor: "var(--surface)" }}
        aria-label={`${design.name} — open ${hostname(design.url)} in a new tab`}
      >
        {/* Screenshots live in public/good-designs, 960px wide WebP. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(design.screenshot)}
          alt=""
          loading="lazy"
          decoding="async"
          className="aspect-[16/10] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.015]"
          style={{ transitionTimingFunction: "var(--ease-out-strong)" }}
        />
      </a>

      <div className="flex items-start justify-between gap-[12px]">
        <div className="flex min-w-0 flex-col gap-[2px]">
          <h3 className="flex items-center gap-[4px] text-[13px] font-medium" style={{ color: "var(--ink-title)" }}>
            <span className="truncate">{design.name}</span>
            <ArrowUpRight size={13} strokeWidth={1.875} aria-hidden="true" style={{ color: "var(--ink-3)" }} />
          </h3>
          <p className="line-clamp-2 text-[12px]" style={{ color: "var(--ink-2)" }}>
            {design.summary}
          </p>
        </div>
        <BookmarkButton kind="design" id={design.id} label={design.name} className="shrink-0" />
      </div>
    </article>
  );
}
