import { asset } from "@/lib/base-path";

/**
 * Icons are the SVGs exported from Figma in /public/icons (AGENTS.md).
 * They are drawn as CSS masks so the glyph takes the current token colour and
 * works in both themes without editing the files.
 */
export type IconName =
  | "copy"
  | "code"
  | "info"
  | "maximize"
  | "minimize"
  | "website"
  | "collapse"
  | "sun"
  | "moon"
  | "logo";

export function Icon({
  name,
  size = 16,
  className,
  color = "var(--icon)",
}: {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flex: "none",
        backgroundColor: color,
        maskImage: `url(${asset(`/icons/${name}.svg`)})`,
        WebkitMaskImage: `url(${asset(`/icons/${name}.svg`)})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
