import Fastify, { type FastifyInstance } from "fastify";
import {
  EconomicLayer,
  TermsUnmappedError,
  type AgreementVersion,
  fyulContribution,
  fyulRecognized,
  gms,
  pipelineEv,
  storeNetSales,
} from "@ip-radar/economics";
import { getDemoOpportunity } from "./demo-data.js";

/**
 * Every API response that carries forecast or economic figures includes this
 * envelope so results are auditable and reproducible (FR: reproducibility).
 * Versions are placeholders until the metric/model registries exist.
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

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.get("/health", async () => ({ status: "ok", ...META }));

  /**
   * Five-layer economics bridge for one opportunity (§6.1 reference surface).
   * If deal terms are unmapped, FYUL layers are BLOCKED: the response carries
   * status TERMS_UNMAPPED and store-layer scenarios only. We never estimate.
   */
  app.get<{ Params: { id: string } }>("/opportunities/:id/economics", async (request, reply) => {
    const opportunity = getDemoOpportunity(request.params.id);
    if (!opportunity) {
      return reply.status(404).send({ error: "opportunity not found", ...META });
    }

    const gmsValue = gms(opportunity.storeActuals);
    const netValue = storeNetSales({ gms: gmsValue, ...opportunity.bridge });
    const storeLayers = {
      [EconomicLayer.CONSUMER_GMS]: gmsValue,
      [EconomicLayer.STORE_NET_SALES]: netValue,
    };

    const agreement: AgreementVersion | null = opportunity.agreement;
    try {
      const recognized = fyulRecognized({ agreement, bases: storeLayers });
      const contribution = fyulContribution({ recognized, ...opportunity.costs });
      const ev = pipelineEv({ conditionalContribution: contribution, ...opportunity.pipeline });
      return reply.send({
        status: "OK",
        layers: {
          ...storeLayers,
          [EconomicLayer.FYUL_RECOGNIZED]: recognized,
          [EconomicLayer.FYUL_CONTRIBUTION]: contribution,
          [EconomicLayer.PIPELINE_EV]: ev,
        },
        ...META,
      });
    } catch (err) {
      if (err instanceof TermsUnmappedError) {
        return reply.status(200).send({
          status: "TERMS_UNMAPPED",
          detail:
            "Private deal terms are missing or unmapped for this opportunity. " +
            "Store-layer scenarios only; FYUL_RECOGNIZED and FYUL_CONTRIBUTION are blocked.",
          layers: storeLayers,
          ...META,
        });
      }
      throw err;
    }
  });

  return app;
}
