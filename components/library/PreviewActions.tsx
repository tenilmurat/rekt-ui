"use client";

import { useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Icon, type IconName } from "@/components/shell/Icon";
import { BookmarkButton } from "@/components/site/BookmarkButton";
import { copyText, useToast } from "@/lib/toast";
import type { ComponentItem } from "@/lib/registry/types";

function ActionButton({
  icon,
  glyph,
  label,
  onClick,
  href,
  disabled,
}: {
  icon?: IconName;
  /** For actions with no Figma icon — drawn with lucide instead. */
  glyph?: ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}) {
  const mark = glyph ?? (icon ? <Icon name={icon} /> : null);
  const className = "control flex items-center rounded-[8px] border p-[6px] active:scale-[0.96]";
  const style = {
    backgroundColor: "var(--control-bg)",
    borderColor: "var(--control-line)",
    opacity: disabled ? 0.4 : 1,
  } as const;

  if (href && !disabled) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
        style={style}
        aria-label={label}
        title={label}
      >
        {mark}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {mark}
    </button>
  );
}

export function PreviewActions({
  item,
  deepLink,
  onOpenCode,
  onReplay,
}: {
  item: ComponentItem;
  deepLink: string;
  onOpenCode: () => void;
  /** Passed for one-shot previews (item.replay); plays them again. */
  onReplay?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  function replay() {
    onReplay?.();
    toast(`${item.title} restarted`);
  }

  async function copyLink() {
    const ok = await copyText(deepLink);
    toast(
      ok ? `${item.title} link copied` : `Couldn't copy ${item.title} — check clipboard permission`,
      ok ? "done" : "warn",
    );
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const instructions = item.instructionUrl ?? item.sourceUrl;

  return (
    <div className="flex items-center gap-[8px]">
      <div className="flex items-center gap-[8px]">
        {onReplay ? (
          <ActionButton
            glyph={<RotateCcw size={16} strokeWidth={1.875} style={{ color: "var(--icon)" }} />}
            label={`Play ${item.title} again`}
            onClick={replay}
          />
        ) : null}
        <BookmarkButton kind="component" id={item.id} label={item.title} />
        <ActionButton
          icon="copy"
          label={copied ? "Link copied" : "Copy link to this component"}
          onClick={copyLink}
        />
        <ActionButton icon="code" label="Code details" onClick={onOpenCode} />
        <ActionButton
          icon="info"
          label={
            instructions
              ? `Instructions on ${item.sourceName ?? "the source site"} (opens in a new tab)`
              : "No external documentation"
          }
          href={instructions}
          disabled={!instructions}
        />
      </div>
    </div>
  );
}
