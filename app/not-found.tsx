import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70dvh] flex-col items-center justify-center gap-[12px] px-[20px] text-center">
      <h1 className="text-[15px] font-medium" style={{ color: "var(--ink-title)" }}>
        Not found
      </h1>
      <p className="text-[13px]" style={{ color: "var(--ink-2)" }}>
        That page or component isn&apos;t here.
      </p>
      <Link
        href="/"
        className="mt-[8px] rounded-full border px-[14px] py-[7px] text-[12.5px] font-medium"
        style={{ borderColor: "var(--line)", color: "var(--ink)" }}
      >
        Back to UI
      </Link>
    </main>
  );
}
