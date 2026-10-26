import type { Metadata } from "next";

export const metadata: Metadata = { title: "Account & billing — Rekt Studio", robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
