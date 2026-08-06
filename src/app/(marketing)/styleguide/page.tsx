import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfidenceChip } from "@/components/ui/ConfidenceChip";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceTag } from "@/components/ui/SourceTag";
import { StatBlock } from "@/components/ui/StatBlock";

export const metadata: Metadata = {
  title: "Styleguide",
  description: "Design tokens and components — internal reference.",
  robots: { index: false },
};

const swatches = [
  ["--ma-ink-900", "Page base"],
  ["--ma-ink-800", "Section base"],
  ["--ma-ink-700", "Card surface"],
  ["--ma-ink-600", "Raised surface"],
  ["--ma-line", "Hairlines"],
  ["--ma-paper", "Primary text"],
  ["--ma-mute", "Secondary text"],
  ["--ma-faint", "Labels only"],
  ["--ma-signal", "Data + primary action ONLY"],
  ["--ma-cyan", "Second data series"],
  ["--ma-amber", "Medium confidence"],
  ["--ma-coral", "Low confidence / risk"],
] as const;

export default function StyleguidePage() {
  return (
    <div className="section-pad">
      <div className="container-site space-y-16">
        <SectionHeader
          eyebrow="Styleguide · internal"
          title="Tokens and components."
          lede="Reference for every reusable piece. If a component state isn't here, it doesn't exist yet."
        />

        <section className="space-y-4">
          <h2 className="text-2xl">Color tokens</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {swatches.map(([token, note]) => (
              <div key={token} className="rounded-[var(--r-sm)] border border-line p-3">
                <div className="h-10 rounded-[var(--r-sm)] border border-line" style={{ background: `var(${token})` }} />
                <p className="data-figure mt-2 text-xs">{token}</p>
                <p className="text-xs text-mute">{note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl">Type</h2>
          <p className="text-[clamp(2.75rem,6vw,5rem)] font-semibold tracking-[-0.02em]">Display</p>
          <p>Body — Inter with cv05/ss01/tnum, 1.0625rem at 1.65 line height.</p>
          <p className="data-figure">Data — 1,240.52 in mono, tabular numerals, model output only.</p>
          <p className="eyebrow-label text-faint">Label · uppercase · 0.08em</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
            <ButtonLink href="/styleguide" variant="secondary">
              As link
            </ButtonLink>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl">Data provenance</h2>
          <div className="flex flex-wrap items-center gap-3">
            <ConfidenceChip level="high" />
            <ConfidenceChip level="medium" />
            <ConfidenceChip level="low" />
            <SourceTag sourceType="observed" asOf="2026-07-01" />
            <SourceTag sourceType="modeled" asOf="2026-07-01" />
          </div>
          <div className="max-w-xs">
            <StatBlock
              stat={{ label: "Example figure", value: "52", sourceType: "observed", asOf: "2026-07-01", confidence: "high" }}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl">Surfaces</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <Eyebrow>Card · default</Eyebrow>
              <p className="mt-2 text-sm text-mute">Elevation via 1px line border, not drop shadow.</p>
            </Card>
            <DisclaimerBanner variant="ip" />
          </div>
        </section>
      </div>
    </div>
  );
}
