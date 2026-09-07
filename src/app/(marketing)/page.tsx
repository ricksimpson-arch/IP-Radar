import Link from "next/link";
import { copy } from "@/content/copy";
import { capabilities } from "@/lib/data/capabilities";
import { lootSignal } from "@/lib/data/caseStudy";
import { snowFlurry } from "@/lib/data/snowFlurry";
import { methodPhases, standards } from "@/lib/data/method";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PlannerEntry } from "@/components/marketing/PlannerEntry";
import { StickyApplyBar } from "@/components/marketing/StickyApplyBar";
import { HeroDashboard } from "@/components/viz/HeroDashboard";

const featuredCaseStudies = [
  {
    slug: lootSignal.slug,
    eyebrow: lootSignal.eyebrow,
    headline: "LootSignal: ranking 52 franchises for licensing decisions.",
    question: lootSignal.question,
    stats: lootSignal.stats,
    asOf: "2026-07-01",
  },
  {
    slug: snowFlurry.slug,
    eyebrow: snowFlurry.eyebrow,
    headline: "SnowFlurry: ranking 300 television series for merchandise opportunity.",
    question: snowFlurry.question,
    stats: snowFlurry.stats,
    asOf: "2026-09-05",
  },
] as const;

export default function HomePage() {
  return (
    <>
      {/* Block 1 — Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <HeroDashboard />
        <div className="container-site section-pad relative">
          <div className="max-w-2xl space-y-6">
            <h1 className="animate-rise text-[clamp(2.75rem,6vw,5rem)]">
              {copy.home.hero.headline}
            </h1>
            <p className="max-w-xl text-lg text-mute">{copy.home.hero.sub}</p>
            <div className="flex flex-wrap items-center gap-4">
              <ButtonLink href="/apply">{copy.home.hero.primaryCta}</ButtonLink>
              <ButtonLink href="/work" variant="secondary">
                {copy.home.hero.secondaryCta}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Block 2 — Capabilities */}
      <section className="section-pad">
        <div className="container-site space-y-10">
          <SectionHeader
            eyebrow={`Capabilities · ${capabilities.length} areas`}
            title="Systems for the decisions that recur."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c) => (
              <Link key={c.slug} href={`/capabilities/${c.slug}`} className="group">
                <Card className="h-full transition-colors duration-120 group-hover:bg-ink-600">
                  <h3 className="text-xl">{c.title}</h3>
                  <p className="mt-2 text-sm text-mute">{c.oneLine}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Block 3 — Featured case studies */}
      <section className="section-pad border-t border-line bg-ink-800">
        <div className="container-site space-y-10">
          <SectionHeader
            eyebrow="Case studies · 2 published"
            title="Systems we can show working."
            lede="Both are internally-built research systems, published because every figure in them can be shown honestly."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {featuredCaseStudies.map((cs) => (
              <Link key={cs.slug} href={`/work/${cs.slug}`} className="group">
                <Card className="flex h-full flex-col transition-colors duration-120 group-hover:bg-ink-600">
                  <p className="eyebrow-label data-figure text-faint">{cs.eyebrow}</p>
                  <h3 className="mt-3 text-2xl">{cs.headline}</h3>
                  <p className="mt-2 text-sm text-mute">{cs.question}</p>
                  <div className="mt-auto grid grid-cols-3 gap-3 border-t border-line pt-4">
                    {cs.stats.map((stat) => (
                      <div key={stat.label}>
                        <div className="data-figure text-2xl">{stat.value}</div>
                        <div className="text-xs text-mute">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <p className="data-figure mt-3 text-xs text-faint">
                    All figures observed · as of {cs.asOf}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
          <ButtonLink href="/work" variant="secondary">
            {copy.home.hero.secondaryCta}
          </ButtonLink>
        </div>
      </section>

      {/* Block 4 — How it works */}
      <section className="section-pad">
        <div className="container-site space-y-10">
          <SectionHeader eyebrow="Method · 4 phases" title="How a system gets built." />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {methodPhases.map((phase) => (
              <Card key={phase.number}>
                <div className="data-figure text-sm text-faint">
                  {String(phase.number).padStart(2, "0")}
                </div>
                <h3 className="mt-2 text-lg">{phase.title}</h3>
                <p className="mt-2 text-sm text-mute">{phase.whatHappens}</p>
              </Card>
            ))}
          </div>
          <Link href="/method" className="text-sm text-mute underline underline-offset-4 hover:text-paper">
            Read the full method, phase by phase
          </Link>
        </div>
      </section>

      {/* Block 5 — Planner entry */}
      <section className="section-pad border-t border-line bg-ink-800">
        <div className="container-site max-w-3xl space-y-6">
          <Eyebrow>Planner · 6 inputs · deterministic outline</Eyebrow>
          <h2 className="text-[clamp(2rem,3.5vw,3rem)]">{copy.home.plannerEntry.question}</h2>
          <p className="text-mute">
            Answer six questions and get a system outline: recommended architecture, modules, data
            plan, timeline bands, and the risks we&rsquo;d flag — generated by the same kind of
            transparent model we build for clients.
          </p>
          <PlannerEntry />
        </div>
      </section>

      {/* Block 6 — Standards strip */}
      <section className="section-pad">
        <div className="container-site space-y-10">
          <SectionHeader
            eyebrow={`Standards · ${standards.length} principles`}
            title="The rules every delivered system follows."
          />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {standards.map((s) => (
              <li key={s.title}>
                <Link
                  href="/method/standards"
                  className="block h-full rounded-[var(--r-sm)] border border-line p-4 text-sm text-mute transition-colors duration-120 hover:bg-ink-700 hover:text-paper"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Block 7 — Final CTA */}
      <CTASection
        headline={copy.home.finalCta.headline}
        sub={copy.home.finalCta.sub}
        ctaLabel={copy.home.hero.primaryCta}
        ctaHref="/apply"
      />

      <StickyApplyBar />
    </>
  );
}
