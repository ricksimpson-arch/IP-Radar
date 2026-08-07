import type { Confidence } from "@/lib/data/caseStudy";

const styles: Record<Confidence, string> = {
  high: "border-line text-mute",
  medium: "border-amber/40 text-amber",
  low: "border-coral/40 text-coral",
};

const labels: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export function ConfidenceChip({ level }: { level: Confidence }) {
  return (
    <span
      className={`data-figure inline-flex items-center rounded-[var(--r-sm)] border px-2 py-0.5 text-xs ${styles[level]}`}
    >
      {labels[level]}
    </span>
  );
}
