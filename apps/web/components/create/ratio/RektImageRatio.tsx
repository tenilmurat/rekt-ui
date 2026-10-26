"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CustomRatioInputs } from "@/components/create/ratio/CustomRatioInputs";
import { RatioSelector } from "@/components/create/ratio/RatioSelector";
import { FileUpload } from "@/components/create/controls/FileUpload";
import { ImageExportButtons } from "@/components/create/controls/ImageExportButtons";
import { RektBadge } from "@/components/shell/ToolShell";
import { loadImage } from "@/lib/create/ascii/ascii";
import {
  cropToRatio,
  outputTypeFor,
  ratioFilename,
  ratioValue,
  type RatioId,
} from "@/lib/create/ratio/ratio";

const TOOL_NAME = "Image Ratio";
const ACCEPT = ["image/png", "image/jpeg", "image/webp"];

export function RektImageRatio({ expanded = false }: { expanded?: boolean }) {
  const [file, setFile] = useState<{ name: string; type: string } | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ratio, setRatio] = useState<RatioId>("original");
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);

  const urlRef = useRef<string | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const clearUrl = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, []);
  useEffect(() => clearUrl, [clearUrl]);

  const onFile = useCallback(
    async (picked: File) => {
      if (!ACCEPT.includes(picked.type)) {
        setError(`${picked.type || "That file"} isn't supported — use PNG, JPG or WEBP`);
        return;
      }
      setError(null);
      clearUrl();
      const url = URL.createObjectURL(picked);
      urlRef.current = url;
      try {
        const loaded = await loadImage(url);
        setImage(loaded);
        setFile({ name: picked.name, type: picked.type });
      } catch {
        clearUrl();
        setImage(null);
        setFile(null);
        setError("That image could not be read");
      }
    },
    [clearUrl],
  );

  // The crop is the export: one full-resolution canvas, shown scaled and saved as-is.
  const canvas = useMemo(() => {
    if (!image) return null;
    return cropToRatio(image, ratioValue(ratio, width, height));
  }, [image, ratio, width, height]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.replaceChildren();
    if (!canvas) return;
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
    canvas.style.objectFit = "contain";
    canvas.style.borderRadius = "6px";
    canvas.setAttribute("aria-label", "Cropped preview");
    stage.appendChild(canvas);
  }, [canvas]);

  const output = outputTypeFor(file?.type ?? null);

  const display = (
    <div
      className="relative overflow-hidden rounded-[16px] border"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--line)",
        height: expanded ? "100%" : 360,
        flex: expanded ? "1 1 auto" : undefined,
        minWidth: 0,
      }}
    >
      {expanded ? (
        <div className="absolute left-[23px] top-[19px] z-10">
          <RektBadge size={30} />
        </div>
      ) : null}

      <div className="absolute right-[19px] top-[19px] z-10 flex items-center gap-[8px]">
        <ImageExportButtons
          render={() => canvas}
          filename={ratioFilename(ratio, output.extension)}
          type={output.type}
          quality={output.quality}
          label="image"
        />
      </div>

      <div className="flex h-full w-full items-center justify-center p-[24px] pt-[64px]">
        {canvas ? (
          <div ref={stageRef} className="flex h-full w-full items-center justify-center" />
        ) : (
          <p className="text-[13px]" style={{ color: "var(--ink-3)" }}>
            Upload an image to begin
          </p>
        )}
      </div>
    </div>
  );

  const controls = (
    <>
      <FileUpload
        id="rekt-ratio-file"
        label="Image"
        chooseLabel="Upload Image"
        accept="image/png,image/jpeg,image/webp"
        fileName={file?.name ?? null}
        onFile={onFile}
        onClear={() => {
          clearUrl();
          setImage(null);
          setFile(null);
          setError(null);
        }}
        error={error}
      />

      <RatioSelector value={ratio} onChange={setRatio} />

      {ratio === "custom" ? (
        <CustomRatioInputs width={width} height={height} onWidth={setWidth} onHeight={setHeight} />
      ) : null}

      {canvas ? (
        <p className="font-mono text-[12px]" style={{ color: "var(--ink-3)" }}>
          {canvas.width} × {canvas.height} · {output.extension.toUpperCase()}
        </p>
      ) : null}
    </>
  );

  if (expanded) {
    return (
      <div className="flex h-full w-full gap-[8px]">
        {display}

        <aside
          aria-label="Image Ratio settings"
          className="no-scrollbar flex h-full w-[280px] shrink-0 flex-col gap-[20px] overflow-y-auto rounded-[16px] border p-[20px]"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--line)" }}
        >
          <div className="flex flex-col gap-[4px]">
            <p className="text-[13px] font-medium tracking-[-0.13px]" style={{ color: "var(--ink-title)" }}>
              {TOOL_NAME}
            </p>
            <p className="text-[12px] tracking-[-0.12px]" style={{ color: "var(--ink-3)" }}>
              by Rekt UI
            </p>
          </div>

          <div className="h-px w-full" style={{ backgroundColor: "var(--line)" }} />

          {controls}
        </aside>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-[24px]">
      {display}
      <div className="flex flex-col gap-[20px]">{controls}</div>
    </div>
  );
}

export default RektImageRatio;
