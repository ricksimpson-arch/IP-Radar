"use server";

/** Planner server actions — SPEC.md §9.5, §12.
    TODO(M7): Turnstile + rate limiting on the email path. */
import { z } from "zod";
import { queueOutlineEmail } from "@/lib/db/store";
import { decodePlannerInput } from "@/lib/planner/encode";
import { buildOutline } from "@/lib/planner/engine";

const emailOutlineSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  token: z.string().min(1),
});

export type EmailOutlineState = { status: "idle" | "success" | "error"; message?: string };

export async function emailOutline(
  _prev: EmailOutlineState,
  formData: FormData,
): Promise<EmailOutlineState> {
  const parsed = emailOutlineSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    token: String(formData.get("token") ?? ""),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the email address." };
  }
  const input = decodePlannerInput(parsed.data.token);
  if (!input) {
    return { status: "error", message: "This outline link is no longer valid. Re-run the planner." };
  }
  const outline = buildOutline(input);
  await queueOutlineEmail(parsed.data.email, outline.archetype.id);
  return { status: "success", message: "Outline queued. Check your inbox in the next few minutes." };
}
