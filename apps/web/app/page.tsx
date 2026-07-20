import Link from "next/link";
import { EconomicLayer, computeWaterfall, type LayeredMoney } from "@ip-radar/economics";
import { getDemoOpportunity } from "@ip-radar/demo-data";

/**
 * FYUL economics bridge (§6.1) — the reference implementation of the
 * five-layer rule. Renders the synthetic demo fixture; every figure on
 * screen is layer-tagged.
 */
const LAYER_LABELS: Record<EconomicLayer, string> = {
  [EconomicLayer.CONSUMER_GMS]: "Consumer GMS",
  [EconomicLayer.STORE_NET_SALES]: "Store Net Sales",
  [EconomicLayer.FYUL_RECOGNIZED]: "FYUL Recognized",
  [EconomicLayer.FYUL_CONTRIBUTION]: "FYUL Contribution",
  [EconomicLayer.PIPELINE_EV]: "Pipeline Expected Value",
};

function formatUsd(m: LayeredMoney): string {
  return (m.amountCents / 100).toLocaleString("en-US", { style: "currency", currency: m.currency });
}

export default function EconomicsBridgePage() {
  const opportunity = getDemoOpportunity("demo-mapped");
  if (!opportunity) throw new Error("demo fixture missing");
  const result = computeWaterfall(opportunity.economics);
  if (result.status !== "OK") throw new Error("demo fixture must have mapped terms");

  const bridge = [
    result.layers[EconomicLayer.CONSUMER_GMS],
    result.layers[EconomicLayer.STORE_NET_SALES],
    result.layers[EconomicLayer.FYUL_RECOGNIZED],
    result.layers[EconomicLayer.FYUL_CONTRIBUTION],
    result.layers[EconomicLayer.PIPELINE_EV],
  ];
  const gmsCents = bridge[0]!.amountCents;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">FYUL Economics Bridge</h1>
      <p className="mt-2 text-sm text-slate-600">
        {opportunity.title} — five economic layers, never blended.{" "}
        <Link href={`/titles/${opportunity.id}`} className="underline">
          Open the title workspace
        </Link>{" "}
        to run scenarios.
      </p>
      <ol className="mt-8 space-y-2" aria-label="Five-layer economics waterfall">
        {bridge.map((m) => (
          <li
            key={m.layer}
            className="flex items-baseline justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
          >
            <span className="font-medium">{LAYER_LABELS[m.layer]}</span>
            <span className="tabular-nums">
              {formatUsd(m)}
              {m.layer !== EconomicLayer.CONSUMER_GMS ? (
                <span className="ml-3 text-xs text-slate-500">
                  {((m.amountCents / gmsCents) * 100).toFixed(1)}% of GMS
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-xs text-slate-500">
        metric_version metric-v0.placeholder · model_version model-v0.placeholder · snapshot
        snapshot-demo-fixtures
      </p>
    </main>
  );
}
