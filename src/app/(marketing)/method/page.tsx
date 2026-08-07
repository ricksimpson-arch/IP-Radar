import type { Metadata } from "next";
import Link from "next/link";
import { methodPhases } from "@/lib/data/method";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/ui/CTASection";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: "Method",
  description:
    "How Market Analytica builds a decision system: discovery, research and modeling, platform development, launch and improvement.",
};

export default function MethodPage() {
  return (
    <>
      <section className="section-pad">
        <div className="container-site space-y-12">
          <SectionHeader
            eyebrow="Method · 4 phases"
            title="How it works."
            lede="Every build runs the same four phases. The numbered sequence below is the only place on this site that gets numbered markers — because this content genuinely is a sequence."
          />
          <ol className="space-y-6">
            {methodPhases.map((phase) => (
              <li
                key={phase.number}
                className="grid gap-6 rounded-[var(--r-md)] border border-line bg-ink-700 p-6 md:grid-cols-[auto_1fr]"
              >
                <div className="data-figure text-3xl text-faint">
                  {String(phase.number).padStart(2, "0")}
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-2xl">{phase.title}</h2>
                    <span className="data-figure text-sm text-mute">{phase.durationBand}</span>
                  </div>
                  <p className="text-mute">{phase.whatHappens}</p>
                  <div className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <h3 className="eyebrow-label text-faint">You provide</h3>
                      <p className="mt-1 text-mute">{phase.clientProvides}</p>
                    </div>
                    <div>
                      <h3 className="eyebrow-label text-faint">You receive</h3>
                      <p className="mt-1 text-mute">{phase.clientReceives}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-mute">
            The rules behind every phase are published:{" "}
            <Link href="/method/standards" className="underline underline-offset-4 hover:text-paper">
              read the seven analytical standards
            </Link>
            .
          </p>
        </div>
      </section>
      <CTASection
        headline={copy.home.finalCta.headline}
        sub={copy.home.finalCta.sub}
        ctaLabel={copy.home.hero.primaryCta}
        ctaHref="/apply"
      />
    </>
  );
}
