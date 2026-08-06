import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms governing use of the Market Analytica website.",
};

// TODO(copy): counsel review before launch.
export default function TermsPage() {
  return (
    <article className="section-pad">
      <div className="container-site max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl">Terms of use</h1>
          <p className="data-figure text-sm text-faint">Version 1.0 · Effective 2026-08-06</p>
        </header>
        <section className="space-y-3 text-mute">
          <h2 className="text-2xl text-paper">Use of this site</h2>
          <p>
            This site describes Market Analytica&rsquo;s services and collects build applications.
            Submitting an application starts a conversation; it does not create an engagement.
            Engagements are governed by a separate written agreement.
          </p>
        </section>
        <section className="space-y-3 text-mute">
          <h2 className="text-2xl text-paper">Planner outlines are not advice</h2>
          <p>
            The project planner produces an indicative outline from your inputs. Timelines, scope,
            and risks in an outline are starting hypotheses confirmed in discovery, not
            commitments or professional advice.
          </p>
        </section>
        <section className="space-y-3 text-mute">
          <h2 className="text-2xl text-paper">Intellectual property</h2>
          <p>
            Site content is owned by Market Analytica. Franchise and brand names appearing in
            published analysis are subjects of market analysis; their inclusion implies no
            affiliation, endorsement, or license from any rights holder.
          </p>
        </section>
        <section className="space-y-3 text-mute">
          <h2 className="text-2xl text-paper">Liability</h2>
          <p>
            The site is provided as-is. To the extent permitted by law, Market Analytica is not
            liable for decisions made on the basis of published material or planner output.
          </p>
        </section>
      </div>
    </article>
  );
}
