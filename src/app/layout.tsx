import type { Metadata } from "next";
import type { ReactNode } from "react";
import { copy } from "@/content/copy";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://marketanalytica.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Market Analytica — Turn market data into a decision system",
    template: "%s — Market Analytica",
  },
  description: copy.home.hero.sub,
  openGraph: {
    siteName: copy.site.name,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--r-sm)] focus:bg-ink-700 focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
