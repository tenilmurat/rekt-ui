"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AsciiArt } from "@/components/create/ascii/AsciiArt";
import { AsciiExportButtons } from "@/components/create/ascii/AsciiExportButtons";
import { AsciiFileUpload } from "@/components/create/ascii/AsciiFileUpload";
import { AsciiSourceSelector } from "@/components/create/ascii/AsciiSourceSelector";
import { CharacterSetSelector } from "@/components/create/ascii/CharacterSetSelector";
import { DENSITY, DensityControl } from "@/components/create/ascii/DensityControl";
import { InvertToggle } from "@/components/create/ascii/InvertToggle";
import { RektBadge } from "@/components/shell/ToolShell";
import { DEFAULT_CUSTOM, type CharacterSetId } from "@/lib/create/ascii/charsets";

const TOOL_NAME = "ASCII";

/** Icons live in their own tool; this page converts artwork. */
type FileSource = "logo" | "image";

const ACCEPTED: Record<FileSource, string[]> = {
  logo: ["image/svg+xml", "image/png", "image/jpeg", "image/webp"],
  image: ["image/png", "image/jpeg", "image/webp"],
};

export function RektAscii({ expanded = false }: { expanded?: boolean }) {
  const [sourceType, setSourceType] = useState<FileSource>("image");
  const [upload, setUpload] = useState<{ url: string; name: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [characterSet, setCharacterSet] = useState<CharacterSetId>("classic");
  const [customCharacters, setCustomCharacters] = useState(DEFAULT_CUSTOM);
  const [density, setDensity] = useState<number>(DENSITY.default);
  const [invert, setInvert] = useState(false);
  /** The rendered grid, kept for the image export. */
  const [rows, setRows] = useState<string[] | null>(null);

  // object URLs are revoked as soon as they are replaced, and on unmount
  const urlRef = useRef<string | null>(null);
  const setUploadUrl = useCallback((next: { url: string; name: string } | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next?.url ?? null;
    setUpload(next);
  }, []);
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const onFile = useCallback(
    (file: File, kind: FileSource) => {
      if (!ACCEPTED[kind].includes(file.type)) {
        setUploadError(
          `${file.type || "That file"} isn't supported — use ${kind === "logo" ? "SVG, PNG, JPG or WEBP" : "PNG, JPG or WEBP"}`,
        );
        return;
      }
      setUploadError(null);
      setUploadUrl({ url: URL.createObjectURL(file), name: file.name });
    },
    [setUploadUrl],
  );

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
        <AsciiExportButtons rows={rows} />
      </div>

      <div className="h-full w-full p-[24px] pt-[64px]">
        <AsciiArt
          sourceType={sourceType}
          src={upload?.url ?? null}
          characterSet={characterSet}
          customCharacters={customCharacters}
          density={density}
          invert={invert}
          onGrid={setRows}
        />
      </div>
    </div>
  );

  const filters = (
    <>
      <AsciiSourceSelector
        value={sourceType}
        onChange={(next) => {
          setSourceType(next as FileSource);
          setUploadError(null);
        }}
      />

      <AsciiFileUpload
        kind={sourceType}
        fileName={upload?.name ?? null}
        onFile={(file) => onFile(file, sourceType)}
        onClear={() => {
          setUploadUrl(null);
          setUploadError(null);
        }}
        error={uploadError}
      />

      <CharacterSetSelector
        value={characterSet}
        custom={customCharacters}
        onChange={setCharacterSet}
        onCustomChange={setCustomCharacters}
      />
      <DensityControl value={density} onChange={setDensity} />
      <InvertToggle value={invert} onChange={setInvert} />
    </>
  );

  if (expanded) {
    return (
      <div className="flex h-full w-full gap-[8px]">
        {display}

        <aside
          aria-label="ASCII settings"
          className="no-scrollbar flex h-full w-[280px] shrink-0 flex-col gap-[20px] overflow-y-auto rounded-[16px] border p-[20px]"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--line)" }}
        >
          <div className="flex flex-col gap-[4px]">
            <p className="text-[13px] font-medium tracking-[-0.13px]" style={{ color: "var(--ink-title)" }}>
              {TOOL_NAME}
            </p>
            <p className="text-[12px] tracking-[-0.12px]" style={{ color: "var(--ink-3)" }}>
              by Rekt Studio
            </p>
          </div>

          <div className="h-px w-full" style={{ backgroundColor: "var(--line)" }} />

          {filters}
        </aside>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-[24px]">
      {display}
      <div className="flex flex-col gap-[20px]">{filters}</div>
    </div>
  );
}

export default RektAscii;
