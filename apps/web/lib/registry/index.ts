import { loadingState } from "@/lib/registry/categories/loading-state";
import { thinking } from "@/lib/registry/categories/thinking";
import { streamingText } from "@/lib/registry/categories/streaming-text";
import { approvalCard } from "@/lib/registry/categories/approval-card";
import { toolChips } from "@/lib/registry/categories/tool-chips";
import { textEffects } from "@/lib/registry/categories/text-effects";
import { codeBlock } from "@/lib/registry/categories/code-block";
import { loader } from "@/lib/registry/categories/loader";
import type { ComponentCategory, ComponentItem } from "@/lib/registry/types";

/**
 * The library is curated in code. To add a component:
 *   1. write the preview component under components/previews/
 *   2. add a ComponentItem to the right category's `items` array
 * It renders below the existing entries automatically. To add a category,
 * create a file in categories/ and append it here.
 */
const allCategories: ComponentCategory[] = [
  loadingState,
  thinking,
  streamingText,
  approvalCard,
  toolChips,
  textEffects,
  codeBlock,
  loader,

];

/**
 * Only categories with something to show are navigated and routed — an empty
 * page is worse than no page. Rekt's own tools live in lib/registry/tools.ts.
 */
export const categories = allCategories.filter((c) => c.items.length > 0);

export const componentCategories = categories.filter((c) => c.group === "components");

export function getCategory(id: string): ComponentCategory | undefined {
  return categories.find((c) => c.id === id);
}

export function getItem(categoryId: string, itemId: string): ComponentItem | undefined {
  return getCategory(categoryId)?.items.find((i) => i.id === itemId);
}

export const firstCategory = componentCategories[0];
