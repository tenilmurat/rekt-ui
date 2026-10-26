import Link from "next/link";

/**
 * The row of pill filters under a hero. Each chip is a link, so a filtered wall
 * can be shared; pressing the active chip again clears the filter.
 */
export function FilterChips({
  label,
  chips,
  activeId,
  hrefFor,
}: {
  label: string;
  chips: { id: string; label: string; count?: number }[];
  activeId: string | null;
  hrefFor: (id: string | null) => string;
}) {
  return (
    <nav aria-label={label} className="no-scrollbar flex gap-[6px] overflow-x-auto px-[20px] pb-[18px]">
      {chips.map((chip) => {
        const active = chip.id === activeId;
        return (
          <Link
            key={chip.id}
            href={hrefFor(active ? null : chip.id)}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className="control-chip flex h-[32px] shrink-0 items-center gap-[6px] rounded-full px-[14px] text-[14px]"
            style={{
              backgroundColor: active ? "var(--ink)" : "var(--control-bg)",
              color: active ? "var(--bg)" : "var(--control-fg)",
            }}
          >
            {chip.label}
            {chip.count !== undefined ? (
              <span className="text-[12px] tabular-nums" style={{ opacity: 0.6 }}>
                {chip.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
