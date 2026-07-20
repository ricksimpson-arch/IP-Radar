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
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
