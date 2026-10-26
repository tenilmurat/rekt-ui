"use client";

import { useId, useState, type ReactNode } from "react";
import { Highlight, type PrismTheme } from "prism-react-renderer";
import { Check, ChevronRight, Copy } from "lucide-react";
import { copyText, useToast } from "@/lib/toast";

/** Prism colours on this site's tokens, so code follows light and dark. */
const theme: PrismTheme = {
  plain: { color: "var(--ink)", backgroundColor: "transparent" },
  styles: [
    { types: ["comment", "prolog", "doctype", "cdata"], style: { color: "var(--ink-3)", fontStyle: "italic" } },
    { types: ["punctuation", "operator"], style: { color: "var(--ink-3)" } },
    { types: ["string", "attr-value", "number", "boolean", "char", "inserted"], style: { color: "var(--green)" } },
    { types: ["keyword", "atrule", "important"], style: { color: "var(--ink-2)" } },
    { types: ["tag", "class-name", "function", "selector"], style: { color: "var(--ink)" } },
    { types: ["attr-name", "property"], style: { color: "var(--ink)" } },
  ],
};

/** Highlighted code with line numbers. */
export function CodeBlock({ code, language }: { code: string; language: "tsx" | "css" | "plain" }) {
  return (
    <Highlight theme={theme} code={code.replace(/\n$/, "")} language={language === "plain" ? "plaintext" : language}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre
          className="no-scrollbar overflow-x-auto rounded-[14px] py-[14px] font-mono text-[12.5px] leading-[1.75]"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <code className="table min-w-full">
            {tokens.map((line, i) => {
              const { key: _lineKey, ...lineProps } = getLineProps({ line });
              return (
                <span key={i} {...lineProps} className="table-row">
                  <span aria-hidden="true" className="table-cell w-[1%] select-none pl-[16px] pr-[16px] text-right tabular-nums" style={{ color: "var(--ink-3)" }}>
                    {i + 1}
                  </span>
                  <span className="table-cell whitespace-pre pr-[16px]">
                    {line.map((token, j) => {
                      const { key: _tokenKey, ...tokenProps } = getTokenProps({ token });
                      return <span key={j} {...tokenProps} />;
                    })}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      )}
    </Highlight>
  );
}

function CopyButton({ text, label }: { text: string | null; label: string }) {
  const toast = useToast();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      disabled={!text}
      onClick={async () => {
        if (!text) return;
        const ok = await copyText(text);
        toast(ok ? `${label} copied` : "Couldn't copy — check clipboard permission", ok ? "done" : "warn");
        if (!ok) return;
        setDone(true);
        window.setTimeout(() => setDone(false), 1400);
      }}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      className="control-quiet flex size-[32px] items-center justify-center rounded-full disabled:opacity-40"
      style={{ backgroundColor: "var(--control-bg)", color: "var(--control-fg)" }}
    >
      {done ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={1.875} />}
    </button>
  );
}

/**
 * One collapsible part of the Code tab: a header with the title and a copy
 * button, and the body underneath. Several can be open at once.
 */
export function CodeSection({
  title,
  copy,
  copyLabel,
  defaultOpen = false,
  children,
}: {
  title: string;
  /** What the copy button copies; null while it is still loading. */
  copy: string | null;
  copyLabel: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  return (
    <section className="rounded-[20px]" style={{ backgroundColor: "var(--bg)" }}>
      <div className="flex items-center justify-between gap-[8px] py-[6px] pl-[8px] pr-[10px]">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
          className="flex h-[40px] flex-1 items-center gap-[8px] rounded-[12px] px-[8px] text-left text-[14px] font-medium"
          style={{ color: "var(--ink)" }}
        >
          <ChevronRight
            size={15}
            strokeWidth={1.875}
            aria-hidden="true"
            className="transition-transform"
            style={{ color: "var(--ink-3)", transform: open ? "rotate(90deg)" : "none", transitionTimingFunction: "var(--ease-out-strong)" }}
          />
          {title}
        </button>
        <CopyButton text={copy} label={copyLabel} />
      </div>
      {open ? (
        <div id={bodyId} className="px-[10px] pb-[10px]">
          {children}
        </div>
      ) : null}
    </section>
  );
}

/** Small pill tabs inside a section: the install methods, or one tab per file. */
export function PillTabs({
  label,
  items,
  active,
  onSelect,
  mono = false,
}: {
  label: string;
  items: { id: string; label: string }[];
  active: string;
  onSelect: (id: string) => void;
  mono?: boolean;
}) {
  return (
    <div role="tablist" aria-label={label} className="mb-[8px] flex gap-[4px]">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === active}
          onClick={() => onSelect(item.id)}
          className={`h-[28px] rounded-full px-[10px] text-[12px] transition-colors ${mono ? "font-mono" : "font-medium"}`}
          style={{
            backgroundColor: item.id === active ? "var(--surface)" : "transparent",
            color: item.id === active ? "var(--ink)" : "var(--ink-3)",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
