"use client";

import { Upload, X } from "lucide-react";

/**
 * Pick a file, replace it, remove it. Client-side only: the parent holds the
 * object URL and revokes it when it changes or the tool goes away.
 */
export function FileUpload({
  id,
  label,
  chooseLabel,
  accept,
  fileName,
  onFile,
  onClear,
  error,
}: {
  id: string;
  label: string;
  chooseLabel: string;
  accept: string;
  fileName: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
  error?: string | null;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center gap-[8px]">
        <Upload size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} aria-hidden="true" />
        <p className="text-[12px] tracking-[-0.12px]" style={{ color: "var(--ink-3)" }}>
          {label}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-[6px]">
        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = ""; // picking the same file again still fires
          }}
        />

        <label
          htmlFor={id}
          className="control flex cursor-pointer items-center gap-[6px] rounded-[8px] border px-[10px] py-[6px] text-[12px] font-medium"
          style={{
            backgroundColor: "var(--control-bg)",
            borderColor: "var(--control-line)",
            color: "var(--ink)",
          }}
        >
          {fileName ? "Replace" : chooseLabel}
        </label>

        {fileName ? (
          <>
            <span
              className="max-w-[140px] truncate font-mono text-[12px]"
              style={{ color: "var(--ink-2)" }}
              title={fileName}
            >
              {fileName}
            </span>
            <button
              type="button"
              onClick={onClear}
              aria-label="Remove the uploaded file"
              title="Remove"
              className="control flex items-center rounded-[8px] border p-[6px]"
              style={{ backgroundColor: "var(--control-bg)", borderColor: "var(--control-line)" }}
            >
              <X size={14} strokeWidth={1.875} style={{ color: "var(--icon)" }} />
            </button>
          </>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-[12px]" style={{ color: "var(--red)" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
