"use client";

import { useSearchParams } from "next/navigation";
import { DesignCard } from "@/components/good-designs/DesignCard";
import { FilterChips } from "@/components/wall/FilterChips";
import { Masonry } from "@/components/wall/Masonry";
import { PageHero } from "@/components/wall/PageHero";
import { DESIGN_XS, GOOD_DESIGNS } from "@/lib/good-designs";

const sentence = (label: string) => label.charAt(0).toUpperCase() + label.slice(1);

/**
 * The gallery, Discover. A chosen filter joins the title — "Discover icon sets" —
 * and `?x=` holds it, so a filtered page can be shared.
 */
export function GoodDesigns() {
  const params = useSearchParams();
  const current = DESIGN_XS.find((x) => x.id === params.get("x"));
  const designs = current ? GOOD_DESIGNS.filter((d) => d.x === current.id) : GOOD_DESIGNS;

  return (
    <main className="pb-[96px]">
      <PageHero
        title={
          <>
            Discover{current ? <span style={{ color: "var(--ink-3)" }}> {current.label}</span> : null}
          </>
        }
        lead="Real interfaces and details worth studying, picked one by one. Pick a kind, open the live site, save the ones you want to come back to."
      />

      <FilterChips
        label="Kinds of design"
        chips={DESIGN_XS.map((x) => ({
          id: x.id,
          label: sentence(x.label),
          count: GOOD_DESIGNS.filter((d) => d.x === x.id).length,
        }))}
        activeId={current?.id ?? null}
        hrefFor={(id) => (id ? `/good-designs?x=${id}` : "/good-designs")}
      />

      <div className="px-[20px]">
        {designs.length ? (
          <Masonry items={designs} height={() => 1} getKey={(d) => d.id} render={(d) => <DesignCard design={d} />} />
        ) : (
          <p role="status" className="py-[80px] text-center text-[14px]" style={{ color: "var(--ink-2)" }}>
            No designs here yet.
          </p>
        )}
      </div>
    </main>
  );
}
