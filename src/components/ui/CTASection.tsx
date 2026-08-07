import { ButtonLink } from "./Button";

export function CTASection({
  headline,
  sub,
  ctaLabel,
  ctaHref,
}: {
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <section className="section-pad border-t border-line bg-ink-800">
      <div className="container-site flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-[clamp(2rem,3.5vw,3rem)]">{headline}</h2>
          <p className="text-mute">{sub}</p>
        </div>
        <ButtonLink href={ctaHref}>{ctaLabel}</ButtonLink>
      </div>
    </section>
  );
}
