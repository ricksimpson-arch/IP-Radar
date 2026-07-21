import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

/** Access tests (build-spec §8): confidential contract fields must be
 * invisible to unauthorized roles — including in exports. */
describe("GET /opportunities/:id/agreement RBAC", () => {
  const CONFIDENTIAL_MARKERS = ["rateBps", "amountCents", "components"];

  it.each(["finance", "data_eng", "admin"])("%s sees full contract terms", async (role) => {
    const app = buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/opportunities/demo-mapped/agreement",
      headers: { "x-demo-role": role },
    });
    const body = res.json();
    expect(body.agreement.components.length).toBeGreaterThan(0);
    expect(JSON.stringify(body.agreement)).toContain("rateBps");
  });

  it.each(["leadership", "snow_bd", "merch_creative", "provider_ops"])(
    "%s gets the redacted view with no rates or amounts",
    async (role) => {
      const app = buildApp();
      const res = await app.inject({
        method: "GET",
        url: "/opportunities/demo-mapped/agreement",
        headers: { "x-demo-role": role },
      });
      const body = res.json();
      expect(body.agreement.redacted).toBe(true);
      expect(body.agreement.termsMapped).toBe(true);
      const serialized = JSON.stringify(body.agreement);
      for (const marker of CONFIDENTIAL_MARKERS) {
        expect(serialized).not.toContain(marker);
      }
    }
  );

  it("missing or unknown roles are default-denied to the redacted view", async () => {
    const app = buildApp();
    for (const headers of [{}, { "x-demo-role": "superuser" }]) {
      const res = await app.inject({
        method: "GET",
        url: "/opportunities/demo-mapped/agreement",
        headers,
      });
      const body = res.json();
      expect(body.role).toBe("unauthenticated");
      expect(body.agreement.redacted).toBe(true);
      expect(JSON.stringify(body.agreement)).not.toContain("rateBps");
    }
  });

  it("reports NO_AGREEMENT_ON_FILE distinctly from a redacted agreement", async () => {
    const app = buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/opportunities/demo-unmapped/agreement",
      headers: { "x-demo-role": "finance" },
    });
    const body = res.json();
    expect(body.status).toBe("NO_AGREEMENT_ON_FILE");
    expect(body.agreement).toBeNull();
  });

  it("portfolio CSV export contains no confidential contract fields", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "GET", url: "/portfolio/export.csv" });
    expect(res.body).not.toContain("rateBps");
    expect(res.body).not.toContain("guarantee");
    expect(res.body).not.toContain("unit_cost");
  });
});

describe("GET /governance", () => {
  it("reports real state: versions, unmapped terms, no promoted models, zero overrides", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "GET", url: "/governance" });
    const body = res.json();
    expect(body.versions.metric_version).toBeTruthy();
    expect(body.data.unmappedTerms).toContain("demo-unmapped");
    expect(body.models.promoted).toEqual([]);
    expect(body.overrides.count).toBe(0);
  });
});
