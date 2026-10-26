import { BLOCK_METAS } from "@/lib/ui/metas";

/** The registry's index: every free component Rekt UI hands out, by name. */
export const dynamic = "force-static";

export function GET() {
  return Response.json({
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "rektui",
    homepage: process.env.NEXT_PUBLIC_SITE_URL ?? "",
    items: BLOCK_METAS.map((m) => ({
      name: m.id,
      type: "registry:component",
      title: m.title,
      description: m.description,
      dependencies: m.dependencies ?? [],
      categories: [m.category],
      files: m.files.map((f) => ({
        path: `rekt-ui/${m.id}/${f}`,
        type: f.endsWith(".css") ? "registry:file" : "registry:component",
        target: `@components/rekt-ui/${f}`,
      })),
    })),
  });
}
