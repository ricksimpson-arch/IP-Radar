import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IP Radar — FYUL Merch Revenue Platform",
  description:
    "Internal decision platform: probability-weighted FYUL contribution ranking, conditional demand forecasts, and operating-route recommendations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white">
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-3 text-sm"
          >
            <span className="font-semibold">IP Radar</span>
            <a className="hover:underline" href="/">
              Economics bridge
            </a>
            <a className="hover:underline" href="/portfolio">
              Portfolio
            </a>
            <a className="hover:underline" href="/governance">
              Governance
            </a>
            <span className="ml-auto text-xs text-slate-500">
              synthetic demo data · no real IPs or deal terms
            </span>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
