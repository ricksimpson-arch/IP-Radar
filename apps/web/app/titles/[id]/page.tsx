import Link from "next/link";
import { notFound } from "next/navigation";
import { getDemoOpportunity, listDemoOpportunities } from "@ip-radar/demo-data";
import { ScenarioLab } from "./scenario-lab";

/**
 * Title workspace (§6.3): baseline waterfall + scenario lab. Forecast curves,
 * comparables, routing, and the decision log attach here in later phases.
 */
export function generateStaticParams() {
  return listDemoOpportunities().map((o) => ({ id: o.id }));
}

export default async function TitlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = getDemoOpportunity(id);
  if (!opportunity) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/portfolio" className="text-sm text-slate-500 hover:underline">
        ← Portfolio
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{opportunity.title}</h1>
      <p className="mt-1 text-sm text-slate-600">
        {opportunity.rightsholder} · {opportunity.ipArchetype} · status {opportunity.status} ·
        owner {opportunity.owner}
      </p>
      <ScenarioLab
        opportunityId={opportunity.id}
        title={opportunity.title}
        baseline={opportunity.economics}
      />
    </main>
  );
}
