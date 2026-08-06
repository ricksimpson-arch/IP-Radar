import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "The cookies this site sets, by category, and how to change your choices.",
};

// TODO(copy): counsel review before launch. The consent banner itself ships
// in M7 with the analytics wiring; categories below match SPEC.md §15.3.
export default function CookiesPage() {
  return (
    <article className="section-pad">
      <div className="container-site max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl">Cookie policy</h1>
          <p className="data-figure text-sm text-faint">Version 1.0 · Effective 2026-08-06</p>
        </header>
        <section className="space-y-3 text-mute">
          <h2 className="text-2xl text-paper">Necessary</h2>
          <p>
            Session and security cookies required for forms and drafts to work. These cannot be
            switched off.
          </p>
        </section>
        <section className="space-y-3 text-mute">
          <h2 className="text-2xl text-paper">Analytics</h2>
          <p>
            Set only after you consent. Used to measure which pages and steps work, with no
            personal data in any event. Declining changes nothing about what you can do on the
            site.
          </p>
        </section>
        <section className="space-y-3 text-mute">
          <h2 className="text-2xl text-paper">Marketing</h2>
          <p>
            Set only after you consent. Used for attribution of visits to their source so we know
            which channels produce qualified conversations.
          </p>
        </section>
        <section className="space-y-3 text-mute">
          <h2 className="text-2xl text-paper">Changing your choices</h2>
          <p>
            A preferences link in the footer reopens the consent banner at any time. Each decision
            is recorded with the policy version in force when you made it.
          </p>
        </section>
      </div>
    </article>
  );
}
