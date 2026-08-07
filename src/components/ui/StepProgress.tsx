"use client";

/** Step progress for planner and application — SPEC.md §10.2.
    Completed steps are keyboard-navigable buttons; future steps are inert. */
export function StepProgress({
  steps,
  current,
  maxReached,
  onNavigate,
}: {
  steps: readonly string[];
  current: number;
  maxReached: number;
  onNavigate: (index: number) => void;
}) {
  return (
    <nav aria-label="Form steps">
      <ol className="flex flex-wrap gap-2">
        {steps.map((name, i) => {
          const isCurrent = i === current;
          const reachable = i <= maxReached;
          return (
            <li key={name}>
              <button
                type="button"
                disabled={!reachable}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => reachable && onNavigate(i)}
                className={`data-figure min-h-11 rounded-[var(--r-sm)] border px-3 py-1.5 text-xs transition-colors duration-120 ${
                  isCurrent
                    ? "border-signal text-paper"
                    : reachable
                      ? "border-line text-mute hover:text-paper"
                      : "border-line text-faint"
                }`}
              >
                {String(i + 1).padStart(2, "0")} {name}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
