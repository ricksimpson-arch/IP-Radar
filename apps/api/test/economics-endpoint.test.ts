import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("GET /opportunities/:id/economics", () => {
  it("returns all five layers for a fully mapped opportunity", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "GET", url: "/opportunities/demo-mapped/economics" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe("OK");
    expect(Object.keys(body.layers).sort()).toEqual([
      "CONSUMER_GMS",
      "FYUL_CONTRIBUTION",
      "FYUL_RECOGNIZED",
      "PIPELINE_EV",
      "STORE_NET_SALES",
    ]);
    expect(body.layers.PIPELINE_EV.amountCents).toBe(1_178_780);
    expect(body.metric_version).toBeTruthy();
    expect(body.model_version).toBeTruthy();
    expect(body.data_snapshot_id).toBeTruthy();
  });

  it("blocks FYUL layers and returns TERMS_UNMAPPED when terms are missing", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "GET", url: "/opportunities/demo-unmapped/economics" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe("TERMS_UNMAPPED");
    expect(Object.keys(body.layers).sort()).toEqual(["CONSUMER_GMS", "STORE_NET_SALES"]);
    expect(body.layers.FYUL_RECOGNIZED).toBeUndefined();
    expect(body.layers.FYUL_CONTRIBUTION).toBeUndefined();
  });

  it("404s for unknown opportunities", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "GET", url: "/opportunities/nope/economics" });
    expect(res.statusCode).toBe(404);
  });
});
