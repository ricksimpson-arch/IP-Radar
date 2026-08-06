import type { Stat } from "@/lib/data/caseStudy";
import { ConfidenceChip } from "./ConfidenceChip";
import { SourceTag } from "./SourceTag";

/** Model-output figures are always mono (SPEC.md §7.2) and always carry
    provenance (SPEC.md §14.3). */
export function StatBlock({ stat }: { stat: Stat }) {
  return (
    <div className="space-y-1 rounded-[var(--r-md)] border border-line bg-ink-700 p-5">
      <div className="data-figure text-4xl font-medium">{stat.value}</div>
      <div className="text-sm text-mute">{stat.label}</div>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <SourceTag sourceType={stat.sourceType} asOf={stat.asOf} />
        <ConfidenceChip level={stat.confidence} />
      </div>
    </div>
  );
}
