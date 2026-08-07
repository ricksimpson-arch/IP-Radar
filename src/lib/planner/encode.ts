/**
 * Share-link encoding. Until planner sessions persist server-side (SPEC.md
 * §9.5, wired with the database in M5), a shared outline is fully encoded in
 * the URL: the input travels, the outline is deterministically rebuilt.
 * TODO(M5): replace with nanoid token + planner_sessions row; keep this
 * module as the fallback for expired tokens.
 */
import { plannerInputSchema } from "@/lib/validation/planner";
import type { PlannerInput } from "./types";

export function encodePlannerInput(input: PlannerInput): string {
  const json = JSON.stringify(input);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const base64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(json).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodePlannerInput(encoded: string): PlannerInput | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob === "function"
        ? new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)))
        : Buffer.from(base64, "base64").toString("utf8");
    const parsed = plannerInputSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
