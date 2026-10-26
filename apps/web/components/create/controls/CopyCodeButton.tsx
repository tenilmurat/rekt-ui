"use client";

import { useState } from "react";
import { Icon } from "@/components/shell/Icon";
import { copyText, useToast } from "@/lib/toast";

/** Copies the <AnimatedCode /> call that reproduces what is on screen. */
export function CopyCodeButton({ snippet, name }: { snippet: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  async function copy() {
    const ok = await copyText(snippet);
    toast(
      ok ? `${name} component copied` : `Couldn't copy ${name} — check clipboard permission`,
      ok ? "done" : "warn",
    );
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Component code copied" : "Copy the component for these settings"}
        title={copied ? "Copied" : "Copy code"}
        className="control flex items-center rounded-[8px] border p-[6px] active:scale-[0.96]"
        style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)" }}
      >
      <Icon name="copy" />
    </button>
  );
}
