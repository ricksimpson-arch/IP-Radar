import type { Metadata } from "next";
import Link from "next/link";
import { lootSignal } from "@/lib/data/caseStudy";
import { snowFlurry } from "@/lib/data/snowFlurry";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies of decision-intelligence systems: LootSignal and SnowFlurry.",
};

const caseStudies = [
  { slug: lootSignal.slug, eyebrow: lootSignal.eyebrow, title: lootSignal.title, question: lootSignal.question },
  { slug: snowFlurry.slug, eyebrow: snowFlurry.eyebrow, title: snowFlurry.title, question: snowFlurry.question },
] as const;

// Per SPEC.md §14.1: empty credibility slots render nothing — no fake entries.
export default function WorkIndexPage() {
  return (
    <section className="section-pad">
      <div className="container-site space-y-10">
        <SectionHeader
          eyebrow={`Case studies · ${caseStudies.length} published`}
          title="Systems we can show."
          lede="Client work is confidential by default; we publish a case study only when everything in it can be shown honestly."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {caseStudies.map((cs) => (
            <Link key={cs.slug} href={`/work/${cs.slug}`} className="group">
              <Card className="h-full transition-colors duration-120 group-hover:bg-ink-600">
                <p className="eyebrow-label data-figure text-faint">{cs.eyebrow}</p>
                <h2 className="mt-3 text-2xl">{cs.title}</h2>
                <p className="mt-2 text-mute">{cs.question}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
