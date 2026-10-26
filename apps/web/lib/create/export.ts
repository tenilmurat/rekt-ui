/** Canvas out: the bits both tools share for copying and saving an image. */

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality?: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  type = "image/png",
  quality?: number,
) {
  const link = document.createElement("a");
  link.href = canvas.toDataURL(type, quality);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
