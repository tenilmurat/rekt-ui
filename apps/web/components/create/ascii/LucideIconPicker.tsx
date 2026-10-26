"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DynamicIcon, iconNames, type IconName } from "lucide-react/dynamic";

/** How many results are drawn at once; more arrive as you narrow the search. */
const PAGE = 120;

const label = (name: string) =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

/**
 * Lucide's own icon list — no local database. `lucide-react/dynamic` gives the
 * names up front and fetches each icon's shape only when it is drawn, and the
 * grid is capped at PAGE results, so opening the picker doesn't mount 1,500
 * components.
 */
export function LucideIconPicker({
  open,
  selected,
  onCancel,
  onUse,
  names,
  title = "Choose a Lucide icon",
}: {
  open: boolean;
  selected: string | null;
  onCancel: () => void;
  onUse: (name: string) => void;
  /** Restricts the list; defaults to everything Lucide ships. */
  names?: readonly string[];
  title?: string;
}) {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<string | null>(selected);
  const [limit, setLimit] = useState(PAGE);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(selected);
    setQuery("");
    setLimit(PAGE);
    const id = window.setTimeout(() => searchRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, selected, onCancel]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = names ?? (iconNames as readonly string[]);
    if (!q) return all.slice(0, limit);
    const hits: string[] = [];
    for (const name of all) {
      if (name.includes(q)) hits.push(name);
      if (hits.length >= limit) break;
    }
    return hits;
  }, [query, limit, names]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-[24px]">
      <button
        type="button"
        aria-label="Close the icon picker"
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
        style={{ backgroundColor: "rgba(20,18,16,0.16)" }}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-pop-in relative flex max-h-full w-full max-w-[520px] flex-col gap-[16px] rounded-[16px] border p-[20px]"
        style={{
          backgroundColor: "var(--bg)",
          borderColor: "var(--line)",
          boxShadow: "var(--shadow-overlay)",
        }}
      >
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="rekt-ascii-icon-search" className="sr-only">
            Search Lucide icons
          </label>
          <input
            ref={searchRef}
            id="rekt-ascii-icon-search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Search icons..."
            className="w-full rounded-[8px] border px-[10px] py-[8px] text-[13px]"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--line)",
              color: "var(--ink)",
            }}
          />
          <p className="text-[12px]" style={{ color: "var(--ink-3)" }}>
            {results.length} of {(names ?? iconNames).length} icons
          </p>
        </div>

        <div className="no-scrollbar grid max-h-[300px] grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-[6px] overflow-y-auto">
          {results.map((name) => {
            const active = name === draft;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setDraft(name)}
                onDoubleClick={() => onUse(name)}
                aria-pressed={active}
                title={label(name)}
                className="control flex aspect-square items-center justify-center rounded-[8px] border"
                style={{
                  backgroundColor: active ? "var(--surface)" : "var(--control-bg)",
                  borderColor: active ? "var(--line-strong)" : "var(--control-line)",
                  color: "var(--ink)",
                }}
              >
                <DynamicIcon name={name as IconName} size={18} strokeWidth={1.75} />
              </button>
            );
          })}

          {results.length >= limit ? (
            <button
              type="button"
              onClick={() => setLimit((n) => n + PAGE)}
              className="control col-span-full rounded-[8px] border py-[8px] text-[12px] font-medium"
              style={{
                backgroundColor: "var(--control-bg)",
                borderColor: "var(--control-line)",
                color: "var(--ink-2)",
              }}
            >
              Show more
            </button>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-[12px]">
          <p className="truncate text-[12px]" style={{ color: "var(--ink-2)" }}>
            {draft ? label(draft) : "Nothing selected"}
          </p>

          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={onCancel}
              className="control rounded-[8px] border px-[12px] py-[7px] text-[12px] font-medium"
              style={{
                backgroundColor: "var(--control-bg)",
                borderColor: "var(--control-line)",
                color: "var(--ink-2)",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!draft}
              onClick={() => draft && onUse(draft)}
              className="control rounded-[8px] border px-[12px] py-[7px] text-[12px] font-medium disabled:opacity-40"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--line-strong)",
                color: "var(--ink)",
              }}
            >
              Use Icon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
