import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ApplyForm } from "@/components/apply/ApplyForm";

export const metadata: Metadata = {
  title: "Apply for a Custom Build",
  description:
    "Tell us the decision your company needs to make and the data you have. Seven short steps; drafts save as you go.",
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ planner?: string; source?: string }>;
}) {
  const { planner, source } = await searchParams;

  return (
    <section className="section-pad">
      <div className="container-site max-w-3xl space-y-8">
        <header className="space-y-4">
          <Eyebrow>Application · 7 steps · drafts save locally</Eyebrow>
          <h1 className="text-[clamp(2.25rem,4.5vw,3.5rem)]">Apply for a Custom Build.</h1>
          <p className="text-mute">
            The better this application, the better the first conversation. It replaces the first
            half hour of a discovery call — specifics beat polish.
          </p>
        </header>
        <ApplyForm plannerToken={planner} source={source} />
      </div>
    </section>
  );
}
