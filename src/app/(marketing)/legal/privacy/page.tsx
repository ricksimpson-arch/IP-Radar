import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Market Analytica collects, why, how long it's kept, and your rights.",
};

// TODO(copy): counsel review before launch. Content mirrors the practices
// specified in SPEC.md §15 so the policy and the build cannot drift apart.
export default function PrivacyPage() {
  return (
    <article className="section-pad">
      <div className="container-site max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl">Privacy policy</h1>
          <p className="data-figure text-sm text-faint">Version 1.0 · Effective 2026-08-06</p>
        </header>
        <section className="space-y-3 text-mute">
          <h2 className="text-2xl text-paper">What we collect</h2>
          <p>
            We collect what you give us in the application, planner, and contact forms: name,
            company, business email, and the project details you describe, plus files you choose
            to upload. Analytics events carry no personal data — no email, no company name, no
            free-text content — and analytics runs only after you consent.
          </p>
        </section>
        <section className="space-y-3 text-mute">
          <h2 className="text-2xl text-paper">Why we collect it</h2>
          <p>
            To evaluate and respond to your application, to prepare for a discovery conversation,
            and — with consent — to understand how the site is used. We do not sell personal data.
          </p>
        </section>
        <section className="space-y-3 text-mute">
          <h2 className="text-2xl text-paper">How long we keep it</h2>
          <p>
            Submitted applications: 36 months from last activity. Uploaded files: 12 months.
            Abandoned drafts: 90 days. Planner sessions: 180 days, then anonymized. These windows
            are enforced automatically.
          </p>
        </section>
        <section className="space-y-3 text-mute">
          <h2 className="text-2xl text-paper">Your rights</h2>
          <p>
            You can request access to, correction of, or deletion of your data at any time via the
            contact page. Deletion requests are verified by email and honored across all our
            stores, with confirmation sent when complete.
          </p>
        </section>
        <section className="space-y-3 text-mute">
          <h2 className="text-2xl text-paper">Processors</h2>
          <p>
            We use a small set of infrastructure providers listed on the security page. Each
            processes data only on our instructions.
          </p>
        </section>
      </div>
    </article>
  );
}
