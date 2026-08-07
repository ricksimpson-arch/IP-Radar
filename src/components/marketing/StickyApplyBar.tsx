"use client";

import { useEffect, useState } from "react";
import { copy } from "@/content/copy";
import { ButtonLink } from "@/components/ui/Button";

/** Mobile-only sticky CTA after 60% scroll — SPEC.md §8.1. */
export function StickyApplyBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const progress = window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight);
      setShow(progress > 0.6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink-900/95 p-3 backdrop-blur md:hidden">
      <ButtonLink href="/apply" className="w-full">
        {copy.nav.apply}
      </ButtonLink>
    </div>
  );
}
