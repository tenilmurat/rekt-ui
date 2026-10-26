"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { copyText, useToast } from "@/lib/toast";
import type { ComponentItem } from "@/lib/registry/types";

/**
 * Code panel: usage, props, dependencies, notes and attribution.
 * External sources are only reproduced when redistribution is allowed
 * (`code.sourceIncluded`); otherwise we show usage and link to the original.
 */
export function CodeDetails({
  item,
  open,
  onClose,
}: {
  item: ComponentItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const { plan } = useSession();
  // Pro source comes from rektui-backend, never from this public repo.
  const [proUsage, setProUsage] = useState<{ id: string; usage: string } | null>(null);
  const proItemId = open && item?.tier === "pro" && plan !== "free" ? item.id : null;

  useEffect(() => {
    if (!proItemId) return;
    let cancelled = false;
    api<{ usage: string }>(`/components/${encodeURIComponent(proItemId)}/source`)
      .then((source) => !cancelled && setProUsage({ id: proItemId, usage: source.usage }))
      .catch(() => !cancelled && setProUsage({ id: proItemId, usage: "// Couldn't load the source — close and try again" }));
    return () => {
      cancelled = true;
    };
  }, [proItemId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item) return null;
  // Pro items keep their code to paying accounts: free visitors see a lock, Pro
  // accounts get the source from the backend (a Pro item's `code.usage` in this
  // repo should only ever be a placeholder).
  const locked = item.tier === "pro" && plan === "free";
  const proLoading = item.tier === "pro" && !locked && proUsage?.id !== item.id;
  const code = locked
    ? undefined
    : item.tier === "pro"
      ? { ...item.code, usage: proLoading ? "// Loading source…" : proUsage!.usage }
      : item.code;
  const title = item.title; // captured: the narrowing above doesn't reach the closure below

  async function copyCode() {
    if (!code) return;
    const ok = await copyText(code.usage);
    toast(
      ok ? `${title} usage copied` : `Couldn't copy ${title} — check clipboard permission`,
      ok ? "done" : "warn",
    );
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`${item.title} code details`}>
      <button
        type="button"
        aria-label="Close code details"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ backgroundColor: "rgba(20,18,16,0.16)" }}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="no-scrollbar animate-fade-up relative flex h-full w-full max-w-[480px] flex-col overflow-y-auto border-l p-[24px]"
        style={{ backgroundColor: "var(--bg)", borderColor: "var(--line)", boxShadow: "var(--shadow-overlay)" }}
      >
        <div className="mb-[20px] flex items-start justify-between gap-[16px]">
          <div>
            <h2 className="text-[15px] font-medium" style={{ color: "var(--ink-title)" }}>
              {item.title}
            </h2>
            <p className="mt-[4px] text-[13px]" style={{ color: "var(--ink-2)" }}>
              {item.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="control rounded-[8px] border px-[10px] py-[6px] text-[12px] font-medium active:scale-[0.96]"
            style={{
              backgroundColor: "var(--control-bg)",
              borderColor: "var(--control-line)",
              color: "var(--ink-2)",
            }}
          >
            Close
          </button>
        </div>

        {locked ? (
          <section
            className="mb-[24px] flex flex-col items-start gap-[10px] rounded-[10px] border p-[16px]"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--line)" }}
          >
            <Lock size={16} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />
            <p className="text-[13px]" style={{ color: "var(--ink)" }}>
              {item.title} is a Pro component. Its code comes with Pro.
            </p>
            <Link
              href="/pricing"
              className="rounded-[8px] px-[12px] py-[6px] text-[12px] font-medium transition-transform active:scale-[0.96]"
              style={{ backgroundColor: "var(--ink)", color: "var(--bg)" }}
            >
              See Pro
            </Link>
          </section>
        ) : (
          <section className="mb-[24px]">
            <div className="mb-[8px] flex items-center justify-between">
              <h3 className="text-[12px] font-medium uppercase tracking-[0.04em]" style={{ color: "var(--ink-3)" }}>
                Usage
              </h3>
              <button
                type="button"
                onClick={copyCode}
                className="control-chip rounded-[6px] px-[8px] py-[4px] text-[12px] font-medium active:scale-[0.96]"
                style={{ backgroundColor: "var(--control-bg)", color: "var(--control-fg)" }}
              >
                {copied ? "Copied" : "Copy code"}
              </button>
            </div>
            <pre
              className="overflow-x-auto rounded-[10px] border p-[14px] font-mono text-[12px] leading-[1.6]"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--line)", color: "var(--ink)" }}
            >
              <code>{code?.usage ?? "// usage coming soon"}</code>
            </pre>
          </section>
        )}

        {code?.props?.length ? (
          <section className="mb-[24px]">
            <h3 className="mb-[8px] text-[12px] font-medium uppercase tracking-[0.04em]" style={{ color: "var(--ink-3)" }}>
              Props
            </h3>
            <dl className="flex flex-col gap-[10px]">
              {code.props.map((prop) => (
                <div key={prop.name} className="flex flex-col gap-[2px]">
                  <dt className="font-mono text-[12px]" style={{ color: "var(--ink)" }}>
                    {prop.name}
                    <span style={{ color: "var(--ink-3)" }}> : {prop.type}</span>
                  </dt>
                  <dd className="text-[12px]" style={{ color: "var(--ink-2)" }}>
                    {prop.description}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {code?.dependencies?.length ? (
          <section className="mb-[24px]">
            <h3 className="mb-[8px] text-[12px] font-medium uppercase tracking-[0.04em]" style={{ color: "var(--ink-3)" }}>
              Dependencies
            </h3>
            <p className="font-mono text-[12px]" style={{ color: "var(--ink-2)" }}>
              {code.dependencies.join(", ")}
            </p>
          </section>
        ) : null}

        {code?.notes?.length ? (
          <section className="mb-[24px]">
            <h3 className="mb-[8px] text-[12px] font-medium uppercase tracking-[0.04em]" style={{ color: "var(--ink-3)" }}>
              Notes
            </h3>
            <ul className="flex list-disc flex-col gap-[6px] pl-[16px] text-[12px]" style={{ color: "var(--ink-2)" }}>
              {code.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-auto border-t pt-[16px]" style={{ borderColor: "var(--line)" }}>
          <h3 className="mb-[6px] text-[12px] font-medium uppercase tracking-[0.04em]" style={{ color: "var(--ink-3)" }}>
            Source
          </h3>
          <p className="text-[12px]" style={{ color: "var(--ink-2)" }}>
            {item.sourceUrl ? (
              <>
                {item.sourceName}{" "}
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-2"
                  style={{ color: "var(--ink)" }}
                >
                  ↗
                </a>
                {item.license ? ` · ${item.license}` : null}
                {code?.sourceIncluded === false
                  ? " · source not redistributed here — install from the original"
                  : null}
              </>
            ) : (
              <>
                {item.sourceName ?? "Rekt UI"}
                {item.license ? ` · ${item.license}` : null}
              </>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
