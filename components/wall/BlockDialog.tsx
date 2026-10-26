"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Code2, Eye, Link2, Lock, RotateCcw, X } from "lucide-react";
import { SourceBadge } from "@/components/library/SourceBadge";
import { BookmarkButton } from "@/components/site/BookmarkButton";
import { usePreviewState } from "@/lib/preview-state";
import { copyText, useToast } from "@/lib/toast";
import type { UiBlock } from "@/lib/ui/catalog";
import { useBlockCode } from "@/lib/ui/use-block-code";

/**
 * A component, opened from the wall: the live stage on the left (Preview or
 * Code), its details and settings on the right. The URL carries `?c=<id>`, so
 * the open component can be shared and survives a reload.
 */
export function BlockDialog({ block, onClose }: { block: UiBlock; onClose: () => void }) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const { presetId, startedAt, setPreset, restart } = usePreviewState(block.id);
  const presets = block.presets ?? [];
  const preset = presets.find((p) => p.id === presetId) ?? presets[0];
  const code = useBlockCode(block, view === "code");
  const toast = useToast();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const Preview = block.component;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [onClose]);

  async function share() {
    const ok = await copyText(window.location.href);
    toast(ok ? `Link to ${block.title} copied` : "Couldn't copy the link — check clipboard permission", ok ? "done" : "warn");
  }

  async function copyCode() {
    if (!code.usage) return;
    const ok = await copyText(code.usage);
    toast(ok ? `${block.title} code copied` : "Couldn't copy — check clipboard permission", ok ? "done" : "warn");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[12px] sm:p-[24px]" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        tabIndex={-1}
        aria-label={`Close ${block.title}`}
        onClick={onClose}
        className="absolute inset-0 cursor-default animate-[fade-in_200ms_var(--ease-out-strong)_both]"
        style={{ backgroundColor: "rgba(20,18,16,0.32)", backdropFilter: "blur(2px)" }}
      />

      <div className="animate-pop-in relative flex h-full max-h-[640px] w-full max-w-[1000px] flex-col gap-[10px] md:flex-row">
        {/* Stage */}
        <section
          aria-label={`${block.title} ${view}`}
          className="relative min-h-[320px] flex-1 overflow-hidden rounded-[28px]"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <div className="absolute left-[12px] top-[12px] z-10 flex rounded-full p-[3px]" role="tablist" aria-label="View" style={{ backgroundColor: "var(--hover-2)" }}>
            {(
              [
                { id: "preview", label: "Preview", icon: Eye },
                { id: "code", label: "Code", icon: Code2 },
              ] as const
            ).map(({ id, label, icon: IconGlyph }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                aria-label={label}
                title={label}
                onClick={() => setView(id)}
                className="flex size-[30px] items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: view === id ? "var(--surface-raised)" : "transparent",
                  color: view === id ? "var(--ink)" : "var(--ink-3)",
                  boxShadow: view === id ? "var(--shadow-raised)" : "none",
                }}
              >
                <IconGlyph size={15} strokeWidth={1.875} />
              </button>
            ))}
          </div>

          <div className="absolute right-[12px] top-[12px] z-10 flex gap-[6px]">
            {block.replay && view === "preview" ? (
              <button
                type="button"
                onClick={restart}
                aria-label={`Play ${block.title} again`}
                className="control flex size-[36px] items-center justify-center rounded-full border active:scale-[0.94]"
                style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)", color: "var(--icon)" }}
              >
                <RotateCcw size={15} strokeWidth={1.875} />
              </button>
            ) : null}
            <BookmarkButton kind="component" id={block.id} label={block.title} round />
          </div>

          {view === "preview" ? (
            <div className="flex h-full w-full items-center justify-center px-[24px] pt-[48px]">
              <Preview key={startedAt} {...(preset?.props ?? {})} startedAt={startedAt} expanded />
            </div>
          ) : code.locked ? (
            <div className="flex h-full flex-col items-center justify-center gap-[12px] px-[24px] text-center">
              <Lock size={20} strokeWidth={1.75} style={{ color: "var(--icon)" }} aria-hidden="true" />
              <p className="max-w-[280px] text-[14px]" style={{ color: "var(--ink)" }}>
                {block.title} is a Pro component. Its full source comes with Pro.
              </p>
            </div>
          ) : (
            <pre
              className="no-scrollbar h-full overflow-auto px-[24px] pb-[24px] pt-[64px] font-mono text-[12.5px] leading-[1.65]"
              style={{ color: "var(--ink)" }}
            >
              <code>{code.loading ? "// Loading source…" : (code.usage ?? "// Code coming soon")}</code>
            </pre>
          )}
        </section>

        {/* Details */}
        <aside
          className="flex max-h-[45%] w-full shrink-0 flex-col overflow-hidden rounded-[28px] p-[18px] md:max-h-none md:w-[300px]"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <header className="flex flex-col gap-[8px] pb-[14px]">
            <div className="flex items-start justify-between gap-[12px]">
              <h2 id={titleId} className="text-[15px] font-medium" style={{ color: "var(--ink-title)" }}>
                {block.title}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="control-quiet -mr-[6px] -mt-[4px] flex size-[30px] shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--control-bg)", color: "var(--control-fg)" }}
              >
                <X size={16} strokeWidth={1.875} />
              </button>
            </div>
            <p className="text-[13px] leading-[1.55]" style={{ color: "var(--ink-2)" }}>
              {block.description}
            </p>
          </header>

          <div className="no-scrollbar flex flex-1 flex-col gap-[18px] overflow-y-auto py-[6px]">
            {presets.length > 1 ? (
              <section className="flex flex-col gap-[8px]">
                <h3 className="text-[12px]" style={{ color: "var(--ink-3)" }}>
                  Style
                </h3>
                <div className="flex flex-wrap gap-[6px]">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={p.id === preset?.id}
                      onClick={() => setPreset(p.id)}
                      className="control-chip h-[30px] rounded-full px-[12px] text-[13px]"
                      style={{
                        backgroundColor: p.id === preset?.id ? "var(--ink)" : "var(--surface-raised)",
                        color: p.id === preset?.id ? "var(--bg)" : "var(--ink-2)",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {block.sourceName ? (
              <section className="flex items-center gap-[8px] text-[12px]" style={{ color: "var(--ink-3)" }}>
                <SourceBadge item={block} size={24} />
                Based on {block.sourceName}
                {block.license ? ` · ${block.license}` : ""}
              </section>
            ) : null}
          </div>

          <div className="flex flex-col gap-[8px] pt-[12px]">
            <button
              type="button"
              onClick={share}
              className="control flex h-[40px] items-center justify-center gap-[7px] rounded-full border text-[13px] font-medium active:scale-[0.98]"
              style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)", color: "var(--ink)" }}
            >
              <Link2 size={15} strokeWidth={1.875} />
              Share
            </button>
            {code.locked ? (
              <Link
                href="/pricing"
                className="flex h-[40px] items-center justify-center rounded-full text-[13px] font-medium transition-transform active:scale-[0.98]"
                style={{ backgroundColor: "var(--ink)", color: "var(--bg)" }}
              >
                Get Pro
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => (view === "code" ? copyCode() : setView("code"))}
                disabled={view === "code" && !code.usage}
                className="flex h-[40px] items-center justify-center rounded-full text-[13px] font-medium transition-transform active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: "var(--ink)", color: "var(--bg)" }}
              >
                {view === "code" ? "Copy code" : "Get the code"}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
