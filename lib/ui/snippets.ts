import type { ControlValues, SourceFile, UiBlock } from "@/lib/ui/types";

/** Default value of every control, as props. */
export function defaultValues(block: UiBlock): ControlValues {
  return Object.fromEntries((block.controls ?? []).map((c) => [c.prop, c.default]));
}

/** Where installed components live in a project, by the CLI or by hand. */
export const INSTALL_DIR = "components/rekt-ui";

/** Where the site is served from, for the registry URLs in install commands. */
export function siteOrigin() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return typeof window === "undefined" ? "" : `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`;
}

/**
 * Rekt UI's own installer (the `rektui` package, repo rektui-cli). Shown once
 * it is published: set NEXT_PUBLIC_REKTUI_CLI=1.
 */
export const rektuiCliPublished = process.env.NEXT_PUBLIC_REKTUI_CLI === "1";

export function rektuiCommand(block: Pick<UiBlock, "id">) {
  return `npx rektui@latest add ${block.id}`;
}

/** One command: the shadcn CLI fetches the files from Rekt UI's registry and installs the dependencies. */
export function cliCommand(block: Pick<UiBlock, "id">) {
  return `npx shadcn@latest add ${siteOrigin()}/r/${block.id}.json`;
}

/** By hand: the dependencies, then the files from the Code section. */
export function manualInstall(block: UiBlock) {
  const deps = block.dependencies?.length
    ? `npm install ${block.dependencies.join(" ")}`
    : "# nothing to install beyond React";
  return `${deps}\n# then add ${block.files.join(" and ")} (Code, below) to ${INSTALL_DIR}/`;
}

export function installCommand(block: UiBlock) {
  return block.dependencies?.length
    ? `npm install ${block.dependencies.join(" ")}`
    : "# nothing to install beyond React";
}

const prop = (name: string, value: string | number | boolean) =>
  typeof value === "string" ? `${name}="${value}"` : `${name}={${value}}`;

/** The import lines and the JSX, with the props the visitor tuned. */
export function usageSnippet(block: UiBlock, values: ControlValues) {
  const base = block.files[0].replace(/\.tsx$/, "");
  const css = block.files.find((f) => f.endsWith(".css"));
  const props = Object.entries(values).map(([k, v]) => `  ${prop(k, v)}`);
  const jsx = props.length ? `<${block.name}\n${props.join("\n")}\n/>` : `<${block.name} />`;
  return [`import { ${block.name} } from "@/${INSTALL_DIR}/${base}";`, css ? `import "@/${INSTALL_DIR}/${css}";` : null, "", jsx]
    .filter((line) => line !== null)
    .join("\n");
}

/**
 * Everything an AI coding assistant needs to add the component in one go:
 * the files, what to install, how to use it with the tuned props.
 */
export function promptFor(block: UiBlock, values: ControlValues, files: SourceFile[]) {
  const fence = (path: string) => (path.endsWith(".css") ? "css" : "tsx");
  return [
    `Add the "${block.title}" component from Rekt UI to this project.`,
    "",
    block.description,
    "",
    "## Install",
    "```bash",
    installCommand(block),
    "```",
    "",
    "## Files",
    `Create these files in ${INSTALL_DIR}/, unchanged:`,
    "",
    ...files.flatMap((f) => [`### ${f.path}`, "```" + fence(f.path), f.code.trimEnd(), "```", ""]),
    "## Usage",
    "```tsx",
    usageSnippet(block, values),
    "```",
    "",
    "## Notes",
    "- It is a client component (it uses state and pointer events); the file already starts with \"use client\".",
    "- Import the CSS once, where the component is used or in a layout.",
    "- Its colours come from CSS variables with fallbacks, so it works as is; map them to the project's own tokens if it has them.",
    "- Wire it in where I ask, keep its class names, and don't restyle it unless I ask.",
  ].join("\n");
}
