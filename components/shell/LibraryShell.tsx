"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/shell/Sidebar";
import { ComponentEntry } from "@/components/library/ComponentEntry";
import { PreviewSurface } from "@/components/library/PreviewSurface";
import { CodeDetails } from "@/components/library/CodeDetails";
import { pageUrl } from "@/lib/base-path";
import type { ComponentCategory, ComponentItem } from "@/lib/registry/types";

/**
 * Owns both display states for a category:
 *  - Default View: the scrolling list of entries
 *  - Full View  : one entry on a large canvas (?full=<itemId>)
 * Both render the same PreviewSurface, and preset/timer state lives in
 * PreviewStateProvider above this component, so switching preserves it.
 */
export function LibraryShell({ category }: { category: ComponentCategory }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullId = searchParams.get("full");

  const [codeItem, setCodeItem] = useState<ComponentItem | null>(null);
  const [focusedId, setFocusedId] = useState<string | undefined>(category.items[0]?.id);
  const listRef = useRef<HTMLDivElement | null>(null);

  const fullItem = useMemo(
    () => category.items.find((item) => item.id === fullId) ?? null,
    [category.items, fullId],
  );

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const linkFor = useCallback(
    (item: ComponentItem, full: boolean) =>
      full
        ? pageUrl(origin, pathname, `?full=${item.id}`)
        : pageUrl(origin, pathname, `#${item.id}`),
    [origin, pathname],
  );

  const openFull = useCallback(
    (itemId?: string) => {
      const target = itemId ?? focusedId ?? category.items[0]?.id;
      if (!target) return;
      router.replace(`${pathname}?full=${target}`, { scroll: false });
    },
    [category.items, focusedId, pathname, router],
  );

  const exitFull = useCallback(() => {
    const returning = fullId;
    router.replace(pathname, { scroll: false });
    window.requestAnimationFrame(() => {
      if (!returning) return;
      document.getElementById(returning)?.scrollIntoView({ block: "start", behavior: "auto" });
    });
  }, [fullId, pathname, router]);

  // Esc leaves Full View
  useEffect(() => {
    if (!fullItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !codeItem) exitFull();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [fullItem, codeItem, exitFull]);

  // remember which entry is in view, so the sidebar's Full View button expands that one
  useEffect(() => {
    if (fullItem || !listRef.current) return;
    const entries = Array.from(listRef.current.querySelectorAll<HTMLElement>("article[id]"));
    if (!entries.length) return;
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setFocusedId(visible.target.id);
      },
      { threshold: [0.3, 0.6] },
    );
    entries.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [fullItem, category.id]);

  const isCreate = category.group === "create";

  return (
    <div
      className={
        fullItem
          ? "mx-auto flex h-[calc(100dvh-56px)] w-full overflow-hidden"
          : "mx-auto flex min-h-[calc(100dvh-56px)] w-full items-start"
      }
      style={{ maxWidth: fullItem ? "none" : 912 }}
    >
      <Sidebar
        compact={Boolean(fullItem)}
        onToggleFull={() => (fullItem ? exitFull() : openFull())}
        fullViewDisabled={category.items.length === 0}
      />

      {fullItem ? (
        <main className="flex min-w-0 flex-1 items-center justify-center pr-[16px] py-[16px]">
          <div className="h-full w-full">
            <PreviewSurface
              item={fullItem}
              variant="full"
              deepLink={linkFor(fullItem, true)}
              onOpenCode={() => setCodeItem(fullItem)}
            />
          </div>
        </main>
      ) : (
        <main className="relative min-w-0 flex-1">
          <div
            ref={listRef}
            className="flex flex-col gap-[32px] pb-[160px] pt-[92px]"
            style={{ width: "var(--entry-width)", maxWidth: "calc(100% - 80px)", marginLeft: 80 }}
          >
            {category.items.length === 0 ? (
              <div className="flex flex-col gap-[8px]">
                <h2 className="text-[13px] font-medium" style={{ color: "var(--ink-title)" }}>
                  {category.name}
                </h2>
                <p className="text-[13px]" style={{ color: "var(--ink-2)" }}>
                  {category.summary}
                </p>
                <p className="mt-[12px] text-[12px]" style={{ color: "var(--ink-3)" }}>
                  {isCreate
                    ? "This tool is not built yet — the route and navigation are ready."
                    : "No components in this category yet. They are added in lib/registry."}
                </p>
              </div>
            ) : (
              category.items.map((item, index) => (
                <ComponentEntry
                  key={item.id}
                  item={item}
                  index={index}
                  deepLink={linkFor(item, false)}
                  onOpenCode={() => setCodeItem(item)}
                />
              ))
            )}
          </div>

          {/* bottom fade from the design */}
          <div
            aria-hidden="true"
            className="pointer-events-none sticky bottom-0 h-[109px] w-full"
            style={{
              backdropFilter: "blur(2px)",
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 15%, var(--bg) 76%)",
            }}
          />
        </main>
      )}

      <CodeDetails item={codeItem} open={Boolean(codeItem)} onClose={() => setCodeItem(null)} />
    </div>
  );
}
