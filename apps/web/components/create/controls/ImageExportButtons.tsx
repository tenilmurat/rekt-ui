"use client";

import { Download } from "lucide-react";
import { Icon } from "@/components/shell/Icon";
import { canvasToBlob, downloadCanvas } from "@/lib/create/export";
import { useToast } from "@/lib/toast";

/**
 * Copy and Download for anything that can draw itself onto a canvas.
 *
 * Copy always writes PNG — it is the only image type browsers reliably accept
 * on the clipboard — while Download keeps the format the tool asks for.
 */
export function ImageExportButtons({
  render,
  filename,
  type = "image/png",
  quality,
  label = "image",
}: {
  render: () => HTMLCanvasElement | null;
  filename: string;
  type?: string;
  quality?: number;
  /** Used in the toast, e.g. "ASCII image copied". */
  label?: string;
}) {
  const toast = useToast();

  async function copyImage() {
    const canvas = render();
    const blob = canvas ? await canvasToBlob(canvas) : null;
    if (!blob) {
      toast("Nothing to copy yet", "warn");
      return;
    }

    try {
      if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
        throw new Error("no image clipboard");
      }
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast(`${label.charAt(0).toUpperCase()}${label.slice(1)} copied to clipboard`);
    } catch {
      toast("This browser won't copy images — use Download", "warn");
    }
  }

  function download() {
    const canvas = render();
    if (!canvas) {
      toast("Nothing to download yet", "warn");
      return;
    }
    downloadCanvas(canvas, filename, type, quality);
    toast(`Saved ${filename}`);
  }

  const chrome =
    "control flex items-center rounded-[8px] border p-[6px] active:scale-[0.96] disabled:opacity-40";
  const style = { backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)" } as const;

  return (
    <>
      <button
        type="button"
        onClick={copyImage}
        aria-label={`Copy the ${label}`}
        title="Copy image"
        className={chrome}
        style={style}
      >
        <Icon name="copy" />
      </button>

      <button
        type="button"
        onClick={download}
        aria-label={`Download the ${label}`}
        title="Download"
        className={chrome}
        style={style}
      >
        <Download size={16} strokeWidth={1.875} style={{ color: "var(--icon)" }} />
      </button>
    </>
  );
}
