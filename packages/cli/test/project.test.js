// @ts-check
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { aliases, componentsDir, importPath, missingDependencies, packageManager, readJsonc } from "../src/project.js";

/** A throwaway project folder with the given files. @param {Record<string, string>} files */
function project(files) {
  const root = mkdtempSync(path.join(tmpdir(), "rektui-"));
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    writeFileSync(path.join(root, name), content);
  }
  return root;
}

test("reads tsconfig with comments and trailing commas", () => {
  const root = project({ "tsconfig.json": '{ // note\n "a": "http://x", /* b */ "c": [1,], }' });
  assert.deepEqual(readJsonc(path.join(root, "tsconfig.json")), { a: "http://x", c: [1] });
});

test("Next.js without src: components/rekt-ui, imported through @/", () => {
  const root = project({ "package.json": "{}", "tsconfig.json": '{"compilerOptions":{"paths":{"@/*":["./*"]}}}', "app/page.tsx": "" });
  const dir = componentsDir(root, undefined);
  assert.equal(dir, path.join(root, "components", "rekt-ui"));
  assert.equal(importPath(root, path.join(dir, "RollingCounter")), "@/components/rekt-ui/RollingCounter");
});

test("Vite with src: src/components/rekt-ui", () => {
  const root = project({ "package.json": "{}", "tsconfig.json": '{"compilerOptions":{"baseUrl":".","paths":{"@/*":["./src/*"]}}}', "src/main.tsx": "" });
  assert.equal(componentsDir(root, undefined), path.join(root, "src", "components", "rekt-ui"));
  assert.equal(aliases(root)[0].prefix, "@/");
});

test("follows shadcn's components alias", () => {
  const root = project({
    "package.json": "{}",
    "tsconfig.json": '{"compilerOptions":{"paths":{"~/*":["./app/*"]}}}',
    "components.json": '{"aliases":{"components":"~/ui-kit"}}',
  });
  assert.equal(componentsDir(root, undefined), path.join(root, "app", "ui-kit", "rekt-ui"));
});

test("no alias: a relative import", () => {
  const root = project({ "package.json": "{}" });
  assert.equal(importPath(root, path.join(root, "components", "rekt-ui", "X")), "./components/rekt-ui/X");
});

test("only missing dependencies are installed, versions ignored", () => {
  const root = project({ "package.json": '{"dependencies":{"motion":"^12"},"devDependencies":{"@scope/a":"1"}}' });
  assert.deepEqual(missingDependencies(root, ["motion@^12", "@scope/a@2", "@scope/b", "clsx"]), ["@scope/b", "clsx"]);
});

test("package manager from the lockfile", () => {
  assert.equal(packageManager(project({ "pnpm-lock.yaml": "" })), "pnpm");
  assert.equal(packageManager(project({ "bun.lock": "" })), "bun");
  assert.equal(packageManager(project({ "package-lock.json": "{}" })), "npm");
});
