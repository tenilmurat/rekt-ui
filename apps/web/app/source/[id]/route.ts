import { notFound } from "next/navigation";
import { readBlockFiles } from "@/lib/ui/block-files";
import { BLOCK_METAS, getMeta } from "@/lib/ui/metas";

/**
 * The files of a free component, for the Code tab. Built once into static
 * JSON, so the files aren't shipped in the page bundle. Pro source never lives
 * here: it comes from rektui-backend.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return BLOCK_METAS.map((m) => ({ id: m.id }));
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const meta = getMeta((await params).id);
  if (!meta) notFound();
  return Response.json({ files: await readBlockFiles(meta) });
}
