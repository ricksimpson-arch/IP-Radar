import { copy } from "@/content/copy";

const disclaimers = {
  ip: copy.legal.ipDisclaimer,
  "ip-snowflurry": copy.legal.ipDisclaimerSnowFlurry,
} as const;

/** Required IP disclaimer — SPEC.md §14.2. Renders above the fold on case
    studies and in the footer of pages showing franchise-level analysis. */
export function DisclaimerBanner({ variant }: { variant: keyof typeof disclaimers }) {
  const text = disclaimers[variant];
  if (!text) return null;
  return (
    <aside
      aria-label="Independence disclaimer"
      className="rounded-[var(--r-sm)] border border-line bg-ink-800 px-4 py-3 text-sm text-mute"
    >
      {text}
    </aside>
  );
}
