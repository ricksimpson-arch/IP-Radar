import type { Metadata } from "next";
import { standards } from "@/lib/data/method";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/ui/CTASection";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: "Analytical standards",
  description:
    "The seven standards every delivered system follows: transparent formulas, traceable sources, confidence scores, freshness monitoring, and more.",
};

export default function StandardsPage() {
  return (
    <>
      <section className="section-pad">
        <div className="container-site space-y-12">
          <SectionHeader
            eyebrow={`Standards · ${standards.length} principles`}
            title="Analytical standards."
            lede="Each principle comes with how it concretely appears in a delivered system — not just the claim."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {standards.map((s) => (
              <article key={s.title} className="rounded-[var(--r-md)] border border-line bg-ink-700 p-6">
                <h2 className="text-xl">{s.title}</h2>
                <p className="mt-2 text-mute">{s.description}</p>
                <div className="mt-4 border-t border-line pt-4">
                  <h3 className="eyebrow-label text-faint">In a delivered system</h3>
                  <p className="mt-1 text-sm text-mute">{s.exampleInSystem}</p>
                </div>
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
