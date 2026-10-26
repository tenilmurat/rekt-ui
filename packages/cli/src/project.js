// @ts-check
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { CliError } from "./ui.js";

/**
 * Reads the project the CLI runs in: its root, where components go, how they
 * are imported, which package manager it uses and what it already has installed.
 */

/** The nearest folder at or above `from` that has a package.json. @param {string} from */
export function findRoot(from) {
  let dir = path.resolve(from);
  for (;;) {
    if (existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) throw new CliError("No package.json here or above. Run rektui inside your project.");
    dir = parent;
  }
}

/**
 * JSON with comments and trailing commas (tsconfig, components.json).
 * Returns null when the file is missing or unreadable.
 * @param {string} file
 */
export function readJsonc(file) {
  if (!existsSync(file)) return null;
  const text = readFileSync(file, "utf8");
  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      out += ch;
      if (ch === "\\") out += text[++i] ?? "";
      else if (ch === '"') inString = false;
    } else if (ch === '"') {
      inString = true;
      out += ch;
    } else if (ch === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      out += "\n";
    } else if (ch === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i++;
    } else {
      out += ch;
    }
  }
  try {
    return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
  } catch {
    return null;
  }
}

/**
 * Import aliases from tsconfig.json / jsconfig.json `paths`, e.g.
 * "@/*" → <root>/src. Longest prefix first.
 * @param {string} root
 * @returns {{ prefix: string; dir: string }[]}
 */
export function aliases(root) {
  for (const name of ["tsconfig.json", "jsconfig.json"]) {
    const config = readJsonc(path.join(root, name));
    const options = config?.compilerOptions;
    if (!options?.paths) continue;
    const base = path.resolve(root, options.baseUrl ?? ".");
    return Object.entries(options.paths)
      .filter(([key, targets]) => key.endsWith("/*") && Array.isArray(targets) && String(targets[0]).endsWith("/*"))
      .map(([key, targets]) => ({ prefix: key.slice(0, -1), dir: path.resolve(base, String(targets[0]).slice(0, -2)) }))
      .sort((a, b) => b.prefix.length - a.prefix.length);
  }
  return [];
}

/**
 * Where Rekt UI components go: --dir if given; otherwise the project's
 * components folder (from shadcn's components.json when there is one, or
 * src/components when the project uses src/), plus rekt-ui/.
 * @param {string} root
 * @param {string | undefined} flag
 */
export function componentsDir(root, flag) {
  if (flag) return path.resolve(process.cwd(), flag);

  const shadcn = readJsonc(path.join(root, "components.json"));
  const alias = shadcn?.aliases?.components;
  if (typeof alias === "string") {
    const match = aliases(root).find((a) => alias.startsWith(a.prefix));
    if (match) return path.join(match.dir, alias.slice(match.prefix.length), "rekt-ui");
  }

  const usesSrc = ["app", "components", "pages", "main.tsx", "main.jsx", "App.tsx"].some((p) =>
    existsSync(path.join(root, "src", p)),
  );
  return path.join(root, usesSrc ? "src" : "", "components", "rekt-ui");
}

/**
 * How a file is imported from inside the project: through an alias when one
 * covers it ("@/components/rekt-ui/RollingCounter"), else relative to the root.
 * @param {string} root
 * @param {string} file  absolute path without extension
 */
export function importPath(root, file) {
  const alias = aliases(root).find((a) => file.startsWith(a.dir + path.sep));
  /** @param {string} from @param {string} to */
  const rel = (from, to) => path.relative(from, to).split(path.sep).join("/");
  return alias ? alias.prefix + rel(alias.dir, file) : `./${rel(root, file)}`;
}

/**
 * The project's package manager: from its lockfile, else from how the CLI was
 * started, else npm.
 * @param {string} root
 * @returns {"npm" | "pnpm" | "yarn" | "bun"}
 */
export function packageManager(root) {
  if (existsSync(path.join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(root, "yarn.lock"))) return "yarn";
  if (existsSync(path.join(root, "bun.lock")) || existsSync(path.join(root, "bun.lockb"))) return "bun";
  if (existsSync(path.join(root, "package-lock.json"))) return "npm";
  const agent = process.env.npm_config_user_agent ?? "";
  if (agent.startsWith("pnpm")) return "pnpm";
  if (agent.startsWith("yarn")) return "yarn";
  if (agent.startsWith("bun")) return "bun";
  return "npm";
}

/**
 * Which of `deps` the project doesn't list yet. A version range like
 * "motion@^12" is checked by its name.
 * @param {string} root
 * @param {string[]} deps
 */
export function missingDependencies(root, deps) {
  const pkg = readJsonc(path.join(root, "package.json")) ?? {};
  const have = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);
  const nameOf = (/** @type {string} */ dep) => (dep.startsWith("@") ? "@" + dep.slice(1).split("@")[0] : dep.split("@")[0]);
  return deps.filter((dep) => !have.has(nameOf(dep)));
}
