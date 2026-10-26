import type { ControlValues, SourceFile, UiBlock } from "@/lib/ui/types";

/** Default value of every control, as props. */
export function defaultValues(block: UiBlock): ControlValues {
  return Object.fromEntries((block.controls ?? []).map((c) => [c.prop, c.default]));
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
  return [`import { ${block.name} } from "./${base}";`, css ? `import "./${css}";` : null, "", jsx]
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
    "Create these files next to each other (for example in components/ui/), unchanged:",
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
