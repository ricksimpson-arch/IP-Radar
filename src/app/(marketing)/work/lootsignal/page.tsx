import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { lootSignal } from "@/lib/data/caseStudy";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatBlock } from "@/components/ui/StatBlock";
import { WeightDemo } from "@/components/marketing/WeightDemo";

export const metadata: Metadata = {
  title: "LootSignal case study",
  description:
    "How LootSignal scores 52 entertainment franchises across seven weighted dimensions to support licensing and merchandising decisions.",
};

export default function LootSignalPage() {
  return (
    <article className="section-pad">
      <div className="container-site max-w-4xl space-y-16">
        {/* Above the fold: disclaimer is mandatory per SPEC.md §14.2. */}
        <header className="space-y-6">
          <Eyebrow>{lootSignal.eyebrow}</Eyebrow>
          <h1 className="text-[clamp(2.25rem,4.5vw,3.5rem)]">{lootSignal.title}</h1>
          <DisclaimerBanner variant="ip" />
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl">The question the system answers</h2>
          <p className="text-lg text-mute">{lootSignal.question}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl">Scope</h2>
          <p className="text-mute">{lootSignal.scope}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {lootSignal.stats.map((stat) => (
              <StatBlock key={stat.label} stat={stat} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {lootSignal.dimensions.map((d) => (
              <span key={d} className="rounded-[var(--r-sm)] border border-line px-3 py-1 text-sm text-mute">
                {d}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl">Data and research used</h2>
          <ul className="space-y-3">
            {lootSignal.dataSources.map((source) => (
              <li key={source.name} className="rounded-[var(--r-sm)] border border-line p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span>{source.name}</span>
                  <span className="data-figure text-xs text-faint">{source.cadence}</span>
                </div>
                <p className="mt-1 text-sm text-mute">{source.note}</p>
              </li>
            ))}
          </ul>
          <Card>
            <h3 className="text-lg">What was not available</h3>
            <p className="mt-2 text-sm text-mute">{lootSignal.dataNotAvailable}</p>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl">The scoring model</h2>
          <p className="text-mute">
            The model is a weighted sum with explicit, versioned weights. Nothing about it is
            hidden — that is the point.
          </p>
          <pre className="data-figure overflow-x-auto rounded-[var(--r-md)] border border-line bg-ink-800 p-5 text-sm leading-relaxed">
            {lootSignal.formula}
          </pre>
          <WeightDemo />
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl">Features shipped</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {lootSignal.features.map((f) => (
              <li key={f} className="border-l-2 border-line pl-4 text-mute">
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl">Decisions supported</h2>
          <ul className="space-y-2">
            {lootSignal.decisionsSupported.map((d) => (
              <li key={d} className="border-l-2 border-line pl-4 text-mute">
                {d}
              </li>
            ))}
          </ul>
        </section>

        {/* Mandatory section — its presence is the credibility argument (§8.2.8). */}
        <section className="space-y-3">
          <h2 className="text-2xl">Limitations and assumptions</h2>
          <ul className="space-y-2">
            {lootSignal.limitations.map((l) => (
              <li key={l} className="border-l-2 border-amber/40 pl-4 text-mute">
                {l}
              </li>
            ))}
          </ul>
        </section>

        <div>
          <ButtonLink href="/apply?source=lootsignal">{copy.home.caseStudyCta}</ButtonLink>
        </div>
      </div>
    </article>
  );
}
