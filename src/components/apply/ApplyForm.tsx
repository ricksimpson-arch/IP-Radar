"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { z } from "zod";
import { copy } from "@/content/copy";
import { track } from "@/lib/analytics/events";
import { submitApplication } from "@/lib/actions/apply";
import { decodePlannerInput } from "@/lib/planner/encode";
import {
  APPLY_INDUSTRIES,
  REGIONS,
  SECURITY_REQS,
  applicationSchema,
} from "@/lib/validation/apply";
import { APPLY_TIMELINES, BUDGET_BANDS, COMPANY_SIZES } from "@/lib/scoring/leadScore";
import { DATA_SOURCE_LABELS, INDUSTRY_LABELS, INTEGRATION_LABELS, OUTPUT_LABELS } from "@/lib/planner/labels";
import { DATA_SOURCES, INTEGRATIONS, OUTPUTS, type Timeline } from "@/lib/planner/types";
import { Button } from "@/components/ui/Button";
import { ChoiceGrid } from "@/components/ui/ChoiceGrid";
import { FieldGroup, inputClass } from "@/components/ui/FieldGroup";
import { StepProgress } from "@/components/ui/StepProgress";

const DRAFT_KEY = "ma-apply-draft-v1";

const formSchema = applicationSchema.omit({ submissionId: true, plannerToken: true, source: true, website2: true });
type FormValues = z.infer<typeof formSchema>;

const STEP_FIELDS: readonly (readonly (keyof FormValues)[])[] = [
  ["fullName", "company", "role", "email", "phone"],
  ["industry", "companySize", "website", "region"],
  ["businessProblem", "decisions"],
  ["currentData", "currentTools", "outputUsers"],
  ["desiredOutputs", "desiredOutputsOther", "integrations"],
  ["budgetBand", "timeline", "securityReqs"],
  ["consent"],
];

const BUDGET_LABELS: Record<(typeof BUDGET_BANDS)[number], string> = {
  under_25k: "Under $25k",
  "25k_75k": "$25k–$75k",
  "75k_150k": "$75k–$150k",
  "150k_plus": "$150k+",
  undetermined: "Not yet determined",
};

const TIMELINE_LABELS_APPLY: Record<(typeof APPLY_TIMELINES)[number], string> = {
  asap: "As soon as possible",
  this_quarter: "This quarter",
  this_year: "This year",
  exploring: "Exploring",
};

const SIZE_LABELS: Record<(typeof COMPANY_SIZES)[number], string> = {
  "1-10": "1–10 people",
  "11-50": "11–50 people",
  "51-200": "51–200 people",
  "201-1000": "201–1,000 people",
  "1000+": "1,000+ people",
};

const REGION_LABELS: Record<(typeof REGIONS)[number], string> = {
  north_america: "North America",
  europe: "Europe",
  uk: "United Kingdom",
  apac: "Asia-Pacific",
  latam: "Latin America",
  mea: "Middle East & Africa",
  global: "Global",
};

const SECURITY_LABELS: Record<(typeof SECURITY_REQS)[number], string> = {
  nda: "NDA required",
  dpa: "DPA required",
  region_constraint: "On-prem or region constraint",
  none: "None",
};

const PLANNER_TIMELINE_MAP: Record<Timeline, (typeof APPLY_TIMELINES)[number]> = {
  "6-8wk": "asap",
  "2-3mo": "this_quarter",
  "3-6mo": "this_year",
  exploring: "exploring",
};

export function ApplyForm({ plannerToken, source }: { plannerToken?: string; source?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string | undefined>();
  const submissionId = useRef<string>("");

  const plannerInput = useMemo(
    () => (plannerToken ? decodePlannerInput(plannerToken) : null),
    [plannerToken],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      company: "",
      role: "",
      email: "",
      phone: "",
      website: "",
      businessProblem: "",
      decisions: [""],
      currentData: plannerInput?.dataSources ?? [],
      currentTools: "",
      outputUsers: "",
      desiredOutputs: plannerInput?.outputs ?? [],
      desiredOutputsOther: "",
      integrations: plannerInput?.integrations ?? [],
      securityReqs: [],
      ...(plannerInput ? { industry: plannerInput.industry, timeline: PLANNER_TIMELINE_MAP[plannerInput.timeline] } : {}),
    },
  });

  const { register, watch, setValue, trigger, setFocus, getValues, formState } = form;

  // Restore + autosave local draft (SPEC.md §10.2), debounced 500ms.
  useEffect(() => {
    track({ name: "application_started", source: source ?? (plannerToken ? "planner" : "direct") });
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { values?: Partial<FormValues>; submissionId?: string };
        if (saved.values && !plannerToken) {
          form.reset({ ...getValues(), ...saved.values, consent: undefined as unknown as true });
        }
        if (saved.submissionId) submissionId.current = saved.submissionId;
      }
    } catch {
      // Corrupt draft — start clean.
    }
    if (!submissionId.current) submissionId.current = nanoid();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sub = watch((values) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          // Consent is never persisted in a draft — it must be re-affirmed.
          const rest = { ...values };
          delete rest.consent;
          window.localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({ values: rest, submissionId: submissionId.current }),
          );
        } catch {
          // Storage unavailable — in-session state still works.
        }
      }, 500);
    });
    return () => {
      clearTimeout(timer);
      sub.unsubscribe();
    };
  }, [watch]);

  const values = watch();
  const problemLength = values.businessProblem?.trim().length ?? 0;
  const decisions = values.decisions ?? [""];

  const goTo = (i: number) => {
    setServerError(undefined);
    setStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = async () => {
    const fields = STEP_FIELDS[step] ?? [];
    const valid = await trigger(fields as (keyof FormValues)[], { shouldFocus: true });
    if (!valid) return;
    track({
      name: "application_step_completed",
      step_index: step,
      step_name: copy.apply.stepNames[step] ?? "",
    });
    if (step < STEP_FIELDS.length - 1) {
      goTo(step + 1);
      setMaxReached((m) => Math.max(m, step + 1));
    }
  };

  const onSubmit = async () => {
    const valid = await trigger(undefined, { shouldFocus: true });
    if (!valid) return;
    setPending(true);
    setServerError(undefined);
    const result = await submitApplication({
      ...getValues(),
      submissionId: submissionId.current,
      plannerToken: plannerToken ?? "",
      source: source ?? "",
      website2: "",
    });
    setPending(false);
    if (result.ok) {
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        // Draft cleanup is best-effort.
      }
      router.push("/apply/success");
    } else {
      setServerError(result.error.message);
      const firstField = Object.keys(result.error.fields ?? {})[0] as keyof FormValues | undefined;
      if (firstField) {
        for (let i = 0; i < STEP_FIELDS.length; i++) {
          if ((STEP_FIELDS[i] ?? []).includes(firstField)) {
            goTo(i);
            setTimeout(() => setFocus(firstField), 50);
            break;
          }
        }
      }
    }
  };

  const err = (field: keyof FormValues): string | undefined =>
    formState.errors[field]?.message as string | undefined;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (step === STEP_FIELDS.length - 1) void onSubmit();
        else void next();
      }}
      className="space-y-8"
    >
      <StepProgress
        steps={copy.apply.stepNames}
        current={step}
        maxReached={maxReached}
        onNavigate={goTo}
      />

      <div aria-live="polite" className="space-y-6">
        {step === 0 ? (
          <>
            <FieldGroup id="fullName" label="Full name" error={err("fullName")}>
              <input id="fullName" type="text" autoComplete="name" className={inputClass}
                aria-invalid={Boolean(err("fullName"))} aria-describedby={err("fullName") ? "fullName-error" : undefined}
                {...register("fullName")} />
            </FieldGroup>
            <FieldGroup id="company" label="Company" error={err("company")}>
              <input id="company" type="text" autoComplete="organization" className={inputClass}
                aria-invalid={Boolean(err("company"))} aria-describedby={err("company") ? "company-error" : undefined}
                {...register("company")} />
            </FieldGroup>
            <FieldGroup id="role" label="Role" error={err("role")}>
              <input id="role" type="text" autoComplete="organization-title" className={inputClass}
                aria-invalid={Boolean(err("role"))} aria-describedby={err("role") ? "role-error" : undefined}
                {...register("role")} />
            </FieldGroup>
            <FieldGroup id="email" label="Business email" error={err("email")}>
              <input id="email" type="email" autoComplete="email" className={inputClass}
                aria-invalid={Boolean(err("email"))} aria-describedby={err("email") ? "email-error" : undefined}
                {...register("email")} />
            </FieldGroup>
            <FieldGroup id="phone" label="Phone (optional)" error={err("phone")}>
              <input id="phone" type="tel" autoComplete="tel" className={inputClass} {...register("phone")} />
            </FieldGroup>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <ChoiceGrid
              name="industry"
              legend="Industry"
              choices={APPLY_INDUSTRIES.map((v) => ({ value: v, label: INDUSTRY_LABELS[v] }))}
              multiple={false}
              selected={values.industry ? [values.industry] : []}
              onChange={(v) => {
                const [first] = v;
                if (first) setValue("industry", first as FormValues["industry"], { shouldValidate: true });
              }}
              error={err("industry")}
              errorId="industry-error"
            />
            <ChoiceGrid
              name="companySize"
              legend="Company size"
              choices={COMPANY_SIZES.map((v) => ({ value: v, label: SIZE_LABELS[v] }))}
              multiple={false}
              selected={values.companySize ? [values.companySize] : []}
              onChange={(v) => {
                const [first] = v;
                if (first) setValue("companySize", first as FormValues["companySize"], { shouldValidate: true });
              }}
              error={err("companySize")}
              errorId="companySize-error"
            />
            <FieldGroup id="website" label="Company website" error={err("website")}>
              <input id="website" type="text" inputMode="url" placeholder="company.com" className={inputClass}
                aria-invalid={Boolean(err("website"))} aria-describedby={err("website") ? "website-error" : undefined}
                {...register("website")} />
            </FieldGroup>
            <ChoiceGrid
              name="region"
              legend="Region"
              choices={REGIONS.map((v) => ({ value: v, label: REGION_LABELS[v] }))}
              multiple={false}
              selected={values.region ? [values.region] : []}
              onChange={(v) => {
                const [first] = v;
                if (first) setValue("region", first as FormValues["region"], { shouldValidate: true });
              }}
              error={err("region")}
              errorId="region-error"
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <FieldGroup
              id="businessProblem"
              label="What business problem should the system solve?"
              hint="Minimum 100 characters. Name the decision, who makes it, and how often."
              error={err("businessProblem")}
            >
              <textarea id="businessProblem" rows={6} className={inputClass}
                aria-invalid={Boolean(err("businessProblem"))}
                aria-describedby={`businessProblem-counter${err("businessProblem") ? " businessProblem-error" : ""}`}
                {...register("businessProblem")} />
              <p id="businessProblem-counter" className="data-figure text-right text-xs text-faint">
                {problemLength} / 100 min
              </p>
            </FieldGroup>

            <fieldset>
              <legend className="mb-1 font-medium">Decisions the system must support</legend>
              <p className="mb-3 text-sm text-mute">One to five, phrased as decisions.</p>
              <div className="space-y-2">
                {decisions.map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <label htmlFor={`decisions.${i}`} className="sr-only">
                      Decision {i + 1}
                    </label>
                    <input
                      id={`decisions.${i}`}
                      type="text"
                      className={inputClass}
                      placeholder={i === 0 ? "e.g. Which three product lines get budget next quarter" : undefined}
                      {...register(`decisions.${i}` as const)}
                    />
                    {decisions.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        aria-label={`Remove decision ${i + 1}`}
                        onClick={() =>
                          setValue("decisions", decisions.filter((_, j) => j !== i), { shouldValidate: true })
                        }
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
              {decisions.length < 5 ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-3"
                  onClick={() => setValue("decisions", [...decisions, ""])}
                >
                  Add another decision
                </Button>
              ) : null}
              {err("decisions") ? (
                <p role="alert" className="mt-2 text-sm text-coral">
                  {err("decisions")}
                </p>
              ) : null}
            </fieldset>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <ChoiceGrid
              name="currentData"
              legend="Which data sources exist today?"
              choices={DATA_SOURCES.map((v) => ({ value: v, label: DATA_SOURCE_LABELS[v] }))}
              multiple
              selected={values.currentData ?? []}
              onChange={(v) => setValue("currentData", v, { shouldValidate: true })}
              error={err("currentData")}
              errorId="currentData-error"
            />
            <FieldGroup id="currentTools" label="Current tools and software (optional)" error={err("currentTools")}>
              <input id="currentTools" type="text" className={inputClass} {...register("currentTools")} />
            </FieldGroup>
            <FieldGroup id="outputUsers" label="Who uses the output today? (optional)" error={err("outputUsers")}>
              <input id="outputUsers" type="text" className={inputClass} {...register("outputUsers")} />
            </FieldGroup>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <ChoiceGrid
              name="desiredOutputs"
              legend="What should the system deliver?"
              choices={OUTPUTS.map((v) => ({ value: v, label: OUTPUT_LABELS[v] }))}
              multiple
              selected={values.desiredOutputs ?? []}
              onChange={(v) => setValue("desiredOutputs", v, { shouldValidate: true })}
              error={err("desiredOutputs")}
              errorId="desiredOutputs-error"
            />
            <FieldGroup id="desiredOutputsOther" label="Anything else? (optional)" error={err("desiredOutputsOther")}>
              <input id="desiredOutputsOther" type="text" className={inputClass} {...register("desiredOutputsOther")} />
            </FieldGroup>
            <ChoiceGrid
              name="integrations"
              legend="Integrations required"
              choices={INTEGRATIONS.map((v) => ({ value: v, label: INTEGRATION_LABELS[v] }))}
              multiple
              selected={values.integrations ?? []}
              onChange={(v) => setValue("integrations", v, { shouldValidate: true })}
              error={err("integrations")}
              errorId="integrations-error"
            />
          </>
        ) : null}

        {step === 5 ? (
          <>
            <ChoiceGrid
              name="budgetBand"
              legend="Budget range"
              choices={BUDGET_BANDS.map((v) => ({ value: v, label: BUDGET_LABELS[v] }))}
              multiple={false}
              selected={values.budgetBand ? [values.budgetBand] : []}
              onChange={(v) => {
                const [first] = v;
                if (first) setValue("budgetBand", first as FormValues["budgetBand"], { shouldValidate: true });
              }}
              error={err("budgetBand")}
              errorId="budgetBand-error"
            />
            <ChoiceGrid
              name="timeline"
              legend="Timeline"
              choices={APPLY_TIMELINES.map((v) => ({ value: v, label: TIMELINE_LABELS_APPLY[v] }))}
              multiple={false}
              selected={values.timeline ? [values.timeline] : []}
              onChange={(v) => {
                const [first] = v;
                if (first) setValue("timeline", first as FormValues["timeline"], { shouldValidate: true });
              }}
              error={err("timeline")}
              errorId="timeline-error"
            />
            <ChoiceGrid
              name="securityReqs"
              legend="Data-security requirements"
              choices={SECURITY_REQS.map((v) => ({ value: v, label: SECURITY_LABELS[v] }))}
              multiple
              selected={values.securityReqs ?? []}
              onChange={(v) => setValue("securityReqs", v as FormValues["securityReqs"], { shouldValidate: true })}
              error={err("securityReqs")}
              errorId="securityReqs-error"
            />
            <p className="text-sm text-mute">
              Supporting files (decks, data samples) can be sent by replying to your confirmation
              email — secure upload straight from this form is on its way.
            </p>
          </>
        ) : null}

        {step === 6 ? (
          <>
            <div className="space-y-4 rounded-[var(--r-md)] border border-line bg-ink-800 p-6">
              <h2 className="text-xl">Review your application</h2>
              {copy.apply.stepNames.slice(0, 6).map((name, i) => (
                <div key={name} className="flex items-start justify-between gap-4 border-t border-line pt-3">
                  <div className="text-sm">
                    <p className="eyebrow-label text-faint">{name}</p>
                    <p className="mt-1 text-mute">{summarizeStep(i, values)}</p>
                  </div>
                  <Button type="button" variant="ghost" onClick={() => goTo(i)} aria-label={`Edit step ${name}`}>
                    Edit
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1.5 accent-[var(--ma-signal)]"
                  aria-invalid={Boolean(err("consent"))}
                  aria-describedby={err("consent") ? "consent-error" : undefined}
                  {...register("consent")}
                />
                <span className="text-sm text-mute">{copy.apply.consentLabel}</span>
              </label>
              {err("consent") ? (
                <p id="consent-error" role="alert" className="text-sm text-coral">
                  {err("consent")}
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      {serverError ? (
        <p role="alert" className="text-sm text-coral">
          {serverError}
        </p>
      ) : null}

      <div className="flex items-center gap-4">
        {step > 0 ? (
          <Button type="button" variant="secondary" onClick={() => goTo(step - 1)}>
            Back
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {step === STEP_FIELDS.length - 1
            ? pending
              ? "Submitting…"
              : "Submit application"
            : "Continue"}
        </Button>
      </div>
    </form>
  );
}

function summarizeStep(step: number, values: Partial<FormValues>): string {
  switch (step) {
    case 0:
      return [values.fullName, values.role, values.company, values.email].filter(Boolean).join(" · ") || "Not filled in";
    case 1:
      return [values.industry && INDUSTRY_LABELS[values.industry], values.companySize, values.website]
        .filter(Boolean)
        .join(" · ") || "Not filled in";
    case 2: {
      const problem = values.businessProblem?.slice(0, 120) ?? "";
      const count = (values.decisions ?? []).filter((d) => d?.trim()).length;
      return problem ? `${problem}… · ${count} decision${count === 1 ? "" : "s"}` : "Not filled in";
    }
    case 3:
      return (values.currentData ?? []).map((v) => DATA_SOURCE_LABELS[v as keyof typeof DATA_SOURCE_LABELS] ?? v).join(", ") || "Not filled in";
    case 4:
      return (values.desiredOutputs ?? []).map((v) => OUTPUT_LABELS[v as keyof typeof OUTPUT_LABELS] ?? v).join(", ") || "Not filled in";
    case 5:
      return [values.budgetBand, values.timeline, (values.securityReqs ?? []).join(", ")].filter(Boolean).join(" · ") || "Not filled in";
    default:
      return "";
  }
}
