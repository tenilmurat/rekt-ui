/**
 * Character ramps, written densest first: index 0 is the heaviest mark, the last
 * entry the lightest. `mapBrightnessToCharacter` walks them in that order.
 */
export type CharacterSetId =
  | "classic"
  | "alphabetical"
  | "numerical"
  | "special"
  | "unicode"
  | "mixed"
  | "custom";

export const CHARACTER_SETS: { id: CharacterSetId; label: string; chars: string }[] = [
  { id: "classic", label: "Classic ASCII", chars: "@#%*+=-:." },
  { id: "alphabetical", label: "Alphabetical", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  { id: "numerical", label: "Numerical", chars: "0123456789" },
  { id: "special", label: "Special Chars", chars: "!@#$%^&*()_+-=" },
  { id: "unicode", label: "Unicode Blocks", chars: "█▓▒░" },
  { id: "mixed", label: "Mixed", chars: "@#ABC123%*+=█▒" },
  { id: "custom", label: "Custom", chars: "@#%01ABC█▒" },
];

export const DEFAULT_CUSTOM = "@#%01ABC█▒";

/** The ramp for a set; Custom falls back to the default when the field is empty. */
export function getCharacterSet(id: CharacterSetId, custom: string) {
  if (id === "custom") {
    const cleaned = custom.replace(/\s/g, "");
    return cleaned.length ? cleaned : DEFAULT_CUSTOM;
  }
  return CHARACTER_SETS.find((set) => set.id === id)?.chars ?? CHARACTER_SETS[0].chars;
}

/**
 * Ink (0 = nothing there, 1 = solid) to a character. Invert flips the ramp, not
 * the coverage: an empty pixel stays empty either way, which is what keeps
 * transparent corners of an icon or logo clean.
 */
export function mapBrightnessToCharacter(ink: number, ramp: string, invert: boolean) {
  const value = invert ? 1 - ink : ink;
  const index = Math.round((1 - value) * (ramp.length - 1));
  return ramp[Math.min(ramp.length - 1, Math.max(0, index))];
}
