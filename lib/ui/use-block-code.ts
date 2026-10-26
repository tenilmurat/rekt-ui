"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ComponentItem } from "@/lib/registry/types";
import { useSession } from "@/lib/session";

/**
 * The code a visitor may see for one component. Free items carry their usage
 * in this repo. Pro items are locked for free accounts, and Pro accounts get
 * the source from rektui-backend — it is never in this public repo.
 */
export function useBlockCode(item: ComponentItem | null, enabled: boolean) {
  const { plan } = useSession();
  const isPro = item?.tier === "pro";
  const locked = isPro && plan === "free";
  const fetchId = enabled && isPro && !locked ? item!.id : null;
  const [fetched, setFetched] = useState<{ id: string; usage: string } | null>(null);

  useEffect(() => {
    if (!fetchId) return;
    let cancelled = false;
    api<{ usage: string }>(`/components/${encodeURIComponent(fetchId)}/source`)
      .then((source) => !cancelled && setFetched({ id: fetchId, usage: source.usage }))
      .catch(() => !cancelled && setFetched({ id: fetchId, usage: "// Couldn't load the source — try again" }));
    return () => {
      cancelled = true;
    };
  }, [fetchId]);

  if (!item || locked) return { locked, loading: false, usage: null as string | null };
  if (!isPro) return { locked: false, loading: false, usage: item.code?.usage ?? null };
  const ready = fetched?.id === item.id;
  return { locked: false, loading: !ready, usage: ready ? fetched!.usage : null };
}
