import data from "@/data/good-designs.json";

/**
 * "Good designs of X": curated real-world work, grouped by what it is a good
 * design of. Add an X here and entries in data/good-designs.json that use its
 * id; screenshots go in public/good-designs as 960px-wide WebP.
 */
export type GoodDesign = {
  id: string;
  name: string;
  summary: string;
  url: string;
  /** Which X this is a good design of — an id from DESIGN_XS. */
  x: string;
  /** Path under public/, e.g. "/good-designs/linear.webp". */
  screenshot: string;
  creator: string | null;
};

export const DESIGN_XS = [
  { id: "component-libraries", label: "component libraries" },
  { id: "generative-sites", label: "generative sites" },
  { id: "creative-tools", label: "creative tools" },
  { id: "icon-sets", label: "icon sets" },
  { id: "collections", label: "collections" },
  { id: "type-sites", label: "type sites" },
] as const;

export const GOOD_DESIGNS = data as GoodDesign[];

export const getDesign = (id: string) => GOOD_DESIGNS.find((d) => d.id === id);

export const hostname = (url: string) => new URL(url).hostname.replace(/^www\./, "");
