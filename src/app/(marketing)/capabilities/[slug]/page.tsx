import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { capabilities, getCapability } from "@/lib/data/capabilities";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CTASection } from "@/components/ui/CTASection";
import { copy } from "@/content/copy";

export function generateStaticParams() {
  return capabilities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const capability = getCapability(slug);
  if (!capability) return {};
  return { title: capability.title, description: capability.oneLine };
}

export default async function CapabilityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const capability = getCapability(slug);
  if (!capability) notFound();

  return (
    <>
      <article className="section-pad">
        <div className="container-site max-w-3xl space-y-12">
          <header className="space-y-4">
            <Eyebrow>Capability</Eyebrow>
            <h1 className="text-[clamp(2.25rem,4.5vw,3.5rem)]">{capability.title}</h1>
            <p className="text-lg text-mute">{capability.oneLine}</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-2xl">The problem</h2>
            <p className="text-mute">{capability.problem}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">Our approach</h2>
            <p className="text-mute">{capability.approach}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">What you receive</h2>
            <ul className="space-y-2">
              {capability.outputs.map((o) => (
                <li key={o} className="border-l-2 border-line pl-4 text-mute">
                  {o}
                </li>
              ))}
            </ul>
          </section>

          <Card>
            <h2 className="text-lg">Related work</h2>
            <p className="mt-2 text-sm text-mute">
              See how these ideas show up in a shipped system:{" "}
              <Link href="/work/lootsignal" className="underline underline-offset-4 hover:text-paper">
                read the LootSignal case study
              </Link>
              .
            </p>
          </Card>
        </div>
      </article>
      <CTASection
        headline={copy.home.finalCta.headline}
        sub={copy.home.finalCta.sub}
        ctaLabel={copy.home.hero.primaryCta}
        ctaHref="/apply"
      />
    </>
  );
}
