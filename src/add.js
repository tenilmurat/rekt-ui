// @ts-check
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fetchItem } from "./registry.js";
import { componentsDir, findRoot, importPath, missingDependencies, packageManager } from "./project.js";
import { CliError, c, confirm, mark, spinner } from "./ui.js";

/**
 * `rektui add <names…>`: fetch each component from the registry, write its
 * files into the project's components/rekt-ui/, install what it depends on,
 * and print how to use it.
 *
 * @param {string[]} names
 * @param {{ registry: string; dir?: string; overwrite: boolean; yes: boolean; dryRun: boolean; install: boolean }} options
 */
export async function add(names, options) {
  if (!names.length) throw new CliError("Name a component, e.g. `npx rektui add rolling-counter`.");

  const root = findRoot(process.cwd());
  const dir = componentsDir(root, options.dir);
  const shown = path.relative(root, dir) || ".";
  console.log(`${c.dim("Into")} ${c.bold(shown)}${options.dryRun ? c.yellow("  (dry run — nothing is written)") : ""}\n`);

  /** @type {Set<string>} */
  const deps = new Set();
  /** @type {{ name: string; component: string; tsx?: string; css?: string }[]} */
  const added = [];

  for (const name of [...new Set(names)]) {
    const spin = spinner(`Fetching ${c.bold(name)}`);
    let item;
    try {
      item = await fetchItem(options.registry, name);
    } catch (error) {
      spin.fail(`${c.bold(name)}: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
      continue;
    }
    spin.succeed(`${c.bold(item.title ?? item.name)}`);

    /** @type {{ name: string; component: string; tsx?: string; css?: string }} */
    const entry = { name: item.name, component: "" };
    for (const file of item.files) {
      const base = path.basename(file.target ?? file.path);
      const dest = path.join(dir, base);
      const rel = path.relative(root, dest);

      if (base.endsWith(".tsx") || base.endsWith(".jsx")) {
        entry.component = base.replace(/\.[jt]sx$/, "");
        entry.tsx = dest.replace(/\.[jt]sx$/, "");
      }
      if (base.endsWith(".css")) entry.css = dest;

      if (existsSync(dest)) {
        if (readFileSync(dest, "utf8") === file.content) {
          console.log(`  ${mark.skip} ${c.dim(`${rel} is already up to date`)}`);
          continue;
        }
        const replace = options.overwrite || (!options.dryRun && (options.yes ? false : await confirm(`${rel} already exists and differs. Replace it?`)));
        if (!replace) {
          const note = options.dryRun ? `${rel} differs from Rekt UI's (--overwrite would replace it)` : `kept your ${rel}`;
          console.log(`  ${mark.skip} ${c.dim(note)}${options.yes && !options.dryRun ? c.dim(" (use --overwrite to replace)") : ""}`);
          continue;
        }
      }

      if (!options.dryRun) {
        mkdirSync(path.dirname(dest), { recursive: true });
        writeFileSync(dest, file.content);
      }
      console.log(`  ${mark.ok} ${rel}`);
    }
    for (const dep of item.dependencies ?? []) deps.add(dep);
    added.push(entry);
  }

  if (!added.length) return;

  const missing = missingDependencies(root, [...deps]);
  if (missing.length) {
    const pm = packageManager(root);
    const args = [pm === "npm" ? "install" : "add", ...missing];
    if (options.dryRun || !options.install) {
      console.log(`\n${mark.info} Install ${missing.join(", ")}: ${c.bold(`${pm} ${args.join(" ")}`)}`);
    } else {
      console.log(`\n${mark.info} Installing ${missing.join(", ")} with ${pm}…`);
      await run(pm, args, root);
    }
  }

  console.log(`\n${c.bold("Use it")}`);
  for (const entry of added) {
    if (!entry.tsx || !entry.component) continue;
    console.log(c.cyan(`  import { ${entry.component} } from "${importPath(root, entry.tsx)}";`));
    if (entry.css) console.log(c.cyan(`  import "${importPath(root, entry.css.replace(/\.css$/, ""))}.css";`));
    console.log(c.cyan(`  <${entry.component} />`) + "\n");
  }
  console.log(c.dim("Every prop is optional. Tune it on the site, then copy the Usage snippet."));
}

/**
 * Runs the package manager with the user's terminal attached.
 * @param {string} command @param {string[]} args @param {string} cwd
 */
function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
    child.on("error", () => reject(new CliError(`Couldn't start ${command}. Install ${args.slice(1).join(" ")} yourself.`)));
    child.on("exit", (code) =>
      code === 0 ? resolve(undefined) : reject(new CliError(`${command} exited with code ${code}. Install ${args.slice(1).join(" ")} yourself.`)),
    );
  });
}
