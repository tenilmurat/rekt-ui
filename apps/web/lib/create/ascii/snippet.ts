import type { AsciiAnimationId } from "@/lib/create/ascii/animation";
import type { CharacterSetId } from "@/lib/create/ascii/charsets";

export type AsciiSourceType = "icon" | "logo" | "image";

export type AsciiConfig = {
  sourceType: AsciiSourceType;
  /** Lucide name, kebab-case in state. */
  icon: string | null;
  /** The uploaded file's name, used only to suggest a path in the snippet. */
  fileName: string | null;
  characterSet: CharacterSetId;
  customCharacters: string;
  animation: AsciiAnimationId;
  density: number;
  speed: number;
  invert: boolean;
};

const pascal = (kebab: string) =>
  kebab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const extension = (name: string | null, fallback: string) => {
  const ext = name?.split(".").pop()?.toLowerCase();
  return ext && ext.length <= 4 ? ext : fallback;
};

/**
 * What Copy Code hands over: the same <AsciiArt /> this page renders. Uploaded
 * files are never inlined — the snippet points at a path to drop the asset in.
 */
export function buildAsciiSnippet(config: AsciiConfig) {
  const lines: string[] = ["<AsciiArt", `  sourceType="${config.sourceType}"`];

  if (config.sourceType === "icon") {
    lines.push(`  icon="${pascal(config.icon ?? "rocket")}"`);
  } else {
    const fallback = config.sourceType === "logo" ? "svg" : "png";
    lines.push(`  src="/your-${config.sourceType}.${extension(config.fileName, fallback)}"`);
  }

  lines.push(`  characterSet="${config.characterSet}"`);
  if (config.characterSet === "custom") {
    lines.push(`  customCharacters="${config.customCharacters}"`);
  }
  lines.push(`  animation="${config.animation}"`);
  lines.push(`  density={${Number(config.density.toFixed(2))}}`);
  lines.push(`  speed={${Number(config.speed.toFixed(2))}}`);
  lines.push(config.invert ? "  invert" : "  invert={false}");
  lines.push("/>");

  const note =
    config.sourceType === "icon" ? "" : "// Replace with your own asset path\n";
  return note + lines.join("\n");
}
