// @ts-check
import { fetchIndex } from "./registry.js";
import { c, spinner } from "./ui.js";

/**
 * `rektui list`: every component the registry offers, grouped by category.
 * @param {{ registry: string }} options
 */
export async function list(options) {
  const spin = spinner("Fetching the component list");
  const items = await fetchIndex(options.registry).catch((error) => {
    spin.fail("Couldn't fetch the component list");
    throw error;
  });
  spin.stop();

  if (!items.length) {
    console.log(c.dim("No components published yet."));
    return;
  }

  /** @type {Map<string, typeof items>} */
  const groups = new Map();
  for (const item of items) {
    const key = item.categories?.[0] ?? "other";
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const width = Math.max(...items.map((i) => i.name.length));

  for (const [category, group] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(c.bold(category.charAt(0).toUpperCase() + category.slice(1)));
    for (const item of group) {
      console.log(`  ${c.cyan(item.name.padEnd(width))}  ${c.dim(item.title ?? "")}`);
    }
    console.log("");
  }
  console.log(c.dim(`${items.length} component${items.length === 1 ? "" : "s"}. Add one with`), c.bold("npx rektui add <name>"));
}
