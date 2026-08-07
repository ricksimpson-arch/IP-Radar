/**
 * Persistence seam — SPEC.md §11.
 *
 * TODO(M5): replace with Drizzle + Neon Postgres using the schema in
 * SPEC.md §11 (env: DATABASE_URL). Every write path in the app funnels
 * through these functions so the swap touches no page or action code.
 * Until the database is wired, writes are validated, scored, logged
 * server-side, and acknowledged — nothing is silently discarded client-side.
 */
import "server-only";
import type { ApplicationInput } from "@/lib/validation/apply";
import type { ContactInput } from "@/lib/validation/contact";
import type { PlannerInputParsed } from "@/lib/validation/planner";

// In-memory idempotency guard (§10.2). The DB enforces this with a unique
// index on submission_id once wired; this keeps the contract observable now.
const seenSubmissionIds = new Set<string>();

export async function saveApplication(
  input: ApplicationInput,
  leadScore: number,
): Promise<{ duplicate: boolean }> {
  if (seenSubmissionIds.has(input.submissionId)) {
    return { duplicate: true };
  }
  seenSubmissionIds.add(input.submissionId);
  console.info("[db:applications] submission received", {
    submissionId: input.submissionId,
    industry: input.industry,
    budgetBand: input.budgetBand,
    timeline: input.timeline,
    leadScore,
  });
  return { duplicate: false };
}

export async function queueOutlineEmail(email: string, archetype: string): Promise<void> {
  // TODO(M5): write an email_outbox row and send via Resend cron.
  console.info("[db:email_outbox] outline email queued", { domain: email.split("@")[1], archetype });
}

export async function saveContactRequest(input: ContactInput): Promise<void> {
  console.info("[db:contact_requests] request received", { kind: input.kind });
}

export async function savePlannerSession(
  token: string,
  input: PlannerInputParsed,
  archetype: string,
): Promise<void> {
  console.info("[db:planner_sessions] session saved", { token, archetype });
}
