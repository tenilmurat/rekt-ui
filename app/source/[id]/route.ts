import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { SourceFile } from "@/lib/ui/types";

/**
 * The files of a free component, exactly as they sit in components/blocks/<id>/
 * (everything except the site's own index.ts). Built once into static JSON, so
 * the Code tab shows the real files without shipping them in the page bundle.
 * Pro source never lives here: it comes from rektui-backend.
 */
const BLOCKS_DIR = path.join(process.cwd(), "components", "blocks");

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const entries = await readdir(BLOCKS_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => ({ id: e.name }));
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dir = path.join(BLOCKS_DIR, id);
  const names = (await readdir(dir)).filter((n) => /\.(tsx|css)$/.test(n));
  // The component first, then its stylesheet.
  names.sort((a, b) => Number(b.endsWith(".tsx")) - Number(a.endsWith(".tsx")) || a.localeCompare(b));
  const files: SourceFile[] = await Promise.all(
    names.map(async (name) => ({ path: name, code: await readFile(path.join(dir, name), "utf8") })),
  );
  return Response.json({ files });
}
