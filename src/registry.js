// @ts-check
import { CliError } from "./ui.js";
import { VERSION } from "./version.js";

/**
 * Talks to the Rekt UI registry: /r/<name>.json for one component and
 * /r/registry.json for the list. The format is shadcn's registry format, so the
 * website, this CLI and `npx shadcn add` all read the same files.
 *
 * @typedef {{ path: string; type: string; target?: string; content: string }} RegistryFile
 * @typedef {{ name: string; title?: string; description?: string; dependencies?: string[]; categories?: string[]; files: RegistryFile[] }} RegistryItem
 * @typedef {{ name: string; title?: string; description?: string; categories?: string[] }} IndexItem
 */

/**
 * Where components come from: --registry, then REKTUI_REGISTRY, then the
 * published default. Set DEFAULT_REGISTRY to the site's address before publishing.
 */
export const DEFAULT_REGISTRY = "";

/** @param {string | undefined} flag */
export function registryUrl(flag) {
  const url = (flag || process.env.REKTUI_REGISTRY || DEFAULT_REGISTRY).replace(/\/$/, "");
  if (!url) {
    throw new CliError("No registry address set. Pass --registry <url> or set REKTUI_REGISTRY.");
  }
  if (!/^https?:\/\//.test(url)) throw new CliError(`The registry address must start with http:// or https:// (got "${url}").`);
  return url;
}

/**
 * @param {string} url
 * @param {string} what  how to name the thing in an error, e.g. `"rolling-counter"`
 */
async function getJson(url, what) {
  const token = process.env.REKTUI_TOKEN;
  /** @type {Response} */
  let res;
  try {
    res = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": `rektui-cli/${VERSION}`,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new CliError(`Couldn't reach ${new URL(url).host}. Check your connection and try again.`);
  }
  if (res.status === 404) throw new CliError(`There's no component called ${what}. Run \`rektui list\` to see them all.`);
  if (res.status === 401 || res.status === 403) {
    throw new CliError(`${what} is a Pro component. Set REKTUI_TOKEN to your Rekt UI key to install it.`);
  }
  if (!res.ok) throw new CliError(`The registry answered ${res.status} for ${what}. Try again in a moment.`);
  try {
    return await res.json();
  } catch {
    throw new CliError(`The registry sent something that isn't JSON for ${what}.`);
  }
}

/**
 * @param {string} registry
 * @param {string} name
 * @returns {Promise<RegistryItem>}
 */
export async function fetchItem(registry, name) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new CliError(`"${name}" isn't a component name. Names look like rolling-counter.`);
  }
  const item = await getJson(`${registry}/r/${name}.json`, `"${name}"`);
  const valid =
    item && typeof item.name === "string" && Array.isArray(item.files) &&
    item.files.every((/** @type {any} */ f) => typeof f?.path === "string" && typeof f?.content === "string");
  if (!valid) throw new CliError(`"${name}" came back in a shape this CLI doesn't understand. Update with \`npx rektui@latest\`.`);
  return item;
}

/**
 * @param {string} registry
 * @returns {Promise<IndexItem[]>}
 */
export async function fetchIndex(registry) {
  const index = await getJson(`${registry}/r/registry.json`, "the component list");
  return Array.isArray(index?.items) ? index.items : [];
}
