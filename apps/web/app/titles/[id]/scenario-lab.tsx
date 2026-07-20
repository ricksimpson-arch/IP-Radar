"use client";

import { useMemo, useState } from "react";
import {
  EconomicLayer,
  applyScenario,
  computeWaterfall,
  type ScenarioDeltas,
  type TitleEconomicsInputs,
  type WaterfallResult,
} from "@ip-radar/economics";

/**
 * Scenario lab (§6.4). Assumptions are explicit user inputs; recomputation is
 * a synchronous pure-function call, far inside the <2s target. Exports embed
 * the assumptions and version metadata — no provenance, no export.
 */
const META = {
  metric_version: "metric-v0.placeholder",
  model_version: "model-v0.placeholder",
  data_snapshot_id: "snapshot-demo-fixtures",
};

const LAYER_ORDER = [
  EconomicLayer.CONSUMER_GMS,
  EconomicLayer.STORE_NET_SALES,
  EconomicLayer.FYUL_RECOGNIZED,
  EconomicLayer.FYUL_CONTRIBUTION,
  EconomicLayer.PIPELINE_EV,
] as const;

const LAYER_LABELS: Record<EconomicLayer, string> = {
  [EconomicLayer.CONSUMER_GMS]: "Consumer GMS",
  [EconomicLayer.STORE_NET_SALES]: "Store Net Sales",
  [EconomicLayer.FYUL_RECOGNIZED]: "FYUL Recognized",
  [EconomicLayer.FYUL_CONTRIBUTION]: "FYUL Contribution",
  [EconomicLayer.PIPELINE_EV]: "Pipeline Expected Value",
};

function usd(amountCents: number): string {
  return (amountCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function layerAmount(result: WaterfallResult, layer: EconomicLayer): number | null {
  const value = (result.layers as Partial<Record<EconomicLayer, { amountCents: number }>>)[layer];
  return value === undefined ? null : value.amountCents;
}

interface SliderSpec {
  key: keyof ScenarioDeltas;
  label: string;
  min: number;
  max: number;
  step: number;
  neutral: number;
}

const SLIDERS: readonly SliderSpec[] = [
  { key: "trafficMultiplier", label: "Traffic ×", min: 0.2, max: 3, step: 0.05, neutral: 1 },
  { key: "conversionMultiplier", label: "Conversion ×", min: 0.2, max: 3, step: 0.05, neutral: 1 },
  { key: "aovMultiplier", label: "Realized AOV ×", min: 0.5, max: 2, step: 0.05, neutral: 1 },
  { key: "refundsMultiplier", label: "Refunds ×", min: 0, max: 3, step: 0.05, neutral: 1 },
  { key: "variableCostsMultiplier", label: "Variable costs ×", min: 0.5, max: 2, step: 0.05, neutral: 1 },
  { key: "pRightsWin", label: "P(rights win)", min: 0, max: 1, step: 0.01, neutral: NaN },
  { key: "delayDiscount", label: "Launch-delay discount", min: 0.1, max: 1, step: 0.01, neutral: NaN },
  { key: "capacityFeasibility", label: "Capacity feasibility", min: 0.1, max: 1, step: 0.01, neutral: NaN },
];

export function ScenarioLab({
  opportunityId,
  title,
  baseline,
}: {
  opportunityId: string;
  title: string;
  baseline: TitleEconomicsInputs;
}) {
  const [deltas, setDeltas] = useState<ScenarioDeltas>({});

  const baselineResult = useMemo(() => computeWaterfall(baseline), [baseline]);
  const scenarioResult = useMemo(
    () => computeWaterfall(applyScenario(baseline, deltas)),
    [baseline, deltas]
  );

  const sliderValue = (spec: SliderSpec): number => {
    const set = deltas[spec.key];
    if (typeof set === "number") return set;
    if (Number.isNaN(spec.neutral)) {
      // Probability/factor sliders default to the baseline pipeline value.
      const fromBaseline = baseline.pipeline[spec.key as keyof typeof baseline.pipeline];
      return typeof fromBaseline === "number" ? fromBaseline : 1;
    }
    return spec.neutral;
  };

  const downloadCsv = () => {
    const lines = [
      `# opportunity=${opportunityId}`,
      `# title=${title.replaceAll("\n", " ")}`,
      `# metric_version=${META.metric_version}`,
      `# model_version=${META.model_version}`,
      `# data_snapshot_id=${META.data_snapshot_id}`,
      `# assumptions=${JSON.stringify(deltas)}`,
      "economic_layer,baseline_cents,scenario_cents",
      ...LAYER_ORDER.map((layer) => {
        const b = layerAmount(baselineResult, layer);
        const s = layerAmount(scenarioResult, layer);
        return `${layer},${b ?? "TERMS_UNMAPPED"},${s ?? "TERMS_UNMAPPED"}`;
      }),
    ];
    const blob = new Blob([lines.join("\n") + "\n"], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${opportunityId}-scenario.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const unmapped = baselineResult.status === "TERMS_UNMAPPED";

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
      <section aria-label="Five-layer waterfall: baseline vs scenario">
        {unmapped ? (
          <div
            role="status"
            className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <strong>TERMS_UNMAPPED.</strong> Private deal terms are not on file for this
            opportunity, so FYUL Recognized, FYUL Contribution, and Pipeline EV are blocked — store
            layers only. Scenario assumptions cannot substitute for contract terms.
          </div>
        ) : null}
        <table className="w-full rounded-lg border border-slate-200 bg-white text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-4 py-3">Economic layer</th>
              <th scope="col" className="px-4 py-3 text-right">Baseline</th>
              <th scope="col" className="px-4 py-3 text-right">Scenario</th>
              <th scope="col" className="px-4 py-3 text-right">Δ</th>
            </tr>
          </thead>
          <tbody>
            {LAYER_ORDER.map((layer) => {
              const b = layerAmount(baselineResult, layer);
              const s = layerAmount(scenarioResult, layer);
              return (
                <tr key={layer} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{LAYER_LABELS[layer]}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {b === null ? <span className="text-amber-700">blocked</span> : usd(b)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {s === null ? <span className="text-amber-700">blocked</span> : usd(s)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                    {b === null || s === null ? "—" : usd(s - b)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-slate-500">
          metric_version {META.metric_version} · model_version {META.model_version} · snapshot{" "}
          {META.data_snapshot_id}
        </p>
      </section>

      <aside aria-label="Scenario assumptions">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Assumptions
        </h2>
        <div className="mt-3 space-y-4">
          {SLIDERS.map((spec) => {
            const value = sliderValue(spec);
            const inputId = `slider-${spec.key}`;
            return (
              <div key={spec.key}>
                <label htmlFor={inputId} className="flex justify-between text-sm">
                  <span>{spec.label}</span>
                  <span className="tabular-nums text-slate-600">{value.toFixed(2)}</span>
                </label>
                <input
                  id={inputId}
                  type="range"
                  min={spec.min}
                  max={spec.max}
                  step={spec.step}
                  value={value}
                  onChange={(e) =>
                    setDeltas((d) => ({ ...d, [spec.key]: Number(e.target.value) }))
                  }
                  className="mt-1 w-full"
                />
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setDeltas({})}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            Reset to baseline
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Export CSV
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Assumptions are explicit and travel with every export. Saved, versioned, shareable
          scenarios arrive with the scenario service (Phase 1).
        </p>
      </aside>
    </div>
  );
}
