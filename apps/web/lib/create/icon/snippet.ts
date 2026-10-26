import { pascalCase } from "@/lib/create/icon/icons";
import type { IconAnimationId } from "@/lib/create/icon/animation";

export type IconConfig = {
  icon: string;
  animation: IconAnimationId;
  loop: boolean;
  loopDelay: number;
  size: number;
};

/**
 * What Copy Code hands over.
 *
 * These icons are not a package import — each one is a file you add to your
 * project — so the snippet starts with the command that puts it there. The
 * namespaced form is the one Animate UI documents; the URL form works in a
 * project that has no `@animate-ui` registry configured, so it is included as a
 * comment rather than left for someone to find out the hard way.
 */
export function buildIconSnippet(config: IconConfig) {
  const component = pascalCase(config.icon);
  const item = `icons-${config.icon}`;

  const props = [`  animation="${config.animation}"`, "  animate"];
  if (config.loop) {
    props.push("  loop");
    if (config.loopDelay > 0) props.push(`  loopDelay={${Number(config.loopDelay.toFixed(1))}}`);
  }
  props.push(`  size={${config.size}}`);

  return [
    "// 1 · Add the icon to your project — the wrapper comes with it",
    `npx shadcn@latest add @animate-ui/${item}`,
    "// without the @animate-ui registry configured, use the full URL:",
    `// npx shadcn@latest add https://animate-ui.com/r/${item}.json`,
    "",
    "// 2 · Use it",
    `import { ${component} } from "@/components/animate-ui/icons/${config.icon}";`,
    "",
    `<${component}`,
    ...props,
    "/>",
  ].join("\n");
}
