import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("GET /opportunities/:id/sensitivity", () => {
  it("returns top-5 drivers, break-evens, and disclosed unmodeled drivers", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "GET", url: "/opportunities/demo-mapped/sensitivity" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe("OK");
    expect(body.topDrivers).toHaveLength(5);
    expect(body.notModeled.map((d: { driver: string }) => d.driver)).toContain("fulfillment_route");
    expect(body.metric_version).toBeTruthy();
  });

  it("blocks sensitivity for unmapped terms", async () => {
    const app = buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/opportunities/demo-unmapped/sensitivity",
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("TERMS_UNMAPPED");
  });

  it("404s for unknown opportunities", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "GET", url: "/opportunities/nope/sensitivity" });
    expect(res.statusCode).toBe(404);
  });
});
