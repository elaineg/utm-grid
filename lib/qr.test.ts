/**
 * Unit tests for QR utility functions.
 * Pure functions only — no browser, no React.
 */
import { describe, expect, it } from "vitest";
import {
  slugifyForFilename,
  stableQrFilename,
  filterValidQrRows,
  buildQrResultMessage,
} from "./qr";
import { emptyRow } from "./types";
import type { UtmRow } from "./types";

// ── helpers ───────────────────────────────────────────────────────────────────

function makeRow(id: string, overrides: Partial<UtmRow> = {}): UtmRow {
  return {
    ...emptyRow(id),
    baseUrl: "https://example.com/sale",
    utm_source: "newsletter",
    utm_medium: "email",
    utm_campaign: "spring_sale",
    ...overrides,
  };
}

// ── slugifyForFilename ────────────────────────────────────────────────────────

describe("slugifyForFilename", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugifyForFilename("Spring Sale")).toBe("spring-sale");
  });

  it("replaces special chars with hyphens and collapses consecutive", () => {
    expect(slugifyForFilename("Q3 -- launch!")).toBe("q3-launch");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugifyForFilename("--hello--")).toBe("hello");
  });

  it("returns empty string for blank input", () => {
    expect(slugifyForFilename("")).toBe("");
  });

  it("handles utm_campaign with underscores", () => {
    expect(slugifyForFilename("spring_sale")).toBe("spring-sale");
  });

  it("handles mixed case utm_campaign", () => {
    expect(slugifyForFilename("BlackFriday2024")).toBe("blackfriday2024");
  });
});

// ── stableQrFilename ─────────────────────────────────────────────────────────

describe("stableQrFilename", () => {
  it("returns zero-padded row number + slugified campaign", () => {
    expect(stableQrFilename(1, "spring_sale")).toBe("01-spring-sale.png");
  });

  it("falls back to just zero-padded row number when campaign is empty", () => {
    expect(stableQrFilename(3, "")).toBe("03.png");
  });

  it("pads row number to at least 2 digits", () => {
    expect(stableQrFilename(9, "")).toBe("09.png");
    expect(stableQrFilename(10, "")).toBe("10.png");
    expect(stableQrFilename(100, "c")).toBe("100-c.png");
  });

  it("slugifies utm_campaign with spaces and special chars", () => {
    expect(stableQrFilename(2, "Black Friday 2024!")).toBe("02-black-friday-2024.png");
  });

  it("handles campaigns with only special chars → fallback", () => {
    // All special chars slug to empty → falls back to row number only
    expect(stableQrFilename(1, "!!!!!")).toBe("01.png");
  });
});

// ── filterValidQrRows ─────────────────────────────────────────────────────────

describe("filterValidQrRows — no selection (targets all rows)", () => {
  it("returns all rows that have a valid generated URL", () => {
    const rows: UtmRow[] = [
      makeRow("r1"),
      makeRow("r2"),
      makeRow("r3", { baseUrl: "", utm_source: "", utm_medium: "", utm_campaign: "" }),
    ];
    const { valid, skippedCount, targetedCount } = filterValidQrRows(rows);
    expect(valid).toHaveLength(2);
    expect(skippedCount).toBe(1);
    expect(targetedCount).toBe(3);
  });

  it("returns empty valid + skippedCount = all when all rows are invalid", () => {
    const rows: UtmRow[] = [
      makeRow("r1", { baseUrl: "", utm_source: "", utm_medium: "", utm_campaign: "" }),
    ];
    const { valid, skippedCount } = filterValidQrRows(rows);
    expect(valid).toHaveLength(0);
    expect(skippedCount).toBe(1);
  });

  it("returns all rows when all have valid URLs", () => {
    const rows = [makeRow("r1"), makeRow("r2")];
    const { valid, skippedCount } = filterValidQrRows(rows);
    expect(valid).toHaveLength(2);
    expect(skippedCount).toBe(0);
  });
});

describe("filterValidQrRows — with row selection", () => {
  it("only considers selected rows; skippedCount is relative to selection", () => {
    const rows: UtmRow[] = [
      makeRow("r1"),
      makeRow("r2"),
      makeRow("r3", { baseUrl: "", utm_source: "", utm_medium: "", utm_campaign: "" }),
    ];
    // Select r1 and r3; r3 has no valid URL
    const { valid, skippedCount, targetedCount } = filterValidQrRows(
      rows,
      new Set(["r1", "r3"])
    );
    expect(valid).toHaveLength(1);
    expect(valid[0].id).toBe("r1");
    expect(skippedCount).toBe(1);
    expect(targetedCount).toBe(2);
  });

  it("returns empty valid when selected rows all have empty URLs", () => {
    const rows: UtmRow[] = [
      makeRow("r1", { baseUrl: "", utm_source: "", utm_medium: "", utm_campaign: "" }),
      makeRow("r2"),
    ];
    const { valid, skippedCount } = filterValidQrRows(rows, new Set(["r1"]));
    expect(valid).toHaveLength(0);
    expect(skippedCount).toBe(1);
  });
});

// ── buildQrResultMessage ──────────────────────────────────────────────────────

describe("buildQrResultMessage", () => {
  it("returns all-skipped message when generatedCount is 0", () => {
    expect(buildQrResultMessage(0, 3)).toBe(
      "No QR codes — no rows have a valid URL yet."
    );
  });

  it("includes skipped clause when skippedCount > 0", () => {
    expect(buildQrResultMessage(2, 1)).toBe(
      "2 QR codes generated, 1 row skipped — no valid URL"
    );
  });

  it("omits skipped clause when skippedCount = 0", () => {
    expect(buildQrResultMessage(5, 0)).toBe("5 QR codes generated");
  });

  it("uses singular 'code' for count = 1", () => {
    expect(buildQrResultMessage(1, 0)).toBe("1 QR code generated");
  });

  it("uses plural 'codes' for count > 1", () => {
    expect(buildQrResultMessage(3, 0)).toBe("3 QR codes generated");
  });

  it("uses singular 'row' in skipped clause for count = 1", () => {
    expect(buildQrResultMessage(2, 1)).toBe(
      "2 QR codes generated, 1 row skipped — no valid URL"
    );
  });

  it("uses plural 'rows' in skipped clause for count > 1", () => {
    expect(buildQrResultMessage(3, 2)).toBe(
      "3 QR codes generated, 2 rows skipped — no valid URL"
    );
  });
});
