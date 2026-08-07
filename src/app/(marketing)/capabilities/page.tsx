import type { Metadata } from "next";
import Link from "next/link";
import { capabilities } from "@/lib/data/capabilities";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/ui/CTASection";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: "Capabilities",
  description:
    "Six capability areas: opportunity scoring, forecasting, competitive intelligence, executive dashboards, data integration, and custom analytics systems.",
};

export default function CapabilitiesPage() {
  return (
    <>
      <section className="section-pad">
        <div className="container-site space-y-10">
          <SectionHeader
            eyebrow={`Capabilities · ${capabilities.length} areas`}
            title="What we build."
            lede="Every engagement combines several of these areas around one or more named decisions. None of them ships as a template."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map((c) => (
              <Link key={c.slug} href={`/capabilities/${c.slug}`} className="group">
                <Card className="h-full transition-colors duration-120 group-hover:bg-ink-600">
                  <h2 className="text-xl">{c.title}</h2>
                  <p className="mt-2 text-sm text-mute">{c.oneLine}</p>
                  <p className="mt-4 text-sm text-mute">{c.problem}</p>
                </Card>
              </Link>
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
