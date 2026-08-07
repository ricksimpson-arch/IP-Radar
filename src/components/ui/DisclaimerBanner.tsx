import { copy } from "@/content/copy";

/** Required IP disclaimer — SPEC.md §14.2. Renders above the fold on
    /work/lootsignal and in the footer of franchise-analysis pages. */
export function DisclaimerBanner({ variant }: { variant: "ip" }) {
  if (variant !== "ip") return null;
  return (
    <aside
      aria-label="Independence disclaimer"
      className="rounded-[var(--r-sm)] border border-line bg-ink-800 px-4 py-3 text-sm text-mute"
    >
      {copy.legal.ipDisclaimer}
    </aside>
  );
}
