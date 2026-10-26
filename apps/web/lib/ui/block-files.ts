import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { SourceFile, UiBlockMeta } from "@/lib/ui/types";

const BLOCKS_DIR = path.join(process.cwd(), "components", "blocks");

/** A component's files exactly as they sit in components/blocks/<id>/, in `meta.files` order. */
export async function readBlockFiles(meta: UiBlockMeta): Promise<SourceFile[]> {
  return Promise.all(
    meta.files.map(async (name) => ({
      path: name,
      code: await readFile(path.join(BLOCKS_DIR, meta.id, name), "utf8"),
    })),
  );
}
