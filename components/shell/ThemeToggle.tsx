"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/components/shell/magicui/animated-theme-toggler";
import { usePrefersReducedMotion } from "@/lib/create/code/animation";

/**
 * Theme toggle: Magic UI's animated toggler (a View Transitions circle reveal
 * from the button) wearing this site's button chrome — 30x30, 8px radius,
 * hairline border, .control hover.
 *
 * Controlled by next-themes, the way their docs describe it: we hand it the
 * current theme and take the change back, so it never writes to localStorage
 * and `useTheme()` stays the single source of truth.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = usePrefersReducedMotion();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <AnimatedThemeToggler
      theme={isDark ? "dark" : "light"}
      onThemeChange={(next) => setTheme(next)}
      duration={reduced ? 0 : 450}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="control relative flex size-[30px] shrink-0 items-center justify-center rounded-[8px] border active:scale-[0.96] [&>svg]:size-[16px]"
      style={{
        backgroundColor: "var(--control-bg)",
        borderColor: "var(--control-line)",
        color: "var(--icon)",
      }}
    />
  );
}
