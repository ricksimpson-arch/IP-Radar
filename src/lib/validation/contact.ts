/** Contact / security-summary request schema — SPEC.md §8.5, §12. */
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().email("Enter a valid email address."),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more — a sentence or two.").max(4000),
  kind: z.enum(["contact", "security_summary", "other"]),
  // Honeypot: silently dropped server-side when non-empty.
  website2: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
