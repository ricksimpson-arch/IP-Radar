import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/ui/CTASection";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: "About",
  description: "Who builds Market Analytica systems, and the point of view behind them.",
};

// Per SPEC.md §14.1: no fabricated bios, headshots, or credentials. Team
// content renders when real content exists. TODO(copy): team bios from Rick.
export default function AboutPage() {
  return (
    <>
      <section className="section-pad">
        <div className="container-site max-w-3xl space-y-12">
          <SectionHeader
            eyebrow="About · point of view"
            title="Analysis should show its work."
            lede="Market Analytica exists because most market research is delivered as a conclusion, and conclusions age badly. Systems age well."
          />
          <div className="space-y-6 text-mute">
            <p>
              We build decision systems, not reports. A report answers a question once; a system
              answers it every week, with current data, visible formulas, and stated confidence.
              The difference shows up the third time the decision comes around.
            </p>
            <p>
              Our conviction, expressed in everything we ship: observed data and modeled estimates
              are kept visibly separate, every figure carries its source and freshness, and every
              model publishes its assumptions and limitations inside the product. If a number
              can&rsquo;t say where it came from, it doesn&rsquo;t ship.
            </p>
            <p>
              LootSignal, our internally-built franchise-scoring system, is the standing proof of
              how we work — read the case study and note that its limitations section is as
              prominent as its features.
            </p>
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
