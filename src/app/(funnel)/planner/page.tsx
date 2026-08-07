import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PlannerWizard } from "@/components/planner/PlannerWizard";

export const metadata: Metadata = {
  title: "Project planner",
  description:
    "Answer six questions and get a deterministic system outline: architecture, modules, data plan, timeline bands, and risks.",
};

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ detail?: string }>;
}) {
  const { detail } = await searchParams;

  return (
    <section className="section-pad">
      <div className="container-site max-w-3xl space-y-8">
        <header className="space-y-4">
          <Eyebrow>Planner · 6 inputs · deterministic outline</Eyebrow>
          <h1 className="text-[clamp(2.25rem,4.5vw,3.5rem)]">Plan your system.</h1>
          <p className="text-mute">
            Six questions, then a system outline built by a transparent rules engine — the same
            kind of model we build for clients. No email required to see the result.
          </p>
        </header>
        <PlannerWizard initialDetail={detail?.slice(0, 280)} />
      </div>
    </section>
  );
}
