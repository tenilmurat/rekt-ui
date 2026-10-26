"use client";

import { FileUpload } from "@/components/create/controls/FileUpload";

const ACCEPT = {
  logo: "image/svg+xml,image/png,image/jpeg,image/webp",
  image: "image/png,image/jpeg,image/webp",
} as const;

export function AsciiFileUpload({
  kind,
  fileName,
  onFile,
  onClear,
  error,
}: {
  kind: "logo" | "image";
  fileName: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
  error?: string | null;
}) {
  return (
    <FileUpload
      id={`rekt-ascii-${kind}`}
      label="Upload"
      chooseLabel={kind === "logo" ? "Choose Logo" : "Choose Image"}
      accept={ACCEPT[kind]}
      fileName={fileName}
      onFile={onFile}
      onClear={onClear}
      error={error}
    />
  );
}
