import Fastify, { type FastifyInstance } from "fastify";
import {
  EconomicLayer,
  applyScenario,
  computeWaterfall,
  type ScenarioDeltas,
  type WaterfallResult,
} from "@ip-radar/economics";
import { getDemoOpportunity, listDemoOpportunities } from "@ip-radar/demo-data";

/**
 * Every API response that carries forecast or economic figures includes this
 * envelope so results are auditable and reproducible. Versions are
 * placeholders until the metric/model registries exist.
 */
export interface ResponseMeta {
  metric_version: string;
  model_version: string;
  data_snapshot_id: string;
}

const META: ResponseMeta = {
  metric_version: "metric-v0.placeholder",
  model_version: "model-v0.placeholder",
  data_snapshot_id: "snapshot-demo-fixtures",
};

function unmappedPayload(result: Extract<WaterfallResult, { status: "TERMS_UNMAPPED" }>) {
  return {
    status: result.status,
    detail:
      "Private deal terms are missing or unmapped for this opportunity. " +
      "Store-layer scenarios only; FYUL_RECOGNIZED and FYUL_CONTRIBUTION are blocked.",
    layers: result.layers,
  };
}

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.get("/health", async () => ({ status: "ok", ...META }));

  /**
   * Opportunity portfolio (§6.2). Default (and only) sort: pipeline expected
   * contribution, descending. GMS is included as context — it is NEVER the
   * ranking key. Opportunities with unmapped terms rank last, explicitly
   * labeled, rather than being scored on a made-up number.
   */
  app.get("/opportunities", async () => {
    const rows = listDemoOpportunities().map((opp) => {
      const result = computeWaterfall(opp.economics);
      return {
        id: opp.id,
        title: opp.title,
        rightsholder: opp.rightsholder,
        owner: opp.owner,
        opportunityStatus: opp.status,
        ipArchetype: opp.ipArchetype,
        economicsStatus: result.status,
        layers: result.layers,
        pipelineEvCents:
          result.status === "OK" ? result.layers[EconomicLayer.PIPELINE_EV].amountCents : null,
      };
    });
    rows.sort((a, b) => {
      if (a.pipelineEvCents === null && b.pipelineEvCents === null) return 0;
      if (a.pipelineEvCents === null) return 1;
      if (b.pipelineEvCents === null) return -1;
      return b.pipelineEvCents - a.pipelineEvCents;
    });
    return { sort: "PIPELINE_EV desc (GMS is context only, never the ranking key)", rows, ...META };
  });

  /** Five-layer economics bridge for one opportunity (§6.1 reference surface). */
  app.get<{ Params: { id: string } }>("/opportunities/:id/economics", async (request, reply) => {
    const opportunity = getDemoOpportunity(request.params.id);
    if (!opportunity) {
      return reply.status(404).send({ error: "opportunity not found", ...META });
    }
    const result = computeWaterfall(opportunity.economics);
    if (result.status === "TERMS_UNMAPPED") {
      return reply.send({ ...unmappedPayload(result), ...META });
    }
    return reply.send({ status: result.status, layers: result.layers, ...META });
  });

  /**
   * Scenario preview (§6.4): applies explicit user assumptions to the
   * baseline and recomputes the waterfall. Pure recomputation — well under
   * the 2s target. Assumptions are echoed back so exports can record them.
   */
  app.post<{ Params: { id: string }; Body: ScenarioDeltas }>(
    "/opportunities/:id/scenario",
    async (request, reply) => {
      const opportunity = getDemoOpportunity(request.params.id);
      if (!opportunity) {
        return reply.status(404).send({ error: "opportunity not found", ...META });
      }
      const deltas = request.body ?? {};
      let scenarioInputs;
      try {
        scenarioInputs = applyScenario(opportunity.economics, deltas);
      } catch (err) {
        if (err instanceof RangeError) {
          return reply.status(400).send({ error: err.message, ...META });
        }
        throw err;
      }
      const baseline = computeWaterfall(opportunity.economics);
      const scenario = computeWaterfall(scenarioInputs);
      return reply.send({
        assumptions: deltas,
        baseline:
          baseline.status === "OK"
            ? { status: baseline.status, layers: baseline.layers }
            : unmappedPayload(baseline),
        scenario:
          scenario.status === "OK"
            ? { status: scenario.status, layers: scenario.layers }
            : unmappedPayload(scenario),
        ...META,
      });
    }
  );

  /**
   * Portfolio CSV export (§6.7). Assumption/version metadata rides along as
   * leading comment rows — an export with no provenance is not auditable.
   */
  app.get("/portfolio/export.csv", async (_request, reply) => {
    const header = [
      `# metric_version=${META.metric_version}`,
      `# model_version=${META.model_version}`,
      `# data_snapshot_id=${META.data_snapshot_id}`,
      `# sort=PIPELINE_EV desc; unmapped terms rank last`,
      [
        "id",
        "title",
        "rightsholder",
        "economics_status",
        "consumer_gms_cents",
        "store_net_sales_cents",
        "fyul_recognized_cents",
        "fyul_contribution_cents",
        "pipeline_ev_cents",
        "currency",
      ].join(","),
    ];
    const rows = listDemoOpportunities()
      .map((opp) => ({ opp, result: computeWaterfall(opp.economics) }))
      .sort((a, b) => {
        const ev = (r: WaterfallResult) =>
          r.status === "OK" ? r.layers[EconomicLayer.PIPELINE_EV].amountCents : Number.NEGATIVE_INFINITY;
        return ev(b.result) - ev(a.result);
      })
      .map(({ opp, result }) => {
        const layers = result.layers;
        const cell = (layer: EconomicLayer): string => {
          const value = (layers as Partial<Record<EconomicLayer, { amountCents: number }>>)[layer];
          return value === undefined ? "TERMS_UNMAPPED" : String(value.amountCents);
        };
        return [
          opp.id,
          csvEscape(opp.title),
          csvEscape(opp.rightsholder),
          result.status,
          cell(EconomicLayer.CONSUMER_GMS),
          cell(EconomicLayer.STORE_NET_SALES),
          cell(EconomicLayer.FYUL_RECOGNIZED),
          cell(EconomicLayer.FYUL_CONTRIBUTION),
          cell(EconomicLayer.PIPELINE_EV),
          opp.economics.storeActuals.currency,
        ].join(",");
      });
    reply.header("content-type", "text/csv; charset=utf-8");
    return [...header, ...rows].join("\n") + "\n";
  });

  return app;
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}
