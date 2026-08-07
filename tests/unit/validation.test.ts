import { describe, expect, it } from "vitest";
import {
  applicationSchema,
  businessEmailSchema,
  stepProblemSchema,
  stepReviewSchema,
  stepYouSchema,
} from "@/lib/validation/apply";
import { contactSchema } from "@/lib/validation/contact";
import { plannerInputSchema } from "@/lib/validation/planner";

describe("businessEmailSchema", () => {
  it("accepts business domains and rejects free providers with the copy-deck message", () => {
    expect(businessEmailSchema.safeParse("vp@examplebrand.com").success).toBe(true);
    const rejected = businessEmailSchema.safeParse("vp@gmail.com");
    expect(rejected.success).toBe(false);
    if (!rejected.success) {
      expect(rejected.error.issues[0]?.message).toContain("company email");
    }
  });

  it("rejects malformed emails", () => {
    expect(businessEmailSchema.safeParse("not-an-email").success).toBe(false);
  });
});

describe("stepProblemSchema", () => {
  it("enforces the 100-character minimum", () => {
    expect(
      stepProblemSchema.safeParse({ businessProblem: "too short", decisions: ["a decision"] }).success,
    ).toBe(false);
    expect(
      stepProblemSchema.safeParse({ businessProblem: "x".repeat(100), decisions: ["a real decision"] })
        .success,
    ).toBe(true);
  });

  it("requires 1–5 decisions", () => {
    const problem = "x".repeat(120);
    expect(stepProblemSchema.safeParse({ businessProblem: problem, decisions: [] }).success).toBe(false);
    expect(
      stepProblemSchema.safeParse({
        businessProblem: problem,
        decisions: Array.from({ length: 6 }, () => "a decision"),
      }).success,
    ).toBe(false);
  });
});

describe("stepYouSchema / stepReviewSchema", () => {
  it("requires name, company, role", () => {
    expect(
      stepYouSchema.safeParse({ fullName: "", company: "", role: "", email: "a@b.com" }).success,
    ).toBe(false);
  });

  it("requires explicit consent", () => {
    expect(stepReviewSchema.safeParse({ consent: false }).success).toBe(false);
    expect(stepReviewSchema.safeParse({ consent: true }).success).toBe(true);
  });
});

const validApplication = {
  fullName: "Jordan Reyes",
  company: "ExampleBrand",
  role: "VP Merchandising",
  email: "jordan@examplebrand.com",
  phone: "",
  industry: "consumer_products",
  companySize: "51-200",
  website: "examplebrand.com",
  region: "north_america",
  businessProblem:
    "We license characters across forty product lines and decide quarterly which lines to expand. The decision is made from a spreadsheet nobody trusts.",
  decisions: ["Which product lines to expand next quarter"],
  currentData: ["internal_sales", "retail_pos"],
  currentTools: "Excel, Looker",
  outputUsers: "Merchandising leadership",
  desiredOutputs: ["ranked_list", "exec_dashboard"],
  desiredOutputsOther: "",
  integrations: ["sheets"],
  budgetBand: "75k_150k",
  timeline: "this_quarter",
  securityReqs: ["nda"],
  consent: true,
  submissionId: "abc123def456",
  plannerToken: "",
  source: "",
  website2: "",
};

describe("applicationSchema (server boundary)", () => {
  it("accepts a complete application", () => {
    expect(applicationSchema.safeParse(validApplication).success).toBe(true);
  });

  it("rejects a free-provider email", () => {
    expect(
      applicationSchema.safeParse({ ...validApplication, email: "jordan@yahoo.com" }).success,
    ).toBe(false);
  });

  it("rejects an unknown budget band", () => {
    expect(
      applicationSchema.safeParse({ ...validApplication, budgetBand: "one_million" }).success,
    ).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(
      applicationSchema.safeParse({ ...validApplication, website2: "spam-bot-text" }).success,
    ).toBe(false);
  });

  it("requires a submissionId of at least 8 chars (idempotency key)", () => {
    expect(applicationSchema.safeParse({ ...validApplication, submissionId: "short" }).success).toBe(
      false,
    );
  });
});

describe("plannerInputSchema", () => {
  it("accepts a valid planner input", () => {
    expect(
      plannerInputSchema.safeParse({
        industry: "licensing_ip",
        decision: "rank_opportunities",
        dataSources: ["internal_sales"],
        outputs: ["ranked_list"],
        integrations: ["none"],
        timeline: "2-3mo",
      }).success,
    ).toBe(true);
  });

  it("rejects unknown enum values and over-length detail", () => {
    expect(
      plannerInputSchema.safeParse({
        industry: "aerospace",
        decision: "rank_opportunities",
        dataSources: [],
        outputs: ["ranked_list"],
        integrations: [],
        timeline: "2-3mo",
      }).success,
    ).toBe(false);
    expect(
      plannerInputSchema.safeParse({
        industry: "licensing_ip",
        decision: "rank_opportunities",
        decisionDetail: "x".repeat(281),
        dataSources: [],
        outputs: ["ranked_list"],
        integrations: [],
        timeline: "2-3mo",
      }).success,
    ).toBe(false);
  });

  it("requires at least one output", () => {
    expect(
      plannerInputSchema.safeParse({
        industry: "licensing_ip",
        decision: "rank_opportunities",
        dataSources: [],
        outputs: [],
        integrations: [],
        timeline: "2-3mo",
      }).success,
    ).toBe(false);
  });
});

describe("contactSchema", () => {
  it("accepts a valid message and rejects an empty one", () => {
    expect(
      contactSchema.safeParse({
        name: "Sam",
        email: "sam@examplebrand.com",
        company: "",
        message: "We need help scoring a licensing portfolio.",
        kind: "contact",
        website2: "",
      }).success,
    ).toBe(true);
    expect(
      contactSchema.safeParse({
        name: "Sam",
        email: "sam@examplebrand.com",
        company: "",
        message: "hi",
        kind: "contact",
        website2: "",
      }).success,
    ).toBe(false);
  });
});
