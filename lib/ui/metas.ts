import { rollingCounterMeta } from "@/components/blocks/rolling-counter/meta";
import type { UiBlockMeta } from "@/lib/ui/types";

/**
 * Every free component the registry (/r/<id>.json) can hand out, read on the
 * server without loading any component code. Add a component's meta here when
 * it gets one. Pro components are not listed: their source is not in this repo.
 */
export const BLOCK_METAS: UiBlockMeta[] = [rollingCounterMeta];

export const getMeta = (id: string) => BLOCK_METAS.find((m) => m.id === id);
