import type { AnimationId } from "@/lib/create/code/animation";
import type { LanguageId } from "@/lib/create/code/languages";
import type { AccentId } from "@/lib/create/code/palette";

export type CodeConfig = {
  language: LanguageId;
  animation: AnimationId;
  speed: number;
  accent: AccentId;
  customAccent: string;
  lineNumbers: boolean;
  code: string;
};

/**
 * What Copy Code hands over: a call to the same <AnimatedCode /> this page
 * renders, with the current settings and the current code inside it.
 */
export function buildUsageSnippet(config: CodeConfig) {
  const colour = config.accent === "custom" ? config.customAccent : config.accent;
  const code = config.code.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

  return `<AnimatedCode
  language="${config.language}"
  animation="${config.animation}"
  speed={${Number(config.speed.toFixed(2))}}
  syntaxColor="${colour}"${config.lineNumbers ? "\n  lineNumbers" : ""}
  code={\`${code}\`}
/>`;
}
