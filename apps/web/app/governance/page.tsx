import { computeWaterfall } from "@ip-radar/economics";
import { listDemoOpportunities } from "@ip-radar/demo-data";

/**
 * Governance center (§6.6): data freshness, model versions, validation
 * posture, overrides, access control. Everything shown is real state — this
 * page never renders a vanity metric or a number nothing computed.
 */
export const metadata = { title: "Governance — IP Radar" };

const META = {
  metric_version: "metric-v0.placeholder",
  model_version: "model-v0.placeholder",
  data_snapshot_id: "snapshot-demo-fixtures",
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="mt-3 space-y-2 text-sm text-slate-700">{children}</div>
    </section>
  );
}

export default function GovernancePage() {
  const opportunities = listDemoOpportunities();
  const unmapped = opportunities.filter(
    (o) => computeWaterfall(o.economics).status === "TERMS_UNMAPPED"
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Governance center</h1>
      <p className="mt-2 text-sm text-slate-600">
        Live platform state: versions, data posture, model validation, overrides, and access
        control. Nothing on this page is a placeholder metric dressed up as progress.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title="Versions">
          <p>
            metric_version <code className="rounded bg-slate-100 px-1">{META.metric_version}</code>
          </p>
          <p>
            model_version <code className="rounded bg-slate-100 px-1">{META.model_version}</code>
          </p>
          <p>
            data_snapshot_id{" "}
            <code className="rounded bg-slate-100 px-1">{META.data_snapshot_id}</code>
          </p>
          <p className="text-xs text-slate-500">
            Every forecast-affecting change bumps metric_version or model_version; the metric
            registry is Finance-versioned once real definitions are signed off.
          </p>
        </Card>
        <Card title="Data">
          <p>
            Source: <strong>synthetic demo fixtures</strong> — no real systems connected (Phase 0).
          </p>
          <p>{opportunities.length} tracked opportunities.</p>
          <p>
            Unmapped deal terms ({unmapped.length}):{" "}
            {unmapped.map((o) => o.title).join(", ") || "none"} — FYUL layers blocked for these.
          </p>
        </Card>
        <Card title="Models & validation">
          <p>
            Promoted models: <strong>none</strong>. Available baselines: deterministic stub,
            cohort-median demand baseline (≥3 comparables or it abstains), stage-conversion
            P(rights win) baseline.
          </p>
          <p>
            Backtests run: none yet. Metric definitions are locked and unit-tested (WAPE, MAE,
            bias, P10/P90 coverage by horizon/segment; Brier + reliability for rights models) so
            every future comparison uses identical arithmetic.
          </p>
          <p className="text-xs text-slate-500">
            A complex model may only replace a baseline with a committed backtest report showing
            durable lift (LOIO + time-aware).
          </p>
        </Card>
        <Card title="Overrides & access">
          <p>Manual overrides recorded: 0 — capture lands with the Postgres-backed tables.</p>
          <p>
            Access control: demo header-based roles, default-deny. Confidential contract terms are
            redacted for all roles except finance, data_eng, admin — verified by automated access
            tests, including exports. SSO + row-level security land in Phase 3.
          </p>
        </Card>
      </div>
      <p className="mt-6 text-xs text-slate-500">
        Open Phase 0 questions block the next milestones — see OPEN_QUESTIONS.md in the repo.
      </p>
    </main>
  );
}
