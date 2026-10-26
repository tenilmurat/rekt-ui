import type { ComponentType } from "react";
import { RektAscii } from "@/components/create/ascii/RektAscii";
import { RektIcon } from "@/components/create/icon/RektIcon";
import { RektImageRatio } from "@/components/create/ratio/RektImageRatio";
import { RektCode } from "@/components/create/code/RektCode";

/**
 * Rekt's own tools — the second sidebar group. Like the component registry this
 * is curated in code: add an entry and the route, the nav row and the page
 * appear. Nothing here is listed until it is built.
 *
 * Planned, not built yet: text animation, loader builder, background generator.
 */
export type ToolEntry = {
  id: string;
  /** Sidebar label. */
  name: string;
  /** Heading on the page itself. */
  title: string;
  description: string;
  component: ComponentType<{ expanded?: boolean }>;
};

export const tools: ToolEntry[] = [
  {
    id: "code-block",
    name: "Code Block",
    title: "Code Block",
    description: "Animate a snippet, tune it, copy the component.",
    component: RektCode,
  },
  {
    id: "ascii",
    name: "ASCII",
    title: "ASCII",
    description: "Turn a logo or image into ASCII, then copy or download it.",
    component: RektAscii,
  },
  {
    id: "icon",
    name: "Icon",
    title: "Icon",
    description: "Animated icons from Animate UI — their own motion, or sketched on.",
    component: RektIcon,
  },
  {
    id: "image-ratio",
    name: "Image Ratio",
    title: "Image Ratio",
    description: "Crop an image to a ratio, then copy or download it.",
    component: RektImageRatio,
  },
];

export const getTool = (id: string) => tools.find((t) => t.id === id);
