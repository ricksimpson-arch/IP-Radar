import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContactForm } from "@/components/marketing/ContactForm";

export const metadata: Metadata = {
  title: "Security",
  description:
    "How Market Analytica handles data: hosting, encryption, access control, retention, deletion, and NDA/DPA availability.",
};

const items = [
  {
    title: "Hosting and region",
    body: "The platform runs on managed cloud infrastructure (Vercel for the application, Neon for Postgres, Cloudflare R2 for file storage). Region selection — including EU processing where required — is confirmed per engagement.",
  },
  {
    title: "Encryption",
    body: "Data is encrypted in transit (TLS 1.2+) and at rest on every store. Uploaded files live in a private bucket; access is via short-lived signed URLs only.",
  },
  {
    title: "Access control",
    body: "Admin access is restricted to a named allowlist with magic-link authentication and role-based permissions. Every admin action that changes data is written to an audit log.",
  },
  {
    title: "Subprocessors",
    body: "Vercel (hosting), Neon (database), Cloudflare (file storage), Resend (transactional email), PostHog EU (analytics, consent-gated), Sentry (error monitoring), Cal.com (scheduling). The current list is available on request and updated before any addition.",
  },
  {
    title: "Retention and deletion",
    body: "Submitted applications are retained 36 months from last activity; uploaded files 12 months; abandoned drafts 90 days; planner sessions 180 days before anonymization. Verified-email erasure requests are honored across all stores and confirmed by email.",
  },
  {
    title: "NDA and DPA",
    body: "We sign mutual NDAs before discovery on request, and a DPA is available for any engagement processing personal data.",
  },
  {
    title: "Incident contact",
    body: "Security concerns reach the operator directly via the form below and are acknowledged within one business day.",
  },
] as const;

export default function SecurityPage() {
  return (
    <section className="section-pad">
      <div className="container-site space-y-12">
      <SectionHeader
        eyebrow="Security · 7 commitments"
        title="Data handling, stated plainly."
        lede="Enterprise and investment buyers ask about data handling before price. Here are the answers, on the page."
      />
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.title} className="rounded-[var(--r-md)] border border-line bg-ink-700 p-6">
              <h2 className="text-lg">{item.title}</h2>
              <p className="mt-2 text-sm text-mute">{item.body}</p>
            </article>
          ))}
        </div>
        <div className="max-w-xl space-y-4">
          <h2 className="text-2xl">Request our security summary</h2>
          <ContactForm kind="security_summary" />
        </div>
      </div>
    </section>
  );
}
