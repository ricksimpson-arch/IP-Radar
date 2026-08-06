/** Planner input schema at the server boundary — SPEC.md §9.1 + rule 2. */
import { z } from "zod";
import {
  DATA_SOURCES,
  DECISION_TYPES,
  INDUSTRIES,
  INTEGRATIONS,
  OUTPUTS,
  TEAM_SIZES,
  TIMELINES,
} from "@/lib/planner/types";

export const plannerInputSchema = z.object({
  industry: z.enum(INDUSTRIES),
  decision: z.enum(DECISION_TYPES),
  decisionDetail: z.string().trim().max(280).optional(),
  dataSources: z.array(z.enum(DATA_SOURCES)).max(DATA_SOURCES.length),
  outputs: z.array(z.enum(OUTPUTS)).min(1).max(OUTPUTS.length),
  integrations: z.array(z.enum(INTEGRATIONS)).max(INTEGRATIONS.length),
  timeline: z.enum(TIMELINES),
  teamSize: z.enum(TEAM_SIZES).optional(),
});

export type PlannerInputParsed = z.infer<typeof plannerInputSchema>;
