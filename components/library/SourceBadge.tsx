import { asset } from "@/lib/base-path";
import type { ComponentItem } from "@/lib/registry/types";

/**
 * The round mark from the design. Shows the source's logo when one is set,
 * otherwise its initial — never someone else's logo we don't have.
 */
export function SourceBadge({ item, size = 28 }: { item: ComponentItem; size?: number }) {
  const name = item.sourceName ?? "Rekt Studio";
  const label = item.sourceUrl ? `Source: ${name} (opens in a new tab)` : `Source: ${name}`;
  const inner = item.sourceLogo ? (
    <img src={asset(item.sourceLogo)} alt="" width={size / 2} height={size / 2} />
  ) : (
    <span className="text-[11px] font-medium" style={{ color: "var(--ink-2)" }}>
      {name.charAt(0)}
    </span>
  );

  const linked = Boolean(item.sourceUrl);
  const className = [
    linked ? "control" : "",
    "flex items-center justify-center rounded-full border transition-transform active:scale-[0.96]",
  ]
    .filter(Boolean)
    .join(" ");
  const style = {
    width: size,
    height: size,
    backgroundColor: linked ? "var(--control-bg)" : "var(--surface-raised)",
    borderColor: linked ? "var(--control-line)" : "var(--line-soft)",
  } as const;

  if (!item.sourceUrl) {
    return (
      <span className={className} style={style} title={label} aria-label={label} role="img">
        {inner}
      </span>
    );
  }

  return (
    <a
      className={className}
      style={style}
      href={item.sourceUrl}
      target="_blank"
      rel="noreferrer noopener"
      title={label}
      aria-label={label}
    >
      {inner}
    </a>
  );
}
