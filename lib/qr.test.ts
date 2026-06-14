/**
 * Unit tests for QR utility functions.
 * Pure functions only — no browser, no React.
 */
import { describe, expect, it } from "vitest";
import {
  slugifyForFilename,
  stableQrFilename,
  contactSheetLabel,
  filterValidQrRows,
  buildQrResultMessage,
  isRowQrEligible,
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

/** Build a simple eligibility map (all rows eligible unless in the blocked set). */
function eligibilityMap(
  rows: UtmRow[],
  blockedIds: Set<string> = new Set()
): Map<string, boolean> {
  return new Map(rows.map((r) => [r.id, !blockedIds.has(r.id)]));
}

// ── isRowQrEligible ───────────────────────────────────────────────────────────

describe("isRowQrEligible", () => {
  it("returns true when row has a valid URL and eligibility=true", () => {
    const row = makeRow("r1");
    expect(isRowQrEligible(row, true)).toBe(true);
  });

  it("returns false when eligibility=false (blocking lint)", () => {
    const row = makeRow("r1");
    expect(isRowQrEligible(row, false)).toBe(false);
  });

  it("returns false when row has no generated URL (blank base) even if eligible=true", () => {
    const row = makeRow("r1", { baseUrl: "", utm_source: "", utm_medium: "", utm_campaign: "" });
    expect(isRowQrEligible(row, true)).toBe(false);
  });
});

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

// ── stableQrFilename (channel-aware) ─────────────────────────────────────────

describe("stableQrFilename", () => {
  it("includes campaign + source + medium when all present", () => {
    expect(stableQrFilename(1, "spring_sale", "newsletter", "email")).toBe(
      "01-spring-sale-newsletter-email.png"
    );
  });

  it("omits empty source/medium but keeps campaign", () => {
    expect(stableQrFilename(2, "summer", "", "")).toBe("02-summer.png");
  });

  it("falls back to just row number when campaign, source and medium are all empty", () => {
    expect(stableQrFilename(3, "", "", "")).toBe("03.png");
  });

  it("includes source/medium even when campaign is empty", () => {
    expect(stableQrFilename(4, "", "fb", "paid")).toBe("04-fb-paid.png");
  });

  it("pads row number to at least 2 digits", () => {
    expect(stableQrFilename(9, "", "", "")).toBe("09.png");
    expect(stableQrFilename(10, "c", "", "")).toBe("10-c.png");
    expect(stableQrFilename(100, "c", "", "")).toBe("100-c.png");
  });

  it("slugifies utm_campaign with spaces and special chars", () => {
    expect(stableQrFilename(2, "Black Friday 2024!", "google", "cpc")).toBe(
      "02-black-friday-2024-google-cpc.png"
    );
  });

  it("handles campaigns with only special chars → uses source/medium if available", () => {
    expect(stableQrFilename(1, "!!!!!", "fb", "")).toBe("01-fb.png");
  });

  it("backward compat: no source/medium args → matches old behavior", () => {
    // Old call signature: stableQrFilename(rowIndex, utm_campaign)
    expect(stableQrFilename(1, "spring_sale")).toBe("01-spring-sale.png");
    expect(stableQrFilename(3, "")).toBe("03.png");
  });
});

// ── contactSheetLabel ─────────────────────────────────────────────────────────

describe("contactSheetLabel", () => {
  it("renders row · campaign · source/medium when all present", () => {
    expect(contactSheetLabel(1, "spring_sale", "newsletter", "email", "https://example.com"))
      .toBe("01 · spring_sale · newsletter/email");
  });

  it("renders source/medium when campaign is empty", () => {
    expect(contactSheetLabel(2, "", "fb", "paid", "https://example.com"))
      .toBe("02 · fb/paid");
  });

  it("renders only source when medium is empty", () => {
    expect(contactSheetLabel(3, "sale", "fb", "", "https://example.com"))
      .toBe("03 · sale · fb");
  });

  it("falls back to URL when campaign, source, and medium are all empty", () => {
    expect(contactSheetLabel(4, "", "", "", "https://example.com/landing"))
      .toBe("04 · https://example.com/landing");
  });

  it("truncates long fallback URL at 40 chars", () => {
    const longUrl = "https://example.com/" + "x".repeat(50);
    const label = contactSheetLabel(5, "", "", "", longUrl);
    expect(label).toBe(`05 · ${longUrl.slice(0, 40)}`);
  });
});

// ── filterValidQrRows ─────────────────────────────────────────────────────────

describe("filterValidQrRows — no selection (targets all rows)", () => {
  it("returns all rows that are QR-eligible (valid URL + no blocking lint)", () => {
    const rows: UtmRow[] = [
      makeRow("r1"),
      makeRow("r2"),
      makeRow("r3", { baseUrl: "", utm_source: "", utm_medium: "", utm_campaign: "" }),
    ];
    const emap = eligibilityMap(rows);
    const { valid, skippedCount, targetedCount } = filterValidQrRows(rows, emap);
    expect(valid).toHaveLength(2);
    expect(skippedCount).toBe(1);
    expect(targetedCount).toBe(3);
  });

  it("skips a row with blocking lint (required-param missing) even if URL is non-empty", () => {
    // Row has a base URL and some params, but utm_source is missing (blocking lint).
    const rows: UtmRow[] = [
      makeRow("r1", { utm_source: "" }), // missing required utm_source
      makeRow("r2"),
    ];
    // r1 has blocking lint → eligibility=false
    const emap = eligibilityMap(rows, new Set(["r1"]));
    const { valid, skippedCount } = filterValidQrRows(rows, emap);
    expect(valid).toHaveLength(1);
    expect(valid[0].id).toBe("r2");
    expect(skippedCount).toBe(1);
  });

  it("allows a row with only STYLE lint (lowercase) — those are complete links", () => {
    const rows: UtmRow[] = [
      makeRow("r1", { utm_campaign: "Spring_Sale" }), // uppercase — style warning only
    ];
    // r1 has only a style warning → eligibility=true
    const emap = eligibilityMap(rows);
    const { valid, skippedCount } = filterValidQrRows(rows, emap);
    expect(valid).toHaveLength(1);
    expect(skippedCount).toBe(0);
  });

  it("returns empty valid + skippedCount = all when all rows have blocking lint", () => {
    const rows: UtmRow[] = [
      makeRow("r1", { utm_source: "" }),
    ];
    const emap = eligibilityMap(rows, new Set(["r1"]));
    const { valid, skippedCount } = filterValidQrRows(rows, emap);
    expect(valid).toHaveLength(0);
    expect(skippedCount).toBe(1);
  });

  it("returns all rows when all are eligible and have valid URLs", () => {
    const rows = [makeRow("r1"), makeRow("r2")];
    const emap = eligibilityMap(rows);
    const { valid, skippedCount } = filterValidQrRows(rows, emap);
    expect(valid).toHaveLength(2);
    expect(skippedCount).toBe(0);
  });

  it("works with no eligibility map (backward compat — all eligible by default)", () => {
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
    const emap = eligibilityMap(rows);
    // Select r1 and r3; r3 has no valid URL → skipped
    const { valid, skippedCount, targetedCount } = filterValidQrRows(
      rows,
      emap,
      new Set(["r1", "r3"])
    );
    expect(valid).toHaveLength(1);
    expect(valid[0].id).toBe("r1");
    expect(skippedCount).toBe(1);
    expect(targetedCount).toBe(2);
  });

  it("skips a selected row that has blocking lint", () => {
    const rows: UtmRow[] = [
      makeRow("r1", { utm_source: "" }),  // missing required → blocking
      makeRow("r2"),
    ];
    // Select both; r1 is blocked
    const emap = eligibilityMap(rows, new Set(["r1"]));
    const { valid, skippedCount } = filterValidQrRows(rows, emap, new Set(["r1", "r2"]));
    expect(valid).toHaveLength(1);
    expect(valid[0].id).toBe("r2");
    expect(skippedCount).toBe(1);
  });

  it("returns empty valid when selected rows all have empty URLs", () => {
    const rows: UtmRow[] = [
      makeRow("r1", { baseUrl: "", utm_source: "", utm_medium: "", utm_campaign: "" }),
      makeRow("r2"),
    ];
    const emap = eligibilityMap(rows);
    const { valid, skippedCount } = filterValidQrRows(rows, emap, new Set(["r1"]));
    expect(valid).toHaveLength(0);
    expect(skippedCount).toBe(1);
  });
});

// ── buildQrResultMessage ──────────────────────────────────────────────────────

describe("buildQrResultMessage", () => {
  it("returns all-skipped message when generatedCount is 0", () => {
    expect(buildQrResultMessage(0, 3)).toBe(
      "No QR codes — no rows have a complete, valid URL yet."
    );
  });

  it("includes 'incomplete or invalid URL' skipped clause when skippedCount > 0", () => {
    expect(buildQrResultMessage(2, 1)).toBe(
      "2 QR codes generated, 1 skipped — incomplete or invalid URL"
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

  it("skipped clause does not say 'row/rows' any more (dropped per spec)", () => {
    const msg = buildQrResultMessage(2, 1);
    expect(msg).not.toMatch(/\d+ row/);
  });

  it("uses plural 'codes' + skipped clause for multiple skipped", () => {
    expect(buildQrResultMessage(3, 2)).toBe(
      "3 QR codes generated, 2 skipped — incomplete or invalid URL"
    );
  });
});
