/**
 * Application form schemas — SPEC.md §10. Per-step schemas shared by the
 * client (React Hook Form resolver) and the server boundary (rule 2:
 * every user input crosses a Zod schema server-side before persistence).
 */
import { z } from "zod";
import { copy } from "@/content/copy";
import { APPLY_TIMELINES, BUDGET_BANDS, COMPANY_SIZES, isFreeEmailDomain } from "@/lib/scoring/leadScore";

export const APPLY_INDUSTRIES = [
  "entertainment_media",
  "ecommerce_merch",
  "consumer_products",
  "licensing_ip",
  "private_equity",
  "corporate_strategy",
  "other",
] as const;

export const REGIONS = ["north_america", "europe", "uk", "apac", "latam", "mea", "global"] as const;

export const SECURITY_REQS = ["nda", "dpa", "region_constraint", "none"] as const;

export const businessEmailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .refine((email) => !isFreeEmailDomain(email), {
    message: copy.apply.freeEmailError,
  });

export const stepYouSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  company: z.string().trim().min(2, "Enter your company name."),
  role: z.string().trim().min(2, "Enter your role."),
  email: businessEmailSchema,
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export const stepCompanySchema = z.object({
  industry: z.enum(APPLY_INDUSTRIES, { message: "Select your industry." }),
  companySize: z.enum(COMPANY_SIZES, { message: "Select your company size." }),
  website: z
    .string()
    .trim()
    .min(4, "Enter your company website.")
    .refine((v) => /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(v.replace(/^https?:\/\//i, "")), {
      message: "Enter a valid website address.",
    }),
  region: z.enum(REGIONS, { message: "Select your region." }),
});

export const stepProblemSchema = z.object({
  businessProblem: z.string().trim().min(100, copy.apply.problemMinError).max(4000),
  decisions: z
    .array(z.string().trim().min(4, "Describe the decision in a few words."))
    .min(1, "Add at least one decision the system must support.")
    .max(5, "Keep it to the five most important decisions."),
});

export const stepCurrentStateSchema = z.object({
  currentData: z.array(z.string().trim().min(1)).min(1, "Select at least one — 'None yet' counts."),
  currentTools: z.string().trim().max(1000).optional().or(z.literal("")),
  outputUsers: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const stepWantsSchema = z.object({
  desiredOutputs: z.array(z.string().trim().min(1)).min(1, "Select at least one deliverable."),
  desiredOutputsOther: z.string().trim().max(500).optional().or(z.literal("")),
  integrations: z.array(z.string().trim().min(1)),
});

export const stepScopeSchema = z.object({
  budgetBand: z.enum(BUDGET_BANDS, { message: "Select a budget range — 'not yet determined' is fine." }),
  timeline: z.enum(APPLY_TIMELINES, { message: "Select a timeline." }),
  securityReqs: z.array(z.enum(SECURITY_REQS)).min(1, "Select at least one — 'None' counts."),
});

export const stepReviewSchema = z.object({
  consent: z.literal(true, {
    message: "Consent is required to submit the application.",
  }),
});

/** Full submission schema — the server boundary for the submit action. */
export const applicationSchema = stepYouSchema
  .merge(stepCompanySchema)
  .merge(stepProblemSchema)
  .merge(stepCurrentStateSchema)
  .merge(stepWantsSchema)
  .merge(stepScopeSchema)
  .merge(stepReviewSchema)
  .extend({
    submissionId: z.string().trim().min(8).max(64),
    plannerToken: z.string().trim().max(64).optional().or(z.literal("")),
    source: z.string().trim().max(64).optional().or(z.literal("")),
    // Honeypot: real users never fill this; non-empty submissions are dropped.
    website2: z.string().max(0).optional().or(z.literal("")),
  });

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const APPLY_STEP_SCHEMAS = [
  stepYouSchema,
  stepCompanySchema,
  stepProblemSchema,
  stepCurrentStateSchema,
  stepWantsSchema,
  stepScopeSchema,
  stepReviewSchema,
] as const;
