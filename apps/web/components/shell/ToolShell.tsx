"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Monogram } from "@/components/site/Brand";
import { Sidebar } from "@/components/shell/Sidebar";
import type { ToolEntry } from "@/lib/registry/tools";

/** The Rekt UI mark, where a curated component carries its source badge. */
function RektBadge({ size = 28 }: { size?: number }) {
  return (
    <span role="img" aria-label="Made by Rekt UI" title="Rekt UI" className="flex shrink-0">
      <Monogram size={size} />
    </span>
  );
}

/**
 * Page frame for a Rekt UI tool, with the same two display states as a component
 * category: the default 912 grid, and a Full View (?full=1) that fills the
 * screen. The tool is told which one it is in through `expanded`.
 */
export function ToolShell({ tool }: { tool: ToolEntry }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const full = searchParams.get("full") === "1";
  const Tool = tool.component;

  const exitFull = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const toggleFull = useCallback(() => {
    if (full) exitFull();
    else router.replace(`${pathname}?full=1`, { scroll: false });
  }, [exitFull, full, pathname, router]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitFull();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [full, exitFull]);

  if (full) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-56px)] w-full overflow-hidden">
        <Sidebar compact onToggleFull={toggleFull} />
        <main className="flex min-w-0 flex-1 py-[16px] pr-[16px]">
          <Tool expanded />
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-56px)] w-full items-start" style={{ maxWidth: 912 }}>
      <Sidebar onToggleFull={toggleFull} />

      <main className="relative min-w-0 flex-1">
        <div
          className="flex flex-col gap-[16px] pb-[160px] pt-[92px]"
          style={{ width: "var(--entry-width)", maxWidth: "calc(100% - 80px)", marginLeft: 80 }}
        >
          <header className="flex w-full items-start justify-between gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <h1
                className="text-[13px] font-medium tracking-[-0.13px]"
                style={{ color: "var(--ink-title)" }}
              >
                {tool.title}
              </h1>
              <p className="text-[13px] tracking-[-0.13px]" style={{ color: "var(--ink-2)" }}>
                {tool.description}
              </p>
            </div>
            <RektBadge />
          </header>

          <Tool />
        </div>
      </main>
    </div>
  );
}

export { RektBadge };
