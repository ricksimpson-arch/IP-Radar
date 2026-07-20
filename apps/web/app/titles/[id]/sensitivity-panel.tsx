import { computeSensitivity, type TitleEconomicsInputs } from "@ip-radar/economics";

/**
 * Sensitivity panel (§5): top-5 EV drivers under ±10% shocks and the
 * contribution break-even multiplier per driver. Server-rendered — the
 * computation is pure and runs at build/request time.
 */
const DRIVER_LABELS: Record<string, string> = {
  traffic: "Traffic",
  conversion: "Conversion",
  aov: "Realized AOV",
  returns: "Returns / refunds",
  variable_costs: "Variable costs",
  royalty_rate: "Royalty rate",
  guarantee: "Guarantee exposure",
  marketing_committed: "Committed marketing/launch",
  launch_delay: "Launch delay",
  p_rights_win: "P(rights win)",
  capacity: "Capacity feasibility",
};

function usdSigned(amountCents: number): string {
  const s = (Math.abs(amountCents) / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  return amountCents < 0 ? `−${s}` : `+${s}`;
}

export function SensitivityPanel({ economics }: { economics: TitleEconomicsInputs }) {
  const report = computeSensitivity(economics);

  if (report.status === "TERMS_UNMAPPED") {
    return (
      <section aria-label="Sensitivity" className="mt-10">
        <h2 className="text-lg font-semibold">Sensitivity</h2>
        <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Blocked: contribution drivers cannot be computed without mapped deal terms
          (TERMS_UNMAPPED).
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Sensitivity" className="mt-10">
      <h2 className="text-lg font-semibold">Sensitivity — top 5 EV drivers</h2>
      <p className="mt-1 text-sm text-slate-600">
        Effect on Pipeline EV of a ±10% shock to each driver, recomputed through the real
        identities. Break-even = driver multiplier at which FYUL contribution reaches zero.
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-4 py-3">Driver</th>
              <th scope="col" className="px-4 py-3 text-right">EV Δ at +10%</th>
              <th scope="col" className="px-4 py-3 text-right">EV Δ at −10%</th>
              <th scope="col" className="px-4 py-3 text-right">Contribution break-even</th>
            </tr>
          </thead>
          <tbody>
            {report.topDrivers.map((d) => (
              <tr key={d.driver} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium">{DRIVER_LABELS[d.driver] ?? d.driver}</td>
                <td className="px-4 py-3 text-right tabular-nums">{usdSigned(d.evDeltaUpCents)}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {usdSigned(d.evDeltaDownCents)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {d.breakEvenMultiplier !== null
                    ? `×${d.breakEvenMultiplier.toFixed(2)}`
                    : (d.breakEvenNote ?? "none in range")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Not yet modeled (disclosed, not dropped):{" "}
        {report.notModeled.map((d) => d.driver.replaceAll("_", " ")).join(", ")}.
      </p>
    </section>
  );
}
