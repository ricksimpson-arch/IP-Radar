import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContactForm } from "@/components/marketing/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Not ready to apply? Send a question and get a reply within one business day.",
};

export default function ContactPage() {
  return (
    <section className="section-pad">
      <div className="container-site max-w-xl space-y-10">
        <SectionHeader
          eyebrow="Contact · 1 business day reply"
          title="Not ready to apply? Start here."
          lede="Ask a question, sanity-check an idea, or tell us what you're weighing. If the application form is premature, this isn't."
        />
        <ContactForm kind="contact" />
      </div>
    </section>
  );
}
