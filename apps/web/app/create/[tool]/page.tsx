import { pageTitle } from "@/lib/brand";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ToolShell } from "@/components/shell/ToolShell";
import { getTool, tools } from "@/lib/registry/tools";

export function generateStaticParams() {
  return tools.map((t) => ({ tool: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const found = getTool(tool);
  return { title: pageTitle(found?.title) };
}

export default async function CreateToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const found = getTool(tool);
  if (!found) notFound();

  return (
    <Suspense>
      <ToolShell tool={found} />
    </Suspense>
  );
}
