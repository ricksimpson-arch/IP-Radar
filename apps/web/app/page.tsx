import {
  EconomicLayer,
  fyulContribution,
  fyulRecognized,
  gms,
  pipelineEv,
  storeNetSales,
  type LayeredMoney,
} from "@ip-radar/economics";

/**
 * FYUL economics bridge (§6.1) — the reference implementation of the
 * five-layer rule. Currently renders the synthetic demo fixture; real data
 * arrives in Phase 1 via the API. Every figure on screen is layer-tagged.
 */
const LAYER_LABELS: Record<EconomicLayer, string> = {
  [EconomicLayer.CONSUMER_GMS]: "Consumer GMS",
  [EconomicLayer.STORE_NET_SALES]: "Store Net Sales",
  [EconomicLayer.FYUL_RECOGNIZED]: "FYUL Recognized",
  [EconomicLayer.FYUL_CONTRIBUTION]: "FYUL Contribution",
  [EconomicLayer.PIPELINE_EV]: "Pipeline Expected Value",
};

function demoBridge(): LayeredMoney[] {
  const gmsValue = gms({ orders: 12_400, realizedAovCents: 3_250, currency: "USD" });
  const netValue = storeNetSales({
    gms: gmsValue,
    discountsCents: 2_015_000,
    cancellationsCents: 806_000,
    refundsCents: 1_612_000,
    chargebacksCents: 161_200,
    excludedTaxesDutiesCents: 3_224_000,
  });
  const recognized = fyulRecognized({
    agreement: {
      agreementId: "AGR-DEMO-1",
      version: 3,
      currency: "USD",
      components: [
        { kind: "ROYALTY", rateBps: 1_200, baseLayer: EconomicLayer.STORE_NET_SALES },
        { kind: "SERVICE_FEE_FIXED", amountCents: 500_000 },
      ],
    },
    bases: {
      [EconomicLayer.CONSUMER_GMS]: gmsValue,
      [EconomicLayer.STORE_NET_SALES]: netValue,
    },
  });
  const contribution = fyulContribution({
    recognized,
    variableCostsCents: 1_000_000,
    committedLaunchCostsCents: 750_000,
    guaranteeExposureCents: 250_000,
    writeDownsCents: 100_000,
  });
  const ev = pipelineEv({
    pRightsWin: 0.6,
    conditionalContribution: contribution,
    delayDiscount: 0.9,
    capacityFeasibility: 0.95,
  });
  return [gmsValue, netValue, recognized, contribution, ev];
}

function formatUsd(m: LayeredMoney): string {
  return (m.amountCents / 100).toLocaleString("en-US", { style: "currency", currency: m.currency });
}

export default function EconomicsBridgePage() {
  const bridge = demoBridge();
  const first = bridge[0];
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">FYUL Economics Bridge</h1>
      <p className="mt-2 text-sm text-slate-600">
        Synthetic demo title — five economic layers, never blended. Real data lands in Phase 1.
      </p>
      <ol className="mt-8 space-y-2" aria-label="Five-layer economics waterfall">
        {bridge.map((m) => (
          <li
            key={m.layer}
            className="flex items-baseline justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
          >
            <span className="font-medium">{LAYER_LABELS[m.layer]}</span>
            <span className="tabular-nums" aria-label={`${LAYER_LABELS[m.layer]}: ${formatUsd(m)}`}>
              {formatUsd(m)}
              {first && m.layer !== first.layer ? (
                <span className="ml-3 text-xs text-slate-500">
                  {((m.amountCents / first.amountCents) * 100).toFixed(1)}% of GMS
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
