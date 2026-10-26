"use client";

import { ImageExportButtons } from "@/components/create/controls/ImageExportButtons";
import { asciiToCanvas, currentInk } from "@/lib/create/ascii/export";

/** The ASCII result as a picture: the grid drawn onto a canvas, then copied or saved. */
export function AsciiExportButtons({ rows }: { rows: string[] | null }) {
  return (
    <ImageExportButtons
      render={() => (rows && rows.length ? asciiToCanvas(rows, currentInk()) : null)}
      filename="rekt-ascii.png"
      label="ASCII image"
    />
  );
}
