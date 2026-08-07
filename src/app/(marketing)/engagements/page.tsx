import type { Metadata } from "next";
import { engagementBands } from "@/lib/data/engagements";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/ui/CTASection";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: "Engagements",
  description:
    "Three engagement bands — Focused Model, Decision Platform, Embedded System — with what's included, typical timelines, and what moves a project up a band.",
};

export default function EngagementsPage() {
  return (
    <>
      <section className="section-pad">
        <div className="container-site space-y-12">
          <SectionHeader
            eyebrow={`Engagements · ${engagementBands.length} bands`}
            title="How engagements are scoped."
            lede="Ranges are indicative, never fixed pricing — scope is set in discovery. What changes between bands is automation depth, audience count, and how long we stay involved."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {engagementBands.map((band) => (
              <article key={band.name} className="flex flex-col rounded-[var(--r-md)] border border-line bg-ink-700 p-6">
                <h2 className="text-2xl">{band.name}</h2>
                <p className="data-figure mt-1 text-sm text-mute">{band.range}</p>
                <p className="mt-3 text-sm text-mute">{band.summary}</p>
                <h3 className="eyebrow-label mt-5 text-faint">Included</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-mute">
                  {band.includes.map((item) => (
                    <li key={item} className="border-l-2 border-line pl-3">
                      {item}
                    </li>
                  ))}
                </ul>
                <h3 className="eyebrow-label mt-5 text-faint">Typical timeline</h3>
                <p className="data-figure mt-1 text-sm text-mute">{band.typicalTimeline}</p>
                <h3 className="eyebrow-label mt-5 text-faint">What moves a project up a band</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-mute">
                  {band.scopeDrivers.map((driver) => (
                    <li key={driver} className="border-l-2 border-line pl-3">
                      {driver}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
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
