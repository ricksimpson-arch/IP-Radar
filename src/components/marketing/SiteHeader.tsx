"use client";

import Link from "next/link";
import { useState } from "react";
import { copy } from "@/content/copy";
import { ButtonLink } from "@/components/ui/Button";

const links = [
  { href: "/capabilities", label: copy.nav.capabilities },
  { href: "/work", label: copy.nav.work },
  { href: "/method", label: copy.nav.method },
  { href: "/engagements", label: copy.nav.engagements },
  { href: "/planner", label: copy.nav.planner },
  { href: "/about", label: copy.nav.about },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink-900/95 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-[family-name:var(--font-display)] text-lg font-semibold">
          {copy.site.name}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-mute transition-colors duration-120 hover:text-paper">
              {l.label}
            </Link>
          ))}
          <ButtonLink href="/apply" className="text-sm">
            {copy.nav.apply}
          </ButtonLink>
        </nav>

        <button
          type="button"
          className="min-h-11 min-w-11 rounded-[var(--r-sm)] border border-line px-3 text-sm lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <nav id="mobile-menu" aria-label="Primary mobile" className="border-t border-line bg-ink-900 lg:hidden">
          <div className="container-site flex flex-col gap-1 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="min-h-11 content-center rounded-[var(--r-sm)] px-2 py-2 text-mute hover:bg-ink-700 hover:text-paper"
              >
                {l.label}
              </Link>
            ))}
            <ButtonLink href="/apply" className="mt-2" onClick={() => setOpen(false)}>
              {copy.nav.apply}
            </ButtonLink>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
