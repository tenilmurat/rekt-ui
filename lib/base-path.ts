/** Where this app is mounted; set from next.config.ts. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * A file in public/. Next prefixes routes and its own assets with basePath, but
 * not string paths in styles or `src` attributes — those come through here.
 */
export const asset = (path: string) => `${BASE_PATH}${path}`;

/** An absolute link to a page, for the deep links the Copy button hands out. */
export const pageUrl = (origin: string, pathname: string, query = "") =>
  `${origin}${BASE_PATH}${pathname}${query}`;
