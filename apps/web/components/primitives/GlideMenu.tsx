"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

/**
 * A single highlight layer that glides between rows marked `data-menu-row`.
 * Written for this app to satisfy the import in Beautiful UI's Approval Card;
 * it follows the behaviour their docs describe (top/height 220ms, opacity 150ms)
 * but is not their implementation.
 */
export default function GlideMenu({
  children,
  className = "",
  highlightClassName = "inset-x-0 rounded-control bg-hover",
}: {
  children: ReactNode;
  className?: string;
  highlightClassName?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  const [visible, setVisible] = useState(false);

  const track = useCallback((event: React.SyntheticEvent) => {
    const host = hostRef.current;
    if (!host) return;
    const row = (event.target as HTMLElement).closest<HTMLElement>("[data-menu-row]");
    if (!row || !host.contains(row)) {
      setVisible(false);
      return;
    }
    setBox({ top: row.offsetTop, height: row.offsetHeight });
    setVisible(true);
  }, []);

  return (
    <div
      ref={hostRef}
      className={`relative ${className}`}
      onMouseMove={track}
      onFocus={track}
      onMouseLeave={() => setVisible(false)}
      onBlur={() => setVisible(false)}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute ${highlightClassName}`}
        style={{
          top: box?.top ?? 0,
          height: box?.height ?? 0,
          opacity: visible ? 1 : 0,
          transition:
            "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
        }}
      />
      {children}
    </div>
  );
}
