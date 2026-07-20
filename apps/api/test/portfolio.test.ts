import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("GET /opportunities (portfolio)", () => {
  it("ranks by pipeline EV descending — NOT by GMS", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "GET", url: "/opportunities" });
    expect(res.statusCode).toBe(200);
    const body = res.json();

    const mapped = body.rows.filter((r: { pipelineEvCents: number | null }) => r.pipelineEvCents !== null);
    const evs = mapped.map((r: { pipelineEvCents: number }) => r.pipelineEvCents);
    expect([...evs].sort((a, b) => b - a)).toEqual(evs);

    // The GMV trap: the largest-GMS title must NOT be the top-ranked row.
    const byGms = [...body.rows].sort(
      (a, b) => b.layers.CONSUMER_GMS.amountCents - a.layers.CONSUMER_GMS.amountCents
    );
    expect(byGms[0].id).toBe("demo-galactic-bake-off");
    expect(body.rows[0].id).not.toBe("demo-galactic-bake-off");
  });

  it("puts unmapped-terms opportunities last with an explicit status, not a score", async () => {
    const app = buildApp();
    const body = (await app.inject({ method: "GET", url: "/opportunities" })).json();
    const last = body.rows[body.rows.length - 1];
    expect(last.id).toBe("demo-unmapped");
    expect(last.economicsStatus).toBe("TERMS_UNMAPPED");
    expect(last.pipelineEvCents).toBeNull();
    expect(last.layers.FYUL_RECOGNIZED).toBeUndefined();
  });
});

describe("POST /opportunities/:id/scenario", () => {
  it("recomputes the waterfall under explicit assumptions and echoes them", async () => {
    const app = buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/opportunities/demo-mapped/scenario",
      payload: { trafficMultiplier: 1.2, delayDiscount: 0.7 },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.assumptions).toEqual({ trafficMultiplier: 1.2, delayDiscount: 0.7 });
    expect(body.baseline.status).toBe("OK");
    expect(body.scenario.status).toBe("OK");
    expect(body.baseline.layers.PIPELINE_EV.amountCents).toBe(1_178_780);
    expect(body.scenario.layers.CONSUMER_GMS.amountCents).toBeGreaterThan(
      body.baseline.layers.CONSUMER_GMS.amountCents
    );
  });

  it("rejects invalid assumptions with 400", async () => {
    const app = buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/opportunities/demo-mapped/scenario",
      payload: { pRightsWin: 2 },
    });
    expect(res.statusCode).toBe(400);
  });

  it("keeps TERMS_UNMAPPED blocked even under scenario assumptions", async () => {
    const app = buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/opportunities/demo-unmapped/scenario",
      payload: { royaltyRateBpsOverride: 1500 },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.scenario.status).toBe("TERMS_UNMAPPED");
    expect(body.scenario.layers.FYUL_RECOGNIZED).toBeUndefined();
  });
});

describe("GET /portfolio/export.csv", () => {
  it("includes version provenance and layer-tagged columns", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "GET", url: "/portfolio/export.csv" });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    const lines = res.body.split("\n");
    expect(lines[0]).toContain("metric_version=");
    expect(lines[1]).toContain("model_version=");
    expect(lines[2]).toContain("data_snapshot_id=");
    expect(lines[4]).toContain("pipeline_ev_cents");
    expect(res.body).toContain("TERMS_UNMAPPED");
    expect(res.body).not.toMatch(/\brevenue\b/i);
  });
});
