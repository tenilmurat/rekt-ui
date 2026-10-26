"use client";

import type { ButtonHTMLAttributes } from "react";

/**
 * Small button used by the curated components (ghost / accent, sm).
 * Written for this app to satisfy the import in Beautiful UI's Approval Card;
 * it is not their implementation.
 */
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ghost" | "accent" | "surface";
  size?: "sm" | "md";
};

export function Button({ variant = "surface", size = "sm", className = "", ...props }: Props) {
  const sizing = size === "sm" ? "h-7 px-3 text-[12.5px]" : "h-9 px-4 text-[13px]";
  const tone =
    variant === "accent"
      ? "bg-accent text-white hover:brightness-[1.05]"
      : variant === "ghost"
        ? "bg-inset text-ink hover:bg-hover"
        : "bg-surface text-ink shadow-btn hover:bg-hover";

  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium transition-[background-color,transform,filter] duration-150 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 ${sizing} ${tone} ${className}`}
      style={{ transitionTimingFunction: "var(--ease-out-strong)" }}
      {...props}
    />
  );
}

export default Button;
