"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Bookmark, Box, Code2, Link2, Lock, RotateCcw, X } from "lucide-react";
import { CodeBlock, CodeSection, PillTabs } from "@/components/wall/CodeView";
import { Controls } from "@/components/wall/Controls";
import { useSession } from "@/lib/session";
import { copyText, useToast } from "@/lib/toast";
import { INSTALL_DIR, cliCommand, manualInstall, promptFor, rektuiCliPublished, rektuiCommand, usageSnippet } from "@/lib/ui/snippets";
import type { UiBlock } from "@/lib/ui/types";
import { useBlockSource } from "@/lib/ui/use-block-source";
import { useBlockValues } from "@/lib/ui/use-block-values";

/**
 * A component, opened from the wall. Left: the live stage, or the Code tab —
 * Install, Usage (with the tuned props), the real .tsx / .css files and How it
 * works, plus Copy prompt for AI assistants. Right: description, controls,
 * Share and Save. `?c=<id>` keeps it open across reloads and shares.
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
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const Component = block.component;

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

      <div className="animate-pop-in relative flex h-full max-h-[680px] w-full max-w-[1040px] flex-col gap-[10px] md:flex-row">
        {/* Stage */}
        <section
          aria-label={`${block.title} ${view}`}
          className="relative flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-[28px]"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <div className="flex items-center justify-between gap-[8px] p-[12px]">
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
                  aria-label={label}
                  title={label}
                  onClick={() => setView(id)}
                  className="flex size-[34px] items-center justify-center rounded-full transition-colors"
                  style={{
                    backgroundColor: view === id ? "var(--ink)" : "transparent",
                    color: view === id ? "var(--bg)" : "var(--ink-3)",
                  }}
                >
                  <Glyph size={16} strokeWidth={1.875} />
                </button>
              ))}
            </div>

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
                className="control flex size-[36px] items-center justify-center rounded-full border active:scale-[0.94]"
                style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)", color: "var(--icon)" }}
              >
                <RotateCcw size={15} strokeWidth={1.875} />
              </button>
            ) : null}
          </div>

          {view === "preview" ? (
            <div className="flex flex-1 items-center justify-center px-[24px] pb-[48px]">
              <Component key={startedAt} {...values} />
            </div>
          ) : source.locked ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-[12px] px-[24px] pb-[48px] text-center">
              <Lock size={20} strokeWidth={1.75} style={{ color: "var(--icon)" }} aria-hidden="true" />
              <p className="max-w-[300px] text-[14px]" style={{ color: "var(--ink)" }}>
                {block.title} is a Pro component. Its install steps, usage and full source come with Pro.
              </p>
            </div>
          ) : (
            <div className="no-scrollbar flex flex-1 flex-col gap-[10px] overflow-y-auto px-[12px] pb-[12px]">
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
        </section>

        {/* Details */}
        <aside
          className="flex max-h-[48%] w-full shrink-0 flex-col overflow-hidden rounded-[28px] p-[20px] md:max-h-none md:w-[320px]"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <header className="flex flex-col gap-[10px] pb-[18px]">
            <div className="flex items-start justify-between gap-[12px]">
              <h2 id={titleId} className="text-[18px] font-medium tracking-[-0.18px]" style={{ color: "var(--ink-title)" }}>
                {block.title}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="control-quiet -mr-[6px] -mt-[2px] flex size-[32px] shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--control-bg)", color: "var(--control-fg)" }}
              >
                <X size={17} strokeWidth={1.875} />
              </button>
            </div>
            <p className="text-[13.5px] leading-[1.6]" style={{ color: "var(--ink-2)" }}>
              {block.description}
            </p>
          </header>

          <div className="no-scrollbar flex-1 overflow-y-auto py-[4px]">
            {block.controls?.length ? <Controls controls={block.controls} values={values} onChange={setValue} /> : null}
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

          <div className="flex flex-col gap-[8px] pt-[14px]">
            <button
              type="button"
              onClick={share}
              className="control flex h-[44px] items-center justify-center gap-[8px] rounded-full border text-[14px] font-medium active:scale-[0.98]"
              style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)", color: "var(--ink)" }}
            >
              <Link2 size={16} strokeWidth={1.875} />
              Share
            </button>
            {source.locked ? (
              <Link
                href="/pricing"
                className="flex h-[44px] items-center justify-center rounded-full text-[14px] font-medium transition-transform active:scale-[0.98]"
                style={{ backgroundColor: "var(--ink)", color: "var(--bg)" }}
              >
                Get Pro
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => void toggleBookmark("component", block.id, block.title)}
                aria-pressed={saved}
                className="flex h-[44px] items-center justify-center gap-[8px] rounded-full text-[14px] font-medium transition-transform active:scale-[0.98]"
                style={{ backgroundColor: "var(--ink)", color: "var(--bg)" }}
              >
                <Bookmark size={16} strokeWidth={1.875} style={{ fill: saved ? "currentColor" : "none" }} />
                {saved ? "Saved" : "Save"}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
