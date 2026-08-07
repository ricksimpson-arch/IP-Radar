import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/content/copy";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Application received",
  description: "What happens next, and how to book a 30-minute conversation.",
  robots: { index: false },
};

const steps = [
  {
    title: "We read it — a person, not a filter",
    body: "Every application is reviewed within one business day. If it's a fit, you'll get a reply with specific questions about your decision and data, not a canned deck.",
  },
  {
    title: "Book the 30-minute conversation",
    body: "The scheduling link arrives with our reply. Because your application carries the specifics, the call starts at the interesting part.",
    // TODO(M5): replace with the Cal.com embed once CALCOM_WEBHOOK_SECRET is configured.
  },
  {
    title: "You receive a written system definition",
    body: "If we both want to proceed, discovery produces a written definition — decisions supported, data plan, phased timeline — before any commitment.",
  },
] as const;

export default function ApplySuccessPage() {
  return (
    <section className="section-pad">
      <div className="container-site max-w-2xl space-y-10">
        <header className="space-y-4">
          <Eyebrow>Application · received</Eyebrow>
          <h1 className="text-[clamp(2.25rem,4.5vw,3.5rem)]">{copy.apply.successHeadline}</h1>
        </header>
        <ol className="space-y-4">
          {steps.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[auto_1fr] gap-4 rounded-[var(--r-md)] border border-line bg-ink-700 p-5">
              <span className="data-figure text-faint">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="text-lg">{s.title}</h2>
                <p className="mt-1 text-sm text-mute">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-mute">
          While you wait,{" "}
          <Link href="/work/lootsignal" className="underline underline-offset-4 hover:text-paper">
            read the LootSignal methodology
          </Link>{" "}
          — it&rsquo;s the clearest picture of how we&rsquo;d approach your system.
        </p>
      </div>
    </section>
  );
}
