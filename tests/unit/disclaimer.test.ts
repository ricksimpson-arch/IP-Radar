import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { copy } from "@/content/copy";

/** SPEC §14.2: the disclaimer copy lives in copy.legal.ipDisclaimer and is
    unit-tested for presence on the routes that display franchise analysis. */
describe("IP disclaimer (SPEC §14.2)", () => {
  it("matches the required non-affiliation language", () => {
    expect(copy.legal.ipDisclaimer).toBe(
      "LootSignal is an independent research and analysis system. Franchise and brand names appear as subjects of market analysis. Their inclusion does not imply affiliation with, endorsement by, or licensing rights from any rights holder.",
    );
  });

  it("renders above the fold on /work/lootsignal", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/(marketing)/work/lootsignal/page.tsx"),
      "utf8",
    );
    expect(source).toContain('<DisclaimerBanner variant="ip" />');
    // Above the fold: inside the <header>, before any content section.
    const headerEnd = source.indexOf("</header>");
    expect(source.indexOf('<DisclaimerBanner variant="ip" />')).toBeLessThan(headerEnd);
  });

  it("matches the required language for SnowFlurry and renders above the fold on /work/snowflurry", () => {
    expect(copy.legal.ipDisclaimerSnowFlurry).toBe(
      "SnowFlurry is an independent research and analysis system. Television series and brand names appear as subjects of market analysis. Their inclusion does not imply affiliation with, endorsement by, or licensing rights from any rights holder.",
    );
    const source = readFileSync(
      join(process.cwd(), "src/app/(marketing)/work/snowflurry/page.tsx"),
      "utf8",
    );
    expect(source).toContain('<DisclaimerBanner variant="ip-snowflurry" />');
    const headerEnd = source.indexOf("</header>");
    expect(source.indexOf('<DisclaimerBanner variant="ip-snowflurry" />')).toBeLessThan(headerEnd);
  });
});

describe("planner share-link round trip", () => {
  it("encode → decode preserves the input exactly", async () => {
    const { encodePlannerInput, decodePlannerInput } = await import("@/lib/planner/encode");
    const input = {
      industry: "licensing_ip" as const,
      decision: "rank_opportunities" as const,
      decisionDetail: "Which franchises to pitch — Q4 (émojis ✓)",
      dataSources: ["internal_sales" as const],
      outputs: ["ranked_list" as const],
      integrations: ["none" as const],
      timeline: "2-3mo" as const,
    };
    expect(decodePlannerInput(encodePlannerInput(input))).toEqual(input);
  });

  it("returns null for tampered tokens", async () => {
    const { decodePlannerInput } = await import("@/lib/planner/encode");
    expect(decodePlannerInput("not-a-valid-token")).toBeNull();
    expect(decodePlannerInput("")).toBeNull();
  });
});
