import { createElement, type ComponentType } from "react";
import { useTheme } from "next-themes";
import type { ControlValues, UiBlock } from "@/lib/ui/types";
import { ThemeToggler, type ThemeTogglerProps } from "./ThemeToggler";
import { themeTogglerMeta } from "./meta";
import "./ThemeToggler.css";

/** On this site next-themes owns the theme, so the toggler hands each change to it rather than saving it itself. */
function SiteThemeToggler(props: ThemeTogglerProps) {
  const { setTheme } = useTheme();
  return createElement(ThemeToggler, { ...props, onThemeChange: setTheme });
}

export const themeToggler: UiBlock = {
  ...themeTogglerMeta,
  component: SiteThemeToggler as ComponentType<ControlValues>,
};
