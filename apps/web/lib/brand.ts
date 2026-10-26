/**
 * Rekt UI is its own product. Its name lives here so titles, the header and
 * attribution all say the same thing.
 */
export const BRAND = {
  name: "Rekt UI",
  tagline: "All UI components in one!",
  description: "A curated library of interface and motion components, with Pro source for your own projects.",
};

/** Page title in the form "Pricing — Rekt UI". */
export const pageTitle = (page?: string) => (page ? `${page} — ${BRAND.name}` : BRAND.name);
