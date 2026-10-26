import { notFound } from "next/navigation";
import { Suspense } from "react";
import { pageTitle } from "@/lib/brand";
import { LibraryShell } from "@/components/shell/LibraryShell";
import { categories, getCategory } from "@/lib/registry";

export function generateStaticParams() {
  return categories.filter((c) => c.group === "components").map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const found = getCategory(category);
  return { title: pageTitle(found?.name) };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const found = getCategory(category);
  if (!found || found.group !== "components") notFound();

  return (
    <Suspense>
      <LibraryShell category={found} />
    </Suspense>
  );
}
