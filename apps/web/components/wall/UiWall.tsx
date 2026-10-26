"use client";

import Link from "next/link";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BlockCard, DEFAULT_CARD_HEIGHT, GhostCard } from "@/components/wall/BlockCard";
import { BlockDialog } from "@/components/wall/BlockDialog";
import { FilterChips } from "@/components/wall/FilterChips";
import { Masonry } from "@/components/wall/Masonry";
import { PageHero } from "@/components/wall/PageHero";
import { BRAND } from "@/lib/brand";
import { useSession } from "@/lib/session";
import { BLOCKS, UI_CATEGORIES, getBlock } from "@/lib/ui/catalog";

/** Heights of the stand-in cards on an empty wall — uneven, like real ones. */
const GHOST_HEIGHTS = [404, 300, 404, 334, 344, 346, 300, 380, 330];

/**
 * The UI section: hero, category chips, the wall of live components, and a Pro
 * band. `?category=` filters, `?c=` opens a component over the wall.
 */
export function UiWall() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { status, plan, openSignIn } = useSession();

  const category = UI_CATEGORIES.find((c) => c.id === params.get("category"))?.id ?? null;
  const open = getBlock(params.get("c") ?? "");
  const blocks = category ? BLOCKS.filter((b) => b.category === category) : BLOCKS;
  const proCount = BLOCKS.filter((b) => b.tier === "pro").length;

  const withParams = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const query = next.toString();
      return `${pathname}${query ? `?${query}` : ""}`;
    },
    [params, pathname],
  );

  const close = useCallback(() => router.replace(withParams({ c: null }), { scroll: false }), [router, withParams]);

  return (
    <main className="pb-[96px]">
      <PageHero
        pill={BLOCKS.length ? `${BLOCKS.length} component${BLOCKS.length === 1 ? "" : "s"}` : "New components on the way"}
        title={BRAND.tagline.replace(/!$/, "")}
        lead="Live, tunable interface components and micro-interactions. Explore them, then take them straight into your projects."
        action={
          status === "signed-in" ? null : (
            <button
              type="button"
              onClick={() => openSignIn()}
              disabled={status === "loading"}
              className="h-[40px] rounded-full px-[20px] text-[15px] font-medium transition-transform active:scale-[0.97]"
              style={{ backgroundColor: "var(--ink)", color: "var(--bg)" }}
            >
              Join for free
            </button>
          )
        }
      />

      <FilterChips
        label="Component categories"
        chips={UI_CATEGORIES}
        activeId={category}
        hrefFor={(id) => withParams({ category: id, c: null })}
      />

      <div className="px-[20px]">
        {blocks.length ? (
          <Masonry
            items={blocks}
            height={(b) => b.cardHeight ?? DEFAULT_CARD_HEIGHT}
            getKey={(b) => b.id}
            render={(b) => (
              <BlockCard block={b} onOpen={() => router.replace(withParams({ c: b.id }), { scroll: false })} />
            )}
          />
        ) : (
          <div className="relative">
            <div
              className="pointer-events-none"
              style={{
                maskImage: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.15) 85%)",
                WebkitMaskImage: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.15) 85%)",
              }}
            >
              <Masonry items={GHOST_HEIGHTS.map((h, i) => ({ h, i }))} height={(g) => g.h} getKey={(g) => String(g.i)} render={(g) => <GhostCard height={g.h} />} />
            </div>
            <div className="absolute inset-x-0 top-[120px] flex justify-center px-[20px]">
              <p
                role="status"
                className="rounded-full border px-[16px] py-[10px] text-center text-[13px]"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--line)", color: "var(--ink-2)", boxShadow: "var(--shadow-overlay)" }}
              >
                {category
                  ? `Nothing in ${UI_CATEGORIES.find((c) => c.id === category)?.label} yet.`
                  : "The first components are being made. Check back soon."}
              </p>
            </div>
          </div>
        )}
      </div>

      {plan === "free" ? (
        <section className="mx-[20px] mt-[48px] flex flex-col items-center gap-[12px] rounded-[28px] px-[24px] py-[48px] text-center" style={{ backgroundColor: "var(--surface)" }}>
          <h2 className="text-[24px] font-medium tracking-[-0.36px]" style={{ color: "var(--ink-title)" }}>
            {proCount ? `Unlock ${proCount} Pro components` : "Everything, with Pro"}
          </h2>
          <p className="max-w-[440px] text-[14px]" style={{ color: "var(--ink-2)" }}>
            The full source of every component, and everything added while your plan is active.
          </p>
          <Link
            href="/pricing"
            className="mt-[8px] flex h-[40px] items-center rounded-full px-[20px] text-[14px] font-medium transition-transform active:scale-[0.97]"
            style={{ backgroundColor: "var(--ink)", color: "var(--bg)" }}
          >
            Get Pro
          </Link>
        </section>
      ) : null}

      {open ? <BlockDialog key={open.id} block={open} onClose={close} /> : null}
    </main>
  );
}
