"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  DATA_SOURCES,
  DECISION_TYPES,
  INDUSTRIES,
  INTEGRATIONS,
  OUTPUTS,
  TEAM_SIZES,
  TIMELINES,
  type PlannerInput,
} from "@/lib/planner/types";
import {
  DATA_SOURCE_LABELS,
  DECISION_LABELS,
  INDUSTRY_LABELS,
  INTEGRATION_LABELS,
  OUTPUT_LABELS,
  TEAM_SIZE_LABELS,
  TIMELINE_LABELS,
} from "@/lib/planner/labels";
import { buildOutline } from "@/lib/planner/engine";
import { encodePlannerInput } from "@/lib/planner/encode";
import { plannerInputSchema } from "@/lib/validation/planner";
import { track } from "@/lib/analytics/events";
import { emailOutline, type EmailOutlineState } from "@/lib/actions/planner";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChoiceGrid } from "@/components/ui/ChoiceGrid";
import { FieldGroup, inputClass } from "@/components/ui/FieldGroup";
import { StepProgress } from "@/components/ui/StepProgress";
import { SystemOutlineCard } from "./SystemOutlineCard";

const STEP_NAMES = ["Industry", "Decision", "Data", "Outputs", "Integrations", "Timeline"] as const;

const DRAFT_KEY = "ma-planner-draft-v1";

type Draft = {
  industry: string[];
  decision: string[];
  decisionDetail: string;
  dataSources: string[];
  outputs: string[];
  integrations: string[];
  timeline: string[];
  teamSize: string[];
};

const emptyDraft: Draft = {
  industry: [],
  decision: [],
  decisionDetail: "",
  dataSources: [],
  outputs: [],
  integrations: [],
  timeline: [],
  teamSize: [],
};

const emailInitial: EmailOutlineState = { status: "idle" };

export function PlannerWizard({ initialDetail }: { initialDetail?: string }) {
  const [draft, setDraft] = useState<Draft>({ ...emptyDraft, decisionDetail: initialDetail ?? "" });
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [error, setError] = useState<string | undefined>();
  const [complete, setComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailState, emailAction, emailPending] = useActionState(emailOutline, emailInitial);

  // Restore local draft (SPEC.md §9.1: all steps persisted).
  useEffect(() => {
    track({ name: "planner_started", entry_point: initialDetail ? "home_inline" : "direct" });
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Draft>;
        setDraft((d) => ({ ...d, ...saved, decisionDetail: initialDetail ?? saved.decisionDetail ?? "" }));
      }
    } catch {
      // A corrupt draft is discarded silently; the visitor starts clean.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Storage full/blocked — the wizard still works within the session.
    }
  }, [draft]);

  const input: PlannerInput | null = useMemo(() => {
    const candidate = {
      industry: draft.industry[0],
      decision: draft.decision[0],
      decisionDetail: draft.decisionDetail || undefined,
      dataSources: draft.dataSources,
      outputs: draft.outputs,
      integrations: draft.integrations,
      timeline: draft.timeline[0],
      teamSize: draft.teamSize[0],
    };
    const parsed = plannerInputSchema.safeParse(candidate);
    return parsed.success ? parsed.data : null;
  }, [draft]);

  const outline = useMemo(() => (complete && input ? buildOutline(input) : null), [complete, input]);
  const token = useMemo(() => (input ? encodePlannerInput(input) : ""), [input]);

  useEffect(() => {
    if (outline && input) {
      track({
        name: "planner_completed",
        archetype: outline.archetype.id,
        modules_count: outline.modules.length,
        timeline: input.timeline,
      });
    }
  }, [outline, input]);

  const stepValid = (): string | undefined => {
    switch (step) {
      case 0:
        return draft.industry.length ? undefined : "Select your industry.";
      case 1:
        return draft.decision.length ? undefined : "Select the decision type.";
      case 2:
        return draft.dataSources.length ? undefined : "Select at least one — 'None yet' counts.";
      case 3:
        return draft.outputs.length ? undefined : "Select at least one output.";
      case 4:
        return draft.integrations.length ? undefined : "Select at least one — 'None' counts.";
      case 5:
        return draft.timeline.length ? undefined : "Select a timeline.";
      default:
        return undefined;
    }
  };

  const next = () => {
    const problem = stepValid();
    if (problem) {
      setError(problem);
      return;
    }
    setError(undefined);
    track({ name: "planner_step_completed", step_index: step, step_name: STEP_NAMES[step] ?? "" });
    if (step === STEP_NAMES.length - 1) {
      setComplete(true);
    } else {
      setStep(step + 1);
      setMaxReached(Math.max(maxReached, step + 1));
    }
  };

  if (outline && input) {
    return (
      <div className="space-y-8">
        <SystemOutlineCard outline={outline} />

        <div className="flex flex-wrap items-center gap-4">
          <ButtonLink
            href={`/apply?planner=${token}`}
            onClick={() => track({ name: "planner_to_apply", archetype: outline.archetype.id })}
          >
            Apply for a Custom Build
          </ButtonLink>
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(`${window.location.origin}/planner/${token}`);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "Link copied" : "Copy link"}
          </Button>
          <Button variant="ghost" onClick={() => setComplete(false)}>
            Edit answers
          </Button>
        </div>

        <form action={emailAction} className="max-w-md space-y-3">
          <input type="hidden" name="token" value={token} />
          <FieldGroup
            id="outline-email"
            label="Email me this outline"
            error={emailState.status === "error" ? emailState.message : undefined}
          >
            <input
              id="outline-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              onFocus={() => track({ name: "planner_outline_emailed", archetype: outline.archetype.id })}
            />
          </FieldGroup>
          {emailState.status === "success" ? (
            <p role="status" className="text-sm text-mute">
              {emailState.message}
            </p>
          ) : (
            <Button type="submit" variant="secondary" disabled={emailPending}>
              {emailPending ? "Sending…" : "Send outline"}
            </Button>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StepProgress
        steps={STEP_NAMES}
        current={step}
        maxReached={maxReached}
        onNavigate={(i) => {
          setError(undefined);
          setStep(i);
        }}
      />

      <div aria-live="polite" className="space-y-6">
        {step === 0 ? (
          <ChoiceGrid
            name="industry"
            legend="Which segment are you in?"
            choices={INDUSTRIES.map((v) => ({ value: v, label: INDUSTRY_LABELS[v] }))}
            multiple={false}
            selected={draft.industry}
            onChange={(v) => setDraft({ ...draft, industry: v })}
            error={error}
            errorId="planner-step-error"
          />
        ) : null}

        {step === 1 ? (
          <div className="space-y-6">
            <ChoiceGrid
              name="decision"
              legend="What decision are you trying to make?"
              choices={DECISION_TYPES.map((v) => ({ value: v, label: DECISION_LABELS[v] }))}
              multiple={false}
              selected={draft.decision}
              onChange={(v) => setDraft({ ...draft, decision: v })}
              error={error}
              errorId="planner-step-error"
            />
            <FieldGroup
              id="decision-detail"
              label="In your own words (optional)"
              hint="One sentence is plenty. 280 characters max."
            >
              <textarea
                id="decision-detail"
                rows={2}
                maxLength={280}
                value={draft.decisionDetail}
                onChange={(e) => setDraft({ ...draft, decisionDetail: e.target.value })}
                className={inputClass}
              />
            </FieldGroup>
          </div>
        ) : null}

        {step === 2 ? (
          <ChoiceGrid
            name="dataSources"
            legend="Which data sources exist today?"
            choices={DATA_SOURCES.map((v) => ({ value: v, label: DATA_SOURCE_LABELS[v] }))}
            multiple
            selected={draft.dataSources}
            onChange={(v) => setDraft({ ...draft, dataSources: v })}
            error={error}
            errorId="planner-step-error"
          />
        ) : null}

        {step === 3 ? (
          <ChoiceGrid
            name="outputs"
            legend="What should the system produce?"
            choices={OUTPUTS.map((v) => ({ value: v, label: OUTPUT_LABELS[v] }))}
            multiple
            selected={draft.outputs}
            onChange={(v) => setDraft({ ...draft, outputs: v })}
            error={error}
            errorId="planner-step-error"
          />
        ) : null}

        {step === 4 ? (
          <ChoiceGrid
            name="integrations"
            legend="Which systems must it connect to?"
            choices={INTEGRATIONS.map((v) => ({ value: v, label: INTEGRATION_LABELS[v] }))}
            multiple
            selected={draft.integrations}
            onChange={(v) => setDraft({ ...draft, integrations: v })}
            error={error}
            errorId="planner-step-error"
          />
        ) : null}

        {step === 5 ? (
          <div className="space-y-6">
            <ChoiceGrid
              name="timeline"
              legend="When do you need it working?"
              choices={TIMELINES.map((v) => ({ value: v, label: TIMELINE_LABELS[v] }))}
              multiple={false}
              selected={draft.timeline}
              onChange={(v) => setDraft({ ...draft, timeline: v })}
              error={error}
              errorId="planner-step-error"
            />
            <ChoiceGrid
              name="teamSize"
              legend="Who will use it? (optional)"
              choices={TEAM_SIZES.map((v) => ({ value: v, label: TEAM_SIZE_LABELS[v] }))}
              multiple={false}
              selected={draft.teamSize}
              onChange={(v) => setDraft({ ...draft, teamSize: v })}
            />
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        {step > 0 ? (
          <Button variant="secondary" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : null}
        <Button onClick={next}>
          {step === STEP_NAMES.length - 1 ? "Generate system outline" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
