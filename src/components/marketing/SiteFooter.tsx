import Link from "next/link";
import { copy } from "@/content/copy";

const columns = [
  {
    title: "Company",
    links: [
      { href: "/about", label: copy.nav.about },
      { href: "/method", label: copy.nav.method },
      { href: "/engagements", label: copy.nav.engagements },
      { href: "/security", label: copy.nav.security },
      { href: "/contact", label: copy.nav.contact },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/capabilities", label: copy.nav.capabilities },
      { href: "/work/lootsignal", label: "LootSignal case study" },
      { href: "/work/snowflurry", label: "SnowFlurry case study" },
      { href: "/planner", label: "Project planner" },
      { href: "/apply", label: "Apply" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/cookies", label: "Cookies" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink-900">
      <div className="container-site grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold">
            {copy.site.name}
          </p>
          <p className="text-sm text-mute">{copy.site.tagline}</p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={`Footer ${col.title}`}>
            <p className="eyebrow-label mb-3 text-faint">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-mute transition-colors duration-120 hover:text-paper">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-site py-5 text-xs text-faint">
          © {new Date().getFullYear()} Market Analytica. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
