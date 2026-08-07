import { describe, expect, it } from "vitest";
import {
  domainMatchesCompany,
  isFreeEmailDomain,
  leadScore,
  scoreBand,
  type LeadSignals,
} from "@/lib/scoring/leadScore";

const strong: LeadSignals = {
  budgetBand: "150k_plus",
  businessProblem: "x".repeat(320),
  decisions: ["Which three franchises to pitch next quarter"],
  dataSources: ["internal_sales", "crm", "retail_pos"],
  timeline: "asap",
  companySize: "201-1000",
  industry: "licensing_ip",
  email: "vp@examplebrand.com",
  company: "ExampleBrand",
  completedPlanner: true,
};

describe("leadScore", () => {
  it("stays within 0–100", () => {
    expect(leadScore(strong)).toBeLessThanOrEqual(100);
    expect(
      leadScore({
        ...strong,
        budgetBand: "under_25k",
        businessProblem: "",
        decisions: [],
        dataSources: [],
        timeline: "exploring",
        companySize: "1-10",
        industry: "unknown",
        email: "someone@gmail.com",
        company: "",
        completedPlanner: false,
      }),
    ).toBeGreaterThanOrEqual(0);
  });

  it("scores a fully-qualified application into the priority band", () => {
    expect(scoreBand(leadScore(strong))).toBe("priority");
  });

  it("scores an unqualified application into the low band", () => {
    const weak = leadScore({
      ...strong,
      budgetBand: "under_25k",
      businessProblem: "too short",
      decisions: [],
      dataSources: ["none_yet"],
      timeline: "exploring",
      companySize: "1-10",
      industry: "unknown",
      email: "someone@gmail.com",
      completedPlanner: false,
    });
    expect(scoreBand(weak)).toBe("low");
  });

  it("rewards budget signal: 150k+ beats undetermined beats under_25k", () => {
    const at = (b: LeadSignals["budgetBand"]) => leadScore({ ...strong, budgetBand: b });
    expect(at("150k_plus")).toBeGreaterThan(at("undetermined"));
    expect(at("undetermined")).toBeGreaterThan(at("under_25k"));
  });

  it("rewards a matching business domain over a mismatched one, over a free one", () => {
    const matched = leadScore(strong);
    const unmatched = leadScore({ ...strong, email: "vp@othercorp.com" });
    const free = leadScore({ ...strong, email: "vp@gmail.com" });
    expect(matched).toBeGreaterThan(unmatched);
    expect(unmatched).toBeGreaterThan(free);
  });

  it("adds the planner completion bonus", () => {
    expect(leadScore(strong) - leadScore({ ...strong, completedPlanner: false })).toBe(5);
  });
});

describe("scoreBand thresholds (SPEC §9.6)", () => {
  it("bands exactly at 75/60/40", () => {
    expect(scoreBand(75)).toBe("priority");
    expect(scoreBand(74)).toBe("qualified");
    expect(scoreBand(60)).toBe("qualified");
    expect(scoreBand(59)).toBe("nurture");
    expect(scoreBand(40)).toBe("nurture");
    expect(scoreBand(39)).toBe("low");
  });
});

describe("email domain helpers", () => {
  it("recognizes free providers", () => {
    expect(isFreeEmailDomain("a@gmail.com")).toBe(true);
    expect(isFreeEmailDomain("a@GMAIL.com")).toBe(true);
    expect(isFreeEmailDomain("a@examplebrand.com")).toBe(false);
  });

  it("matches company names loosely against domains", () => {
    expect(domainMatchesCompany("vp@examplebrand.com", "ExampleBrand Inc")).toBe(true);
    expect(domainMatchesCompany("vp@examplebrand.com", "Totally Different")).toBe(false);
    expect(domainMatchesCompany("vp@eb.co", "ExampleBrand")).toBe(false);
  });
});
