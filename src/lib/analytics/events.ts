/**
 * Typed event emitter — SPEC.md §17. A discriminated union of every event;
 * adding an untyped event is a compile error. Events carry no PII (§15.2).
 *
 * TODO(M7): route through a consent-gated PostHog wrapper. Until analytics
 * is wired, track() is a no-op that logs in development only.
 */

export type AnalyticsEvent =
  | { name: "cta_clicked"; location: string; label: string; destination: string }
  | { name: "case_study_viewed"; slug: string }
  | { name: "case_study_scroll_75"; slug: string; seconds_on_page: number }
  | { name: "weight_demo_used"; slug: string; interactions: number }
  | { name: "planner_started"; entry_point: string }
  | { name: "planner_step_completed"; step_index: number; step_name: string }
  | { name: "planner_completed"; archetype: string; modules_count: number; timeline: string }
  | { name: "planner_outline_emailed"; archetype: string }
  | { name: "planner_to_apply"; archetype: string }
  | { name: "application_started"; source: string; planner_session_id?: string }
  | { name: "application_step_completed"; step_index: number; step_name: string }
  | { name: "application_abandoned"; last_step: number }
  | { name: "application_resumed"; last_step: number }
  | { name: "file_uploaded"; count: number; total_size_band: string }
  | {
      name: "application_submitted";
      industry: string;
      budget_band: string;
      timeline: string;
      score_band: string;
    }
  | { name: "booking_confirmed"; lead_time_hours: number }
  | { name: "contact_submitted"; kind: string };

export function track(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event.name, event);
  }
}
