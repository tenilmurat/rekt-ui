import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * The shadcn `cn` helper. Curated components from registries (Rare UI and
 * friends) import it from "@/lib/utils"; this app's own components use plain
 * class strings, so nothing else depends on it.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
