"use client";

import { useEffect, useRef, type ComponentType } from "react";
import LoadingState from "@/components/previews/beautiful-ui/LoadingState";
import ThinkingState from "@/components/previews/beautiful-ui/ThinkingState";
import StreamingText from "@/components/previews/beautiful-ui/StreamingText";
import ApprovalCard from "@/components/previews/beautiful-ui/ApprovalCard";
import ToolChips from "@/components/previews/beautiful-ui/ToolChips";
import type { PreviewProps } from "@/lib/registry/types";

/**
 * Registry-ready wrappers for the curated components.
 *
 * This module is a client boundary, so the registry (imported by server
 * components) only holds references to what is exported here — nothing is
 * called on the server. The wrapper:
 *   - keeps the shell's own props (paused / startedAt / expanded) away from
 *     components that don't know about them
 *   - pauses **looping** animations while the preview is off-screen
 *
 * Only infinite animations are paused. A blanket `animation-play-state: paused`
 * also freezes one-shot reveals, and anything using `fill-mode: both` then stays
 * stuck at its 0% frame — invisible.
 */
function useLoopPause(paused: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const nodes = [host, ...Array.from(host.querySelectorAll<HTMLElement>("*"))];
    for (const node of nodes) {
      const looping = getComputedStyle(node).animationIterationCount.includes("infinite");
      if (!looping) continue;
      node.style.animationPlayState = paused ? "paused" : "";
    }
  }, [paused]);

  return ref;
}

function wrap<P extends object>(Component: ComponentType<P>, name: string): ComponentType<PreviewProps> {
  function Curated({ paused = false, startedAt: _startedAt, expanded: _expanded, ...rest }: PreviewProps) {
    const ref = useLoopPause(paused);
    return (
      <div ref={ref}>
        <Component {...(rest as unknown as P)} />
      </div>
    );
  }
  Curated.displayName = `Curated(${name})`;
  return Curated;
}

export const LoadingStatePreview = wrap(LoadingState, "LoadingState");
export const ThinkingStatePreview = wrap(ThinkingState, "ThinkingState");
export const StreamingTextPreview = wrap(StreamingText, "StreamingText");
export const ApprovalCardPreview = wrap(ApprovalCard, "ApprovalCard");
export const ToolChipsPreview = wrap(ToolChips, "ToolChips");
