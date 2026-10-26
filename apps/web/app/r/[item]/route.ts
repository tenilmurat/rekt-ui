import { notFound } from "next/navigation";
import { readBlockFiles } from "@/lib/ui/block-files";
import { BLOCK_METAS, getMeta } from "@/lib/ui/metas";

/**
 * A component as a shadcn registry item, so it installs with one command:
 *   npx shadcn@latest add https://<site>/r/rolling-counter.json
 * The files land in the project's components folder under rekt-ui/, and the
 * npm dependencies are installed with them.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return BLOCK_METAS.map((m) => ({ item: `${m.id}.json` }));
}

export async function GET(_: Request, { params }: { params: Promise<{ item: string }> }) {
  const meta = getMeta((await params).item.replace(/\.json$/, ""));
  if (!meta) notFound();
  const files = await readBlockFiles(meta);

  return Response.json({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: meta.id,
    type: "registry:component",
    title: meta.title,
    description: meta.description,
    author: "Rekt UI",
    dependencies: meta.dependencies ?? [],
    files: files.map((f) =>
      f.path.endsWith(".css")
        ? { path: `rekt-ui/${meta.id}/${f.path}`, type: "registry:file", target: `@components/rekt-ui/${f.path}`, content: f.code }
        : { path: `rekt-ui/${meta.id}/${f.path}`, type: "registry:component", target: `@components/rekt-ui/${f.path}`, content: f.code },
    ),
    categories: [meta.category],
    docs: `Import it with \`import { ${meta.name} } from "@/components/rekt-ui/${meta.files[0].replace(/\.tsx$/, "")}"\` and its stylesheet once.`,
  });
}
