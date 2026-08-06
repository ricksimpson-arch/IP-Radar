"use server";

/**
 * Application submit — SPEC.md §10.4. The Zod schema is the server boundary
 * (rule 2); the lead score is computed and stored here, never client-side.
 * TODO(M5): DB transaction, outbox emails, CRM queue. TODO(M7): Turnstile +
 * rate limit. The seams are in src/lib/db/store.ts.
 */
import { track } from "@/lib/analytics/events";
import { saveApplication } from "@/lib/db/store";
import { leadScore, scoreBand } from "@/lib/scoring/leadScore";
import { applicationSchema } from "@/lib/validation/apply";

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: { code: string; message: string; fields?: Record<string, string> } };

export async function submitApplication(payload: unknown): Promise<SubmitResult> {
  const parsed = applicationSchema.safeParse(payload);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fields[key]) fields[key] = issue.message;
    }
    return {
      ok: false,
      error: { code: "validation", message: "Check the highlighted fields.", fields },
    };
  }
  const data = parsed.data;

  // Honeypot filled → accept silently, persist nothing (SPEC.md §15.1).
  if (data.website2) return { ok: true };

  const score = leadScore({
    budgetBand: data.budgetBand,
    businessProblem: data.businessProblem,
    decisions: data.decisions,
    dataSources: data.currentData,
    timeline: data.timeline,
    companySize: data.companySize,
    industry: data.industry,
    email: data.email,
    company: data.company,
    completedPlanner: Boolean(data.plannerToken),
  });

  // Idempotent via client-generated submission_id (SPEC.md §10.2): a
  // duplicate submit acknowledges success without a second row.
  await saveApplication(data, score);

  // Server-side mirror of the conversion event, non-PII only (SPEC.md §17.2).
  track({
    name: "application_submitted",
    industry: data.industry,
    budget_band: data.budgetBand,
    timeline: data.timeline,
    score_band: scoreBand(score),
  });

  return { ok: true };
}
