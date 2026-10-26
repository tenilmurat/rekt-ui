import Link from "next/link";
import { firstCategory } from "@/lib/registry";

export default function NotFound() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-[12px]">
      <h1 className="text-[15px] font-medium" style={{ color: "var(--ink-title)" }}>
        Not found
      </h1>
      <p className="text-[13px]" style={{ color: "var(--ink-2)" }}>
        That component or tool is not in the registry.
      </p>
      <Link
        href={`/${firstCategory.id}`}
        className="mt-[8px] rounded-[8px] border px-[12px] py-[7px] text-[12px] font-medium"
        style={{ borderColor: "var(--line)", color: "var(--ink)" }}
      >
        Back to {firstCategory.name}
      </Link>
    </main>
  );
}
