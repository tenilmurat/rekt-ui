import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BRAND } from "@/lib/brand";
import { ThemeProvider } from "next-themes";
import { PreviewStateProvider } from "@/lib/preview-state";
import { ToastProvider } from "@/lib/toast";
import { SessionProvider } from "@/lib/session";
import { SiteHeader } from "@/components/site/SiteHeader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: `${BRAND.tagline} — ${BRAND.name}`,
  description: BRAND.description,
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
