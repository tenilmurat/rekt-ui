"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Bookmark, Box, Code2, Link2, Lock, RotateCcw, X } from "lucide-react";
import { CodeBlock, CodeSection, PillTabs } from "@/components/wall/CodeView";
import { Controls } from "@/components/wall/Controls";
import { useSession } from "@/lib/session";
import { copyText, useToast } from "@/lib/toast";
import { INSTALL_DIR, cliCommand, manualInstall, promptFor, rektuiCliPublished, rektuiCommand, usageSnippet } from "@/lib/ui/snippets";
import type { UiBlock } from "@/lib/ui/types";
import { useBlockSource } from "@/lib/ui/use-block-source";
import { useBlockValues } from "@/lib/ui/use-block-values";
import { UI_CATEGORIES } from "@/lib/ui/catalog";

/**
 * A component, opened from the wall as a sheet that rises from the bottom.
 * Left: the title, the view switch and the live stage, or the Code tab —
 * Install, Usage (with the tuned props), the real .tsx / .css files and How it
 * works, plus Copy prompt for AI assistants. A soft line, then on the right:
 * Save and Share, the description and the controls. `?c=<id>` keeps it open
 * across reloads and shares.
 */
export function BlockDialog({ block, onClose }: { block: UiBlock; onClose: () => void }) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const { values, startedAt, restart, setValue } = useBlockValues(block);
  const source = useBlockSource(block, view === "code");
  const { isBookmarked, toggleBookmark } = useSession();
  const saved = isBookmarked("component", block.id);
  const [activeFile, setActiveFile] = useState(block.files[0]);
  // Pro components aren't in the public registry, so they install by hand.
  const hasCli = block.tier !== "pro";
  type InstallMethod = "rektui" | "cli" | "manual";
  const methods: { id: InstallMethod; label: string }[] = [
    ...(hasCli && rektuiCliPublished ? [{ id: "rektui" as const, label: "rektui" }] : []),
    ...(hasCli ? [{ id: "cli" as const, label: "shadcn" }] : []),
    { id: "manual", label: "Manual" },
  ];
  const [installMethod, setInstallMethod] = useState<InstallMethod>(methods[0].id);
  const toast = useToast();
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const Component = block.component;

  // Closing slides the sheet back down first; onClose runs when that animation ends.
  const [closing, setClosing] = useState(false);
  const requestClose = useCallback(() => setClosing(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && requestClose();
    document.addEventListener("keydown", onKey);
    const previous = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [requestClose]);

  const usage = usageSnippet(block, values);
  const install =
    installMethod === "rektui" ? rektuiCommand(block) : installMethod === "cli" ? cliCommand(block) : manualInstall(block);
  const fileCode = source.files?.find((f) => f.path === activeFile)?.code ?? null;

  async function share() {
    const ok = await copyText(window.location.href);
    toast(ok ? `Link to ${block.title} copied` : "Couldn't copy the link — check clipboard permission", ok ? "done" : "warn");
  }

  async function copyPrompt() {
    if (!source.files) return;
    const ok = await copyText(promptFor(block, values, source.files));
    toast(ok ? "Prompt copied — paste it into your AI assistant" : "Couldn't copy — check clipboard permission", ok ? "done" : "warn");
  }

  const category = UI_CATEGORIES.find((c) => c.id === block.category)?.label;
  const round = "control flex size-[44px] shrink-0 items-center justify-center rounded-full border active:scale-[0.94]";
  const roundStyle = { backgroundColor: "var(--control-bg)", borderColor: "var(--line)", color: "var(--ink)" };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        tabIndex={-1}
        aria-label={`Close ${block.title}`}
        onClick={requestClose}
        className={`absolute inset-0 cursor-default ${closing ? "sheet-scrim-out" : "sheet-scrim-in"}`}
        style={{ backgroundColor: "rgba(20,18,16,0.72)" }}
      />
      {/* The sheet: rises from the bottom, the component on the left and its details on the right, a soft line between. */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        className={`absolute inset-x-0 bottom-0 top-[56px] overflow-hidden ${closing ? "sheet-down" : "sheet-up"}`}
        // Inline, so the site-wide :focus-visible ring and its 4px radius don't square the corners when the sheet takes focus.
        style={{ backgroundColor: "var(--bg)", borderRadius: "24px 24px 0 0", outline: "none" }}
        onAnimationEnd={(e) => {
          if (closing && e.target === e.currentTarget) onClose();
        }}
      >
        {/* Close sits in the sheet's top-right corner, level with Save and Share, and stays put while the sheet scrolls. */}
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close"
          title="Close"
          className={`${round} absolute right-[16px] top-[24px] z-10 sm:right-[32px] md:right-[24px] md:top-[40px]`}
          style={roundStyle}
        >
          <X size={18} strokeWidth={1.875} />
        </button>

        <div className="flex h-full flex-col overflow-y-auto md:flex-row md:overflow-hidden">
          <section aria-label={`${block.title} ${view}`} className="flex min-w-0 flex-1 flex-col px-[16px] py-[24px] sm:px-[32px] md:overflow-y-auto md:px-[48px] md:py-[40px]">
            <div className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-[24px]">
              <header className="flex flex-wrap items-end justify-between gap-[16px] pr-[56px] md:pr-0">
                <div className="flex min-w-0 flex-col gap-[6px]">
                  <h2
                    id={titleId}
                    className="text-[26px] font-semibold leading-[1.1] tracking-[-0.04em] md:text-[30px]"
                    style={{ color: "var(--ink-title)" }}
                  >
                    {block.title}
                  </h2>
                  <p className="flex items-center gap-[8px] text-[13.5px]" style={{ color: "var(--ink-3)" }}>
                    {category}
                    {block.tier === "pro" ? (
                      <span className="rounded-full border px-[8px] py-[1px] text-[11.5px] font-medium" style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}>
                        Pro
                      </span>
                    ) : null}
                  </p>
                </div>

                <div className="flex items-center gap-[8px]">
                  {view === "code" && !source.locked ? (
                    <button
                      type="button"
                      onClick={copyPrompt}
                      disabled={!source.files}
                      className="h-[40px] rounded-full px-[18px] text-[14px] font-medium transition-transform active:scale-[0.97] disabled:opacity-50"
                      style={{ backgroundColor: "var(--ink)", color: "var(--bg)" }}
                    >
                      Copy prompt
                    </button>
                  ) : view === "preview" ? (
                    <button
                      type="button"
                      onClick={restart}
                      aria-label={`Restart ${block.title}`}
                      title="Restart"
                      className="control flex size-[40px] items-center justify-center rounded-full border active:scale-[0.94]"
                      style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--line)", color: "var(--icon)" }}
                    >
                      <RotateCcw size={16} strokeWidth={1.875} />
                    </button>
                  ) : null}
                  <div className="flex rounded-full p-[3px]" role="tablist" aria-label="View" style={{ backgroundColor: "var(--hover-2)" }}>
                    {(
                      [
                        { id: "preview", label: "Preview", icon: Box },
                        { id: "code", label: "Code", icon: Code2 },
                      ] as const
                    ).map(({ id, label, icon: Glyph }) => (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={view === id}
                        onClick={() => setView(id)}
                        className="flex h-[34px] items-center gap-[6px] rounded-full px-[14px] text-[13.5px] font-medium transition-colors"
                        style={{
                          backgroundColor: view === id ? "var(--ink)" : "transparent",
                          color: view === id ? "var(--bg)" : "var(--ink-3)",
                        }}
                      >
                        <Glyph size={15} strokeWidth={1.875} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </header>

              {view === "preview" ? (
                <div className="flex min-h-[320px] sm:min-h-[380px] flex-1 items-center justify-center rounded-[24px] bg-[var(--surface)] px-[24px] py-[48px] transition-colors duration-700 has-[[data-rk-dark]]:bg-[#0b0a0b]">
                  <Component key={startedAt} {...values} />
                </div>
              ) : source.locked ? (
                <div className="flex min-h-[320px] sm:min-h-[380px] flex-1 flex-col items-center justify-center gap-[12px] rounded-[24px] bg-[var(--surface)] px-[24px] py-[48px] text-center">
                  <Lock size={20} strokeWidth={1.75} style={{ color: "var(--icon)" }} aria-hidden="true" />
                  <p className="max-w-[300px] text-[14px]" style={{ color: "var(--ink)" }}>
                    {block.title} is a Pro component. Its install steps, usage and full source come with Pro.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-[10px]">
                  <CodeSection title="Install" copy={installMethod === "manual" ? install.split("\n")[0] : install} copyLabel="Install command" defaultOpen>
                    {methods.length > 1 ? (
                      <PillTabs
                        label="Install method"
                        items={methods}
                        active={installMethod}
                        onSelect={(id) => setInstallMethod(id as InstallMethod)}
                        mono
                      />
                    ) : null}
                    <CodeBlock code={install} language="plain" />
                    {installMethod !== "manual" ? (
                      <p className="px-[8px] pt-[8px] text-[12px] leading-[1.5]" style={{ color: "var(--ink-3)" }}>
                        Adds {block.files.join(" and ")} to <span className="font-mono">{INSTALL_DIR}/</span> from the Rekt UI registry, with
                        anything it depends on.{" "}
                        {installMethod === "rektui" ? "Works in any React project." : "Works in any project set up with shadcn."}
                      </p>
                    ) : null}
                  </CodeSection>

                  <CodeSection title="Usage" copy={usage} copyLabel="Usage" defaultOpen>
                    <CodeBlock code={usage} language="tsx" />
                  </CodeSection>

                  <CodeSection title="Code" copy={fileCode} copyLabel={activeFile}>
                    {block.files.length > 1 ? (
                      <PillTabs label="Files" items={block.files.map((f) => ({ id: f, label: f }))} active={activeFile} onSelect={setActiveFile} mono />
                    ) : null}
                    {source.error ? (
                      <p className="px-[8px] py-[12px] text-[13px]" style={{ color: "var(--red)" }}>
                        {source.error}
                      </p>
                    ) : fileCode === null ? (
                      <p role="status" className="px-[8px] py-[12px] text-[13px]" style={{ color: "var(--ink-3)" }}>
                        Loading {activeFile}…
                      </p>
                    ) : (
                      <CodeBlock code={fileCode} language={activeFile.endsWith(".css") ? "css" : "tsx"} />
                    )}
                  </CodeSection>

                  {block.howItWorks ? (
                    <CodeSection title="How it works" copy={block.howItWorks} copyLabel="How it works">
                      <p className="px-[8px] pb-[6px] text-[13.5px] leading-[1.65]" style={{ color: "var(--ink-2)" }}>
                        {block.howItWorks}
                      </p>
                    </CodeSection>
                  ) : null}
                </div>
              )}
            </div>
          </section>

          {/* Details */}
          <aside className="flex w-full shrink-0 flex-col border-t md:w-[380px] md:overflow-y-auto md:border-l md:border-t-0" style={{ borderColor: "var(--line)" }}>
            <div className="flex items-center gap-[10px] px-[16px] pt-[24px] sm:px-[32px] md:px-[24px] md:pt-[40px]">
              <button
                type="button"
                onClick={() => void toggleBookmark("component", block.id, block.title)}
                aria-pressed={saved}
                aria-label={saved ? `Saved ${block.title}` : `Save ${block.title}`}
                title={saved ? "Saved" : "Save"}
                className={round}
                style={roundStyle}
              >
                <Bookmark size={18} strokeWidth={1.875} style={{ fill: saved ? "currentColor" : "none" }} />
              </button>
              <button type="button" onClick={share} aria-label={`Copy a link to ${block.title}`} title="Share" className={round} style={roundStyle}>
                <Link2 size={18} strokeWidth={1.875} />
              </button>
              {source.locked ? (
                <Link
                  href="/pricing"
                  className="flex h-[44px] items-center rounded-full px-[20px] text-[14px] font-medium transition-transform active:scale-[0.97]"
                  style={{ backgroundColor: "var(--ink)", color: "var(--bg)" }}
                >
                  Get Pro
                </Link>
              ) : null}
            </div>

            <div className="flex flex-col px-[16px] pb-[32px] pt-[24px] sm:px-[32px] md:px-[24px]">
              <p className="text-[14px] leading-[1.6]" style={{ color: "var(--ink-2)" }}>
                {block.description}
              </p>

              {block.controls?.length ? (
                <div className="mt-[24px] border-t pt-[24px]" style={{ borderColor: "var(--line)" }}>
                  <Controls controls={block.controls} values={values} onChange={setValue} />
                </div>
              ) : null}

              {block.source ? (
                <p className="mt-[18px] text-[12px]" style={{ color: "var(--ink-3)" }}>
                  Based on{" "}
                  {block.source.url ? (
                    <a href={block.source.url} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">
                      {block.source.name}
                    </a>
                  ) : (
                    block.source.name
                  )}
                  {block.source.license ? ` · ${block.source.license}` : ""}
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
