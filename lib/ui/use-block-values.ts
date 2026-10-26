"use client";

import { useMemo } from "react";
import { usePreviewState } from "@/lib/preview-state";
import { defaultValues } from "@/lib/ui/snippets";
import type { ControlValues, UiBlock } from "@/lib/ui/types";

/**
 * The props a component is rendered with: its control defaults, overridden by
 * whatever the visitor tuned. Kept above the wall, so the card shows the same
 * values after the dialog closes.
 */
export function useBlockValues(block: UiBlock) {
  const { custom, startedAt, restart, setCustom } = usePreviewState(block.id);
  const values = useMemo(
    () => ({ ...defaultValues(block), ...(custom as ControlValues | undefined) }),
    [block, custom],
  );
  return {
    values,
    startedAt,
    restart,
    setValue: (prop: string, value: string | number | boolean) => setCustom({ [prop]: value }),
  };
}
