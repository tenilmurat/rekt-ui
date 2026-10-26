"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/shell/Icon";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { tools } from "@/lib/registry/tools";

/**
 * Everything the sidebar needs to draw a row. `fullParam` is what `?full=`
 * takes for that row — an item id for a category, "1" for a tool — so Full View
 * survives a jump between the two.
 */
type NavItem = { id: string; name: string; fullParam?: string };

function NavGroup({
  label,
  items,
  basePath,
  activePath,
  keepFullView,
}: {
  label: string;
  items: NavItem[];
  basePath: string;
  /** The whole path, not just the id: a component category and a tool can share one. */
  activePath: string;
  /** In Full View, links open the next category in Full View too. */
  keepFullView?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-[16px]">
      <p className="text-[13px] tracking-[-0.026px]" style={{ color: "var(--ink-3)" }}>
        {label}
      </p>
      <ul className="flex w-full flex-col gap-[6px]">
        {items.map((category) => {
          const path = `${basePath}/${category.id}`;
          const active = activePath === path;
          const href = keepFullView && category.fullParam ? `${path}?full=${category.fullParam}` : path;
          return (
            <li key={category.id} className="w-full">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="control-quiet flex w-full items-center rounded-[6px] px-[8px] py-[6px] text-[13px] tracking-[-0.026px]"
                style={{
                  backgroundColor: active ? "var(--surface)" : "var(--control-bg)",
                  color: active ? "var(--ink)" : "var(--control-fg)",
                }}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Sidebar({
  compact = false,
  onToggleFull,
  fullViewDisabled,
}: {
  compact?: boolean;
  onToggleFull?: () => void;
  fullViewDisabled?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-[56px] flex h-[calc(100dvh-56px)] shrink-0 flex-col self-start"
      style={{
        // Figma: default frame 912 = 40 + 230 + 80 + 562; full frame 1440 = 354 + 1086
        width: compact ? 354 : 270,
        paddingLeft: compact ? 48 : 40,
        // 56px header + 32 keeps the title where the Figma frame has it (88)
        paddingTop: 32,
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-[32px]" style={{ width: "var(--sidebar-width)" }}>
        <div className="flex flex-col gap-[20px]">
          {compact ? null : (
            <div className="flex flex-col gap-[8px]">
              <h1
                className="text-[24px] font-medium leading-tight tracking-[-0.24px]"
                style={{ color: "var(--ink-title)", width: 213 }}
              >
                All UI components in one!
              </h1>
              <p className="text-[12px] tracking-[-0.12px]" style={{ color: "var(--ink-3)" }}>
                by Rekt UI
              </p>
            </div>
          )}

          <div className="flex items-start gap-[8px]">
            <ThemeToggle />
            {/* One button for both directions: maximize in the list, minimize in Full View. */}
            <button
              type="button"
              onClick={onToggleFull}
              disabled={fullViewDisabled}
              aria-label={compact ? "Exit full view" : "Open full view"}
              title={compact ? "Exit full view" : "Full view"}
              className="control flex items-center rounded-[8px] border p-[6px] active:scale-[0.96] disabled:opacity-40"
              style={{
                backgroundColor: "var(--control-bg)",
                borderColor: "var(--control-line)",
              }}
            >
              <Icon name={compact ? "minimize" : "maximize"} />
            </button>
          </div>
        </div>

        <div className="h-px w-full" style={{ backgroundColor: "var(--line)" }} />

        {/* The list scrolls on its own, without drawing a scrollbar, and the last
            rows pass under a blur at the bottom edge — as in the design. */}
        <div className="relative min-h-0 flex-1">
          <nav
            aria-label="Library"
            className="no-scrollbar flex h-full flex-col gap-[32px] overflow-y-auto pb-[56px]"
          >
            <NavGroup
              label="Tools"
              items={tools.map((t) => ({ id: t.id, name: t.name, fullParam: "1" }))}
              basePath="/create"
              activePath={pathname}
              keepFullView={compact}
            />
          </nav>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[72px]"
            style={{
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000 65%)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000 65%)",
              background: "linear-gradient(to bottom, rgba(0,0,0,0) 10%, var(--bg) 85%)",
            }}
          />
        </div>
      </div>

      <div className="pb-[40px]" />
    </aside>
  );
}
