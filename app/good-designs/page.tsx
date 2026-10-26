import { Suspense } from "react";
import type { Metadata } from "next";
import { pageTitle } from "@/lib/brand";
import { GoodDesigns } from "@/components/good-designs/GoodDesigns";

export const metadata: Metadata = {
  title: pageTitle("Good designs of X"),
  description: "Real-world interface and web design worth studying, curated by Rekt UI.",
};

export default function GoodDesignsPage() {
  return (
    <Suspense>
      <GoodDesigns />
    </Suspense>
  );
}
