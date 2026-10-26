"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ItemState = {
  presetId?: string;
  /** When the preview first mounted — keeps timers/animation continuous across views. */
  startedAt: number;
  /** Room for per-component configuration later (Create tools). */
  custom?: Record<string, unknown>;
};

type PreviewStateValue = {
  get: (itemId: string) => ItemState;
  setPreset: (itemId: string, presetId: string) => void;
  setCustom: (itemId: string, custom: Record<string, unknown>) => void;
  restart: (itemId: string) => void;
};

const PreviewStateContext = createContext<PreviewStateValue | null>(null);

/**
 * Holds preset + timing per component entry, above the views that render it.
 * Default View and Full View read the same record, so switching between them
 * keeps the selected preset, the elapsed timer and any custom config.
 */
export function PreviewStateProvider({ children }: { children: React.ReactNode }) {
  const [states, setStates] = useState<Record<string, ItemState>>({});
  const startTimes = useRef<Record<string, number>>({});

  const get = useCallback((itemId: string): ItemState => {
    if (!startTimes.current[itemId]) startTimes.current[itemId] = Date.now();
    return states[itemId] ?? { startedAt: startTimes.current[itemId] };
  }, [states]);

  const setPreset = useCallback((itemId: string, presetId: string) => {
    setStates((prev) => {
      if (!startTimes.current[itemId]) startTimes.current[itemId] = Date.now();
      const current = prev[itemId] ?? { startedAt: startTimes.current[itemId] };
      return { ...prev, [itemId]: { ...current, presetId } };
    });
  }, []);

  const setCustom = useCallback((itemId: string, custom: Record<string, unknown>) => {
    setStates((prev) => {
      if (!startTimes.current[itemId]) startTimes.current[itemId] = Date.now();
      const current = prev[itemId] ?? { startedAt: startTimes.current[itemId] };
      return { ...prev, [itemId]: { ...current, custom: { ...current.custom, ...custom } } };
    });
  }, []);

  /** New start time = the preview remounts and plays from the beginning. */
  const restart = useCallback((itemId: string) => {
    const now = Date.now();
    startTimes.current[itemId] = now;
    setStates((prev) => {
      const current = prev[itemId] ?? { startedAt: now };
      return { ...prev, [itemId]: { ...current, startedAt: now } };
    });
  }, []);

  const value = useMemo(
    () => ({ get, setPreset, setCustom, restart }),
    [get, setPreset, setCustom, restart],
  );

  return <PreviewStateContext.Provider value={value}>{children}</PreviewStateContext.Provider>;
}

export function usePreviewState(itemId: string) {
  const ctx = useContext(PreviewStateContext);
  if (!ctx) throw new Error("usePreviewState must be used inside PreviewStateProvider");
  const state = ctx.get(itemId);
  return {
    presetId: state.presetId,
    startedAt: state.startedAt,
    custom: state.custom,
    setPreset: (presetId: string) => ctx.setPreset(itemId, presetId),
    setCustom: (custom: Record<string, unknown>) => ctx.setCustom(itemId, custom),
    restart: () => ctx.restart(itemId),
  };
}
