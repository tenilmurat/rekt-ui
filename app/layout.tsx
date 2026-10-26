import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { PreviewStateProvider } from "@/lib/preview-state";
import { ToastProvider } from "@/lib/toast";
import { SessionProvider } from "@/lib/session";
import { SiteHeader } from "@/components/site/SiteHeader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "All UI components in one! — Rekt Studio",
  description: "A curated library of UI motion and interface components, by Rekt Studio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <PreviewStateProvider>
            <ToastProvider>
              <SessionProvider>
                <SiteHeader />
                {children}
              </SessionProvider>
            </ToastProvider>
          </PreviewStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
