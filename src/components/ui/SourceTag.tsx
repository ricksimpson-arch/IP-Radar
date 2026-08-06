import type { SourceType } from "@/lib/data/caseStudy";

const labels: Record<SourceType, string> = {
  observed: "Observed",
  modeled: "Modeled",
  estimated: "Estimated",
};

/** Provenance tag per SPEC.md §14.3 — every published figure carries one. */
export function SourceTag({ sourceType, asOf }: { sourceType: SourceType; asOf: string }) {
  return (
    <span className="data-figure text-xs text-faint">
      {labels[sourceType]} · as of {asOf}
    </span>
  );
}
