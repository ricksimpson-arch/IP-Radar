#!/usr/bin/env node
/**
 * CI guard for the core domain rule (build-spec §2): there is no generic
 * `revenue` field anywhere in the codebase. Money is always tagged with
 * exactly one EconomicLayer.
 *
 * Scans tracked TS/JS/SQL/Python sources for forbidden generic identifiers.
 * Deliberately narrow to avoid false positives on legitimate domain terms
 * (e.g. the REVENUE_SHARE contract-component kind or prose in docs).
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const FORBIDDEN = [
  /\brevenue\s*[:=]/i, //  revenue: / revenue =  (field or assignment)
  /\brevenue_cents\b/i,
  /\brevenueCents\b/,
  /\b(total|net|gross)_?[rR]evenue\b/,
  /"revenue"\s*:/, // JSON keys
  /\brevenue\s+BIGINT\b/i, // SQL columns
];

const files = execSync("git ls-files '*.ts' '*.tsx' '*.mjs' '*.js' '*.sql' '*.py'", {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean)
  // The guard itself and the eslint configs necessarily name the forbidden
  // identifiers in order to ban them.
  .filter((f) => f !== "scripts/check-layer-tagging.mjs" && !f.endsWith("eslint.config.mjs"));

const violations = [];
for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const pattern of FORBIDDEN) {
      if (pattern.test(line)) {
        violations.push(`${file}:${i + 1}: ${line.trim()}`);
        break;
      }
    }
  });
}

if (violations.length > 0) {
  console.error("Generic 'revenue' fields are forbidden — tag money with an EconomicLayer:");
  console.error("  CONSUMER_GMS | STORE_NET_SALES | FYUL_RECOGNIZED | FYUL_CONTRIBUTION | PIPELINE_EV");
  console.error("");
  for (const v of violations) console.error("  " + v);
  process.exit(1);
}

console.log(`layer-tagging check passed (${files.length} files scanned)`);
