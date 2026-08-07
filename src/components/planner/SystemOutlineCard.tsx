import type { SystemOutline } from "@/lib/planner/types";
import { ConfidenceChip } from "@/components/ui/ConfidenceChip";

/** System Outline renderer — SPEC.md §9.3. Styled to read as an internal
    deliverable, not a marketing block. */
export function SystemOutlineCard({ outline }: { outline: SystemOutline }) {
  const core = outline.modules.filter((m) => m.phase === "core");
  const phase2 = outline.modules.filter((m) => m.phase === "phase2");

  return (
    <div className="rounded-[var(--r-lg)] border border-line bg-ink-800">
      <header className="border-b border-line p-6">
        <p className="eyebrow-label data-figure text-faint">System outline · deterministic</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl">{outline.archetype.name}</h2>
          <ConfidenceChip level={outline.confidence} />
        </div>
        <p className="mt-3 text-sm text-mute">{outline.rationale}</p>
      </header>

      <div className="grid gap-px bg-line md:grid-cols-2">
        <section className="bg-ink-800 p-6">
          <h3 className="eyebrow-label text-faint">Modules — core</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {core.map((m) => (
              <li key={m.id} className="border-l-2 border-line pl-3">
                {m.name}
              </li>
            ))}
          </ul>
          {phase2.length > 0 ? (
            <>
              <h3 className="eyebrow-label mt-5 text-faint">Modules — phase 2</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-mute">
                {phase2.map((m) => (
                  <li key={m.id} className="border-l-2 border-line pl-3">
                    {m.name}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>

        <section className="bg-ink-800 p-6">
          <h3 className="eyebrow-label text-faint">Data plan</h3>
          {outline.dataPlan.entries.length > 0 ? (
            <ul className="mt-2 space-y-2 text-sm">
              {outline.dataPlan.entries.map((entry) => (
                <li key={entry.source}>
                  <span>{entry.label}</span>
                  <span className="block text-xs text-mute">→ {entry.ingestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-mute">No sources selected.</p>
          )}
          {outline.dataPlan.gaps.map((gap) => (
            <p key={gap} className="mt-3 border-l-2 border-amber/40 pl-3 text-sm text-mute">
              {gap}
            </p>
          ))}
        </section>

        <section className="bg-ink-800 p-6">
          <h3 className="eyebrow-label text-faint">Suggested dashboard sections</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {outline.dashboardSections.map((s) => (
              <li key={s} className="border-l-2 border-line pl-3">
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-ink-800 p-6">
          <h3 className="eyebrow-label text-faint">Phased timeline</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {outline.effort.map((phase) => (
              <li key={phase.phase} className="flex justify-between gap-4">
                <span>{phase.phase}</span>
                <span className="data-figure text-mute">
                  {phase.weeksLow}–{phase.weeksHigh} wk
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="border-t border-line p-6">
        <h3 className="eyebrow-label text-faint">Risks & assumptions</h3>
        <ul className="mt-2 space-y-2 text-sm text-mute">
          {outline.risks.map((r) => (
            <li key={r} className="border-l-2 border-coral/40 pl-3">
              {r}
            </li>
          ))}
          {outline.assumptions.map((a) => (
            <li key={a} className="border-l-2 border-line pl-3">
              {a}
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
