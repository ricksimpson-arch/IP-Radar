/**
 * Storage key sanitization — SPEC.md §10.3. Client filenames are never
 * trusted: path characters are stripped and the stored key is
 * applications/{applicationId}/{uuid}-{sanitizedName}.
 */

export const ALLOWED_EXTENSIONS = ["pdf", "csv", "xlsx", "docx", "pptx", "png", "jpg"] as const;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_FILES = 5;

export function sanitizeFilename(name: string): string {
  // Keep only the basename, then whitelist characters.
  const base = name.split(/[/\\]/).pop() ?? "file";
  const cleaned = base
    .replace(/\.{2,}/g, ".")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^[._-]+/, "");
  return (cleaned || "file").slice(0, 120);
}

export function hasAllowedExtension(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

export function storageKey(applicationId: string, uuid: string, originalName: string): string {
  return `applications/${applicationId}/${uuid}-${sanitizeFilename(originalName)}`;
}
