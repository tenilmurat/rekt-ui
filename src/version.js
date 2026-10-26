// @ts-check
import { readFileSync } from "node:fs";

/** The CLI's own version, read from its package.json. */
export const VERSION = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
