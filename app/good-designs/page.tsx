import { Suspense } from "react";
import type { Metadata } from "next";
import { GoodDesigns } from "@/components/good-designs/GoodDesigns";

export const metadata: Metadata = {
  title: "Good designs of X — Rekt Studio",
  description: "Real-world interface and web design worth studying, curated by Rekt Studio.",
};

export default function GoodDesignsPage() {
  return (
    <Suspense>
      <GoodDesigns />
    </Suspense>
  );
}
