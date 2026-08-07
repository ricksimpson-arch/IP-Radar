import { describe, expect, it } from "vitest";
import { hasAllowedExtension, sanitizeFilename, storageKey } from "@/lib/storage/sanitize";

describe("sanitizeFilename (SPEC §10.3)", () => {
  it("strips path traversal and separators", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("..\\..\\windows\\system32.dll")).toBe("system32.dll");
    expect(sanitizeFilename("dir/sub/report.pdf")).toBe("report.pdf");
  });

  it("whitelists characters and collapses dot runs", () => {
    expect(sanitizeFilename("q3 report (final)!.pdf")).toBe("q3_report__final__.pdf");
    expect(sanitizeFilename("evil....pdf")).toBe("evil.pdf");
  });

  it("never returns an empty or hidden-file name", () => {
    expect(sanitizeFilename("")).toBe("file");
    expect(sanitizeFilename(".htaccess")).toBe("htaccess");
  });

  it("caps length at 120 characters", () => {
    expect(sanitizeFilename(`${"a".repeat(200)}.pdf`).length).toBeLessThanOrEqual(120);
  });
});

describe("hasAllowedExtension", () => {
  it("accepts the SPEC allowlist and rejects executables", () => {
    expect(hasAllowedExtension("deck.pdf")).toBe(true);
    expect(hasAllowedExtension("data.XLSX")).toBe(true);
    expect(hasAllowedExtension("malware.exe")).toBe(false);
    expect(hasAllowedExtension("script.js")).toBe(false);
    expect(hasAllowedExtension("noextension")).toBe(false);
  });
});

describe("storageKey", () => {
  it("builds the applications/{id}/{uuid}-{name} shape", () => {
    expect(storageKey("app-1", "uuid-2", "my deck.pdf")).toBe("applications/app-1/uuid-2-my_deck.pdf");
  });
});
