"use client";

import { useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics/events";

/**
 * Interactive weight demo — SPEC.md §8.2.4. Three sliders re-rank a 10-row
 * sample. Rows are deliberately unlabeled samples (Franchise A–J), not real
 * franchise data — the demo shows the mechanic, not published figures.
 */

const DIMENSIONS = ["Demand", "Fandom", "Whitespace"] as const;

// Fixed sample scores per row and dimension, stable across loads.
const SAMPLE: number[][] = Array.from({ length: 10 }, (_, r) =>
  Array.from({ length: DIMENSIONS.length }, (_, d) => 25 + ((r * 31 + d * 47) % 71)),
);

const ROW_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export function WeightDemo() {
  const [weights, setWeights] = useState<number[]>([50, 30, 20]);
  const interactions = useRef(0);

  const ranked = useMemo(() => {
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    return SAMPLE.map((scores, i) => ({
      label: `Sample ${ROW_LABELS[i] ?? i}`,
      score: scores.reduce((acc, v, d) => acc + v * (weights[d] ?? 0), 0) / total,
    })).sort((a, b) => b.score - a.score);
  }, [weights]);

  const setWeight = (index: number, value: number) => {
    interactions.current += 1;
    track({ name: "weight_demo_used", slug: "lootsignal", interactions: interactions.current });
    setWeights((prev) => prev.map((w, i) => (i === index ? value : w)));
  };

  return (
    <div className="rounded-[var(--r-md)] border border-line bg-ink-800 p-5">
      <h3 className="text-lg">Try the weighting yourself</h3>
      <p className="mt-1 text-sm text-mute">
        Ten sample rows, three of the seven dimensions. Move a weight and watch the ranking
        respond — this is the same mechanic the full system runs across 52 franchises.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {DIMENSIONS.map((dim, i) => (
          <div key={dim}>
            <label htmlFor={`weight-${dim}`} className="flex justify-between text-sm">
              <span>{dim}</span>
              <span className="data-figure text-mute">{weights[i]}</span>
            </label>
            <input
              id={`weight-${dim}`}
              type="range"
              min={0}
              max={100}
              value={weights[i]}
              onChange={(e) => setWeight(i, Number(e.target.value))}
              className="mt-1 w-full accent-[var(--ma-signal)]"
            />
          </div>
        ))}
      </div>

      <ol className="mt-5 space-y-1.5" aria-live="polite">
        {ranked.map((row, i) => (
          <li key={row.label} className="flex items-center gap-3">
            <span className="data-figure w-6 text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
            <span className="w-24 text-sm text-mute">{row.label}</span>
            <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink-600">
              <span
                className={`absolute inset-y-0 left-0 rounded-full ${i === 0 ? "bg-signal" : "bg-cyan/40"}`}
                style={{ width: `${row.score}%` }}
              />
            </span>
            <span className="data-figure w-12 text-right text-sm">{row.score.toFixed(1)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
