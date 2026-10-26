"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Check, TriangleAlert } from "lucide-react";

type Toast = { id: number; message: string; tone: "done" | "warn" };

const ToastContext = createContext<((message: string, tone?: Toast["tone"]) => void) | null>(null);

const VISIBLE_MS = 2200;
const EXIT_MS = 220;

/**
 * One small confirmation at a time, top centre — the same card the rest of the
 * chrome is made of: hairline border, raised surface, overlay shadow, 12px text.
 * It drops in from the top edge and lifts back out, and doubles as the live
 * region, so the action is announced once.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [leaving, setLeaving] = useState(false);
  const hideTimer = useRef(0);
  const removeTimer = useRef(0);

  const show = useCallback((message: string, tone: Toast["tone"] = "done") => {
    window.clearTimeout(hideTimer.current);
    window.clearTimeout(removeTimer.current);
    setLeaving(false);
    setToast({ id: Date.now(), message, tone });

    hideTimer.current = window.setTimeout(() => {
      setLeaving(true);
      removeTimer.current = window.setTimeout(() => {
        setToast(null);
        setLeaving(false);
      }, EXIT_MS);
    }, VISIBLE_MS);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(removeTimer.current);
    },
    [],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center p-[24px]"
      >
        {toast ? (
          <div
            key={toast.id}
            className={`${leaving ? "toast-out" : "toast-in"} flex items-center gap-[8px] rounded-[10px] border px-[12px] py-[8px] text-[12px] font-medium`}
            style={{
              backgroundColor: "var(--surface-raised)",
              borderColor: "var(--line)",
              color: "var(--ink)",
              boxShadow: "var(--shadow-overlay)",
            }}
          >
            {toast.tone === "done" ? (
              <Check size={14} strokeWidth={1.875} style={{ color: "var(--green)" }} aria-hidden="true" />
            ) : (
              <TriangleAlert size={14} strokeWidth={1.875} style={{ color: "var(--orange)" }} aria-hidden="true" />
            )}
            {toast.message}
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside ToastProvider");
  return show;
}

/** Clipboard with the fallback for contexts where the API is blocked. */
export async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error("no clipboard api");
  } catch {
    try {
      const field = document.createElement("textarea");
      field.value = text;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      field.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
