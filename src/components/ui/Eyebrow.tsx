import type { ReactNode } from "react";

/** Section eyebrow. Per SPEC.md §7.3 it carries a real datum, not decoration:
    `CAPABILITIES · 6 AREAS`, `CASE STUDY · 52 FRANCHISES SCORED`. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow-label data-figure text-faint">{children}</p>;
}
