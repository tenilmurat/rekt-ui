import { BRAND } from "@/lib/brand";

/**
 * Text marks until Rekt UI has a drawn logo: swap these two for the artwork
 * and every place that shows the brand follows.
 */
export function Wordmark({ size = 15 }: { size?: number }) {
  return (
    <span className="font-semibold tracking-[-0.02em]" style={{ fontSize: size, color: "var(--ink-title)" }}>
      {BRAND.name}
    </span>
  );
}

/** The small square mark, for badges and the sign-in dialog. */
export function Monogram({ size = 28 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-[28%] font-semibold tracking-[-0.04em]"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        backgroundColor: "var(--ink)",
        color: "var(--bg)",
      }}
    >
      UI
    </span>
  );
}
