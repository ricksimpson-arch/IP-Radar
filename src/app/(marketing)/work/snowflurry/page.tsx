import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { snowFlurry } from "@/lib/data/snowFlurry";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatBlock } from "@/components/ui/StatBlock";

export const metadata: Metadata = {
  title: "SnowFlurry case study",
  description:
    "How SnowFlurry ranks 300 television series by merchandise and licensing opportunity — nine signals, six weighted criteria, and an honest account of what's automated.",
};

export default function SnowFlurryPage() {
  return (
    <article className="section-pad">
      <div className="container-site max-w-4xl space-y-16">
        {/* Above the fold: disclaimer is mandatory per SPEC.md §14.2. */}
        <header className="space-y-6">
          <Eyebrow>{snowFlurry.eyebrow}</Eyebrow>
          <h1 className="text-[clamp(2.25rem,4.5vw,3.5rem)]">{snowFlurry.title}</h1>
          <DisclaimerBanner variant="ip-snowflurry" />
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl">The question the system answers</h2>
          <p className="text-lg text-mute">{snowFlurry.question}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl">Scope</h2>
          <p className="text-mute">{snowFlurry.scope}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {snowFlurry.stats.map((stat) => (
              <StatBlock key={stat.label} stat={stat} />
            ))}
          </div>
          <div className="overflow-x-auto pt-2">
            <table className="w-full min-w-[480px] text-left text-sm">
              <caption className="sr-only">The six weighted scoring criteria</caption>
              <thead>
                <tr className="border-b border-line text-faint">
                  <th scope="col" className="eyebrow-label py-2 pr-4 font-normal">Criterion</th>
                  <th scope="col" className="eyebrow-label py-2 pr-4 font-normal">Weight</th>
                  <th scope="col" className="eyebrow-label py-2 font-normal">Built from</th>
                </tr>
              </thead>
              <tbody>
                {snowFlurry.criteria.map((c) => (
                  <tr key={c.name} className="border-b border-line">
                    <th scope="row" className="py-2 pr-4 font-medium">{c.name}</th>
                    <td className="data-figure py-2 pr-4 text-mute">{c.weight}</td>
                    <td className="py-2 text-mute">{c.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl">Data and research used</h2>
          <p className="text-mute">
            There is no single feed for &ldquo;TV merchandise demand&rdquo;, so every signal is
            labeled inside the product with how automated it actually is — the honesty is the
            feature.
          </p>
          <ul className="space-y-3">
            {snowFlurry.dataSources.map((source) => (
              <li key={source.name} className="rounded-[var(--r-sm)] border border-line p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span>{source.name}</span>
                  <span className="data-figure text-xs text-faint">{source.automation}</span>
                </div>
                <p className="mt-1 text-sm text-mute">{source.note}</p>
              </li>
            ))}
          </ul>
          <Card>
            <h3 className="text-lg">What was not available</h3>
            <p className="mt-2 text-sm text-mute">{snowFlurry.dataNotAvailable}</p>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl">The scoring model</h2>
          <p className="text-mute">
            Six weighted criteria and a confidence haircut, published in full — inside the product
            and here.
          </p>
          <pre className="data-figure overflow-x-auto rounded-[var(--r-md)] border border-line bg-ink-800 p-5 text-sm leading-relaxed">
            {snowFlurry.formula}
          </pre>
          <p className="text-sm text-mute">{snowFlurry.formulaNote}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl">Features shipped</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {snowFlurry.features.map((f) => (
              <li key={f} className="border-l-2 border-line pl-4 text-mute">
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl">Decisions supported</h2>
          <ul className="space-y-2">
            {snowFlurry.decisionsSupported.map((d) => (
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
            {snowFlurry.limitations.map((l) => (
              <li key={l} className="border-l-2 border-amber/40 pl-4 text-mute">
                {l}
              </li>
            ))}
          </ul>
        </section>

        <div>
          <ButtonLink href="/apply?source=snowflurry">{copy.home.caseStudyCta}</ButtonLink>
        </div>
      </div>
    </article>
  );
}
