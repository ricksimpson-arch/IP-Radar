import {
  EconomicLayer,
  computeWaterfall,
  recommendRoute,
  type TitleEconomicsInputs,
} from "@ip-radar/economics";
import { DEMO_ROUTING_WEIGHTS, buildDemoRouteCandidates } from "@ip-radar/demo-data";

/**
 * Routing & capacity view (§6.5): recommended path with reasons, and
 * excluded routes with explanations. Weights are demo placeholders — the
 * real ones are a Phase 0 sign-off, and the routing API has no defaults.
 */
function usd(amountCents: number): string {
  return (amountCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function RoutingPanel({ economics }: { economics: TitleEconomicsInputs }) {
  const waterfall = computeWaterfall(economics);

  if (waterfall.status === "TERMS_UNMAPPED") {
    return (
      <section aria-label="Routing" className="mt-10">
        <h2 className="text-lg font-semibold">Routing &amp; capacity</h2>
        <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Blocked: route scoring needs conditional FYUL contribution, which requires mapped deal
          terms (TERMS_UNMAPPED).
        </p>
      </section>
    );
  }

  const contribution = waterfall.layers[EconomicLayer.FYUL_CONTRIBUTION].amountCents;
  const recommendation = recommendRoute(
    buildDemoRouteCandidates(contribution),
    DEMO_ROUTING_WEIGHTS
  );

  return (
    <section aria-label="Routing" className="mt-10">
      <h2 className="text-lg font-semibold">Routing &amp; capacity</h2>
      <p className="mt-1 text-sm text-slate-600">
        Score = expected contribution − service-risk penalties (delay, quality, stockout, provider
        concentration). Lowest unit cost is not automatically optimal.
      </p>
      {recommendation.recommended ? (
        <p className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Recommended: <strong>{recommendation.recommended.routeId}</strong> (
          {recommendation.recommended.providers.join(" + ")}) — risk-adjusted score{" "}
          {usd(recommendation.recommended.scoreCents)}.
        </p>
      ) : (
        <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No feasible route — every candidate was excluded (reasons below). No recommendation is
          invented.
        </p>
      )}
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-4 py-3">Route</th>
              <th scope="col" className="px-4 py-3 text-right">Risk-adjusted score</th>
              <th scope="col" className="px-4 py-3 text-right">Expected contribution</th>
              <th scope="col" className="px-4 py-3 text-right">Unit cost</th>
              <th scope="col" className="px-4 py-3 text-right">Total penalties</th>
            </tr>
          </thead>
          <tbody>
            {recommendation.ranked.map((route) => {
              const totalPenalties =
                route.penalties.deliveryDelay +
                route.penalties.qualityMiss +
                route.penalties.stockout +
                route.penalties.providerConcentration;
              return (
                <tr key={route.routeId} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {route.routeId}
                    <span className="ml-2 text-xs text-slate-500">
                      {route.providers.join(" + ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{usd(route.scoreCents)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {usd(route.expectedContributionCents)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {(route.unitCostCents / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                    −{usd(totalPenalties)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {recommendation.excluded.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-700">Excluded routes (with reasons)</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {recommendation.excluded.map((e) => (
              <li key={e.routeId}>
                <span className="font-medium">{e.routeId}</span> ({e.providers.join(" + ")}):{" "}
                {e.reasons.join("; ")}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-3 text-xs text-slate-500">
        Penalty weights are demo placeholders pending Phase 0 sign-off (OPEN_QUESTIONS); the
        routing API itself has no default weights.
      </p>
    </section>
  );
}
