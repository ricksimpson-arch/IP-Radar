import Link from "next/link";
import { EconomicLayer, computeWaterfall } from "@ip-radar/economics";
import { listDemoOpportunities } from "@ip-radar/demo-data";

/**
 * Opportunity portfolio (§6.2). Default sort is pipeline expected
 * contribution. GMS is shown as context only — it is never the ranking key,
 * and unmapped-terms titles rank last with an explicit label, not a score.
 */
export const metadata = { title: "Portfolio — IP Radar" };

function usd(amountCents: number): string {
  return (amountCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function PortfolioPage() {
  const rows = listDemoOpportunities()
    .map((opp) => ({ opp, result: computeWaterfall(opp.economics) }))
    .sort((a, b) => {
      const ev = (r: (typeof a)["result"]) =>
        r.status === "OK"
          ? r.layers[EconomicLayer.PIPELINE_EV].amountCents
          : Number.NEGATIVE_INFINITY;
      return ev(b.result) - ev(a.result);
    });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Opportunity portfolio</h1>
      <p className="mt-2 text-sm text-slate-600">
        Ranked by <strong>pipeline expected contribution</strong> (P10/P50/P90 curves arrive with
        the forecast service in Phase 2). Consumer GMS is context, never the sort key.
      </p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-4 py-3">#</th>
              <th scope="col" className="px-4 py-3">Title</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right">Pipeline EV</th>
              <th scope="col" className="px-4 py-3 text-right">FYUL contribution</th>
              <th scope="col" className="px-4 py-3 text-right text-slate-400">
                Consumer GMS (context)
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ opp, result }, i) => (
              <tr key={opp.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 tabular-nums text-slate-400">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/titles/${opp.id}`} className="font-medium hover:underline">
                    {opp.title}
                  </Link>
                  <div className="text-xs text-slate-500">
                    {opp.rightsholder} · {opp.ipArchetype} · owner: {opp.owner}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {result.status === "TERMS_UNMAPPED" ? (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                      TERMS_UNMAPPED — store layers only
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">
                      terms mapped
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {result.status === "OK"
                    ? usd(result.layers[EconomicLayer.PIPELINE_EV].amountCents)
                    : "blocked"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {result.status === "OK"
                    ? usd(result.layers[EconomicLayer.FYUL_CONTRIBUTION].amountCents)
                    : "blocked"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-400">
                  {usd(result.layers[EconomicLayer.CONSUMER_GMS].amountCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        metric_version metric-v0.placeholder · model_version model-v0.placeholder · snapshot
        snapshot-demo-fixtures
      </p>
    </main>
  );
}
