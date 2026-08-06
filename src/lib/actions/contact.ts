"use server";

/** Contact / security-summary server action — SPEC.md §8.5, §12.
    TODO(M7): add Turnstile verification and Upstash rate limiting here. */
import { contactSchema } from "@/lib/validation/contact";
import { saveContactRequest } from "@/lib/db/store";

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fields?: Record<string, string>;
};

export async function submitContact(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    company: String(formData.get("company") ?? ""),
    message: String(formData.get("message") ?? ""),
    kind: String(formData.get("kind") ?? "contact"),
    website2: String(formData.get("website2") ?? ""),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fields[key]) fields[key] = issue.message;
    }
    return { status: "error", message: "Check the highlighted fields.", fields };
  }

  // Honeypot filled → silently drop (SPEC.md §15.1).
  if (parsed.data.website2) {
    return { status: "success" };
  }

  await saveContactRequest(parsed.data);
  return {
    status: "success",
    message:
      parsed.data.kind === "security_summary"
        ? "Request received. We'll send the security summary to your email within one business day."
        : "Message received. We reply within one business day.",
  };
}
