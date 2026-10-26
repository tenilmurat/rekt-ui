"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DesignCard } from "@/components/good-designs/DesignCard";
import { DESIGN_XS, GOOD_DESIGNS } from "@/lib/good-designs";

/**
 * The X in the title is the filter: "Good designs of icon sets". `?x=` holds it,
 * so a filtered page can be shared.
 */
export function GoodDesigns() {
  const params = useSearchParams();
  const current = DESIGN_XS.find((x) => x.id === params.get("x"));
  const designs = current ? GOOD_DESIGNS.filter((d) => d.x === current.id) : GOOD_DESIGNS;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-[24px] pb-[120px] pt-[64px]">
      <header className="animate-fade-up mb-[32px] flex flex-col gap-[10px]">
        <h1 className="text-[32px] font-medium leading-[1.15] tracking-[-0.64px]" style={{ color: "var(--ink-title)" }}>
          Good designs of{" "}
          <span style={{ color: current ? "var(--ink-title)" : "var(--ink-3)" }}>{current?.label ?? "X"}</span>
        </h1>
        <p className="max-w-[520px] text-[14px]" style={{ color: "var(--ink-2)" }}>
          Real work worth studying, picked one by one. Choose an X, open the live site, save the ones you want to come back to.
        </p>
      </header>

      <nav aria-label="Pick an X" className="no-scrollbar -mx-[24px] mb-[28px] flex gap-[6px] overflow-x-auto px-[24px]">
        <Chip href="/good-designs" label="Everything" count={GOOD_DESIGNS.length} active={!current} />
        {DESIGN_XS.map((x) => (
          <Chip
            key={x.id}
            href={`/good-designs?x=${x.id}`}
            label={x.label}
            count={GOOD_DESIGNS.filter((d) => d.x === x.id).length}
            active={current?.id === x.id}
          />
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-x-[20px] gap-y-[32px] sm:grid-cols-2 lg:grid-cols-3">
        {designs.map((design) => (
          <DesignCard key={design.id} design={design} />
        ))}
      </div>
    </main>
  );
}

function Chip({ href, label, count, active }: { href: string; label: string; count: number; active: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className="control-chip flex shrink-0 items-center gap-[6px] rounded-full px-[12px] py-[6px] text-[13px]"
      style={{
        backgroundColor: active ? "var(--ink)" : "var(--control-bg)",
        color: active ? "var(--bg)" : "var(--control-fg)",
      }}
    >
      {label.charAt(0).toUpperCase() + label.slice(1)}
      <span className="text-[12px] tabular-nums" style={{ opacity: 0.6 }}>
        {count}
      </span>
    </Link>
  );
}
