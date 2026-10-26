"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BASE_PATH } from "@/lib/base-path";
import { useSession } from "@/lib/session";
import type { SourceFile, UiBlock } from "@/lib/ui/types";

type Loaded = { id: string; files: SourceFile[] } | { id: string; error: string };

/** Loaded once per component per visit; the Code tab and Copy prompt share it. */
const cache = new Map<string, SourceFile[]>();

/**
 * A component's files for the Code tab. Free components come from the static
 * /source/<id> JSON; Pro ones from the API, only for Pro accounts — Pro
 * source is never in this public repo. Nothing loads until `enabled`.
 */
export function useBlockSource(block: UiBlock, enabled: boolean) {
  const { plan } = useSession();
  const isPro = block.tier === "pro";
  const locked = isPro && plan === "free";
  const [loaded, setLoaded] = useState<Loaded | null>(() =>
    cache.has(block.id) ? { id: block.id, files: cache.get(block.id)! } : null,
  );

  useEffect(() => {
    if (!enabled || locked || cache.has(block.id)) return;
    let cancelled = false;
    const request = isPro
      ? api<{ files: SourceFile[] }>(`/components/${encodeURIComponent(block.id)}/source`)
      : fetch(`${BASE_PATH}/source/${encodeURIComponent(block.id)}`).then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json() as Promise<{ files: SourceFile[] }>;
        });
    request
      .then(({ files }) => {
        cache.set(block.id, files);
        if (!cancelled) setLoaded({ id: block.id, files });
      })
      .catch(() => !cancelled && setLoaded({ id: block.id, error: "Couldn't load the source — close and try again." }));
    return () => {
      cancelled = true;
    };
  }, [enabled, locked, isPro, block.id]);

  const current = loaded?.id === block.id ? loaded : null;
  return {
    locked,
    files: current && "files" in current ? current.files : null,
    error: current && "error" in current ? current.error : null,
  };
}
