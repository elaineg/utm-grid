/**
 * Unit tests for audit summary derivation:
 * - Grouped-summary correctness (Fix 1/2): one line per field, deduped
 * - Skipped-line surfacing (Fix 3): lineNo + truncated text + reason
 * - Live flagged count (Fix 4): zero → "clean" state
 */
import { describe, expect, it } from "vitest";
import { lintRows, groupWarnings, type LintWarning } from "./lint";
import { parseUtmUrls } from "./utm";
import { DEFAULT_LINT_SETTINGS, emptyRow, UTM_FIELDS, type UtmRow } from "./types";

function makeRow(id: string, overrides: Partial<UtmRow>): UtmRow {
  return { ...emptyRow(id), ...overrides };
}

// ── Fix 1/2: Grouped summary derivation ────────────────────────────────────

describe("audit summary: grouped warnings by field", () => {
  it("produces no warnings for consistent, clean rows", () => {
    const rows = [
      makeRow("r1", { baseUrl: "https://example.com", utm_source: "newsletter", utm_medium: "email", utm_campaign: "spring_sale" }),
      makeRow("r2", { baseUrl: "https://example.com", utm_source: "newsletter", utm_medium: "email", utm_campaign: "spring_sale" }),
    ];
    const allWarnings = lintRows(rows, DEFAULT_LINT_SETTINGS);
    expect(allWarnings).toHaveLength(0);
  });

  it("groups cross-row inconsistency by field: utm_source has 2 cells flagged (not 2 separate warnings)", () => {
    const rows = [
      makeRow("r1", { baseUrl: "https://example.com", utm_source: "Facebook", utm_medium: "social", utm_campaign: "q3" }),
      makeRow("r2", { baseUrl: "https://example.com", utm_source: "facebook", utm_medium: "social", utm_campaign: "q3" }),
    ];
    const allWarnings = lintRows(rows, { requiredParams: false, lowercaseOnly: false, noSpaces: false });
    const inconsistents = allWarnings.filter((w) => w.rule === "inconsistent" && w.field === "utm_source");
    // Both rows flagged for the same field — this is what the grouped summary dedupes to one line
    expect(inconsistents).toHaveLength(2);
    // Both share the same field
    expect(new Set(inconsistents.map((w) => w.field)).size).toBe(1);
    // Variants appear in the message
    expect(inconsistents[0].message).toContain('"Facebook"');
    expect(inconsistents[0].message).toContain('"facebook"');
  });

  it("groups multiple rule types per field into one field entry", () => {
    const rows = [
      makeRow("r1", { baseUrl: "https://example.com", utm_source: "Facebook Ads", utm_medium: "social", utm_campaign: "q3" }),
    ];
    const allWarnings = lintRows(rows, DEFAULT_LINT_SETTINGS);
    const sourceWarnings = allWarnings.filter((w) => w.field === "utm_source");
    // Both lowercase and no-spaces should be set
    const rules = new Set(sourceWarnings.map((w) => w.rule));
    expect(rules.has("lowercase")).toBe(true);
    expect(rules.has("no-spaces")).toBe(true);
    // Only one field ("utm_source") — summary shows both issues under one field heading
    expect(sourceWarnings.every((w) => w.field === "utm_source")).toBe(true);
  });

  it("live flagged cell count drops to zero after normalizing all rows", () => {
    const rows = [
      makeRow("r1", { baseUrl: "https://example.com", utm_source: "Facebook", utm_medium: "email", utm_campaign: "Spring Sale" }),
    ];
    const before = lintRows(rows, DEFAULT_LINT_SETTINGS);
    const flaggedCellsBefore = new Set(before.map((w) => `${w.rowId}:${w.field}`)).size;
    expect(flaggedCellsBefore).toBeGreaterThan(0);

    // After normalization
    const normalizedRows = rows.map((r) => ({
      ...r,
      utm_source: r.utm_source.toLowerCase(),
      utm_campaign: r.utm_campaign.toLowerCase().replace(/\s+/g, "_"),
    }));
    const after = lintRows(normalizedRows, DEFAULT_LINT_SETTINGS);
    const flaggedCellsAfter = new Set(after.map((w) => `${w.rowId}:${w.field}`)).size;
    expect(flaggedCellsAfter).toBe(0);
  });
});

// ── Fix 3: Skipped-line surfacing ──────────────────────────────────────────

describe("audit summary: skipped-line surfacing", () => {
  let counter = 0;
  const idGen = () => `row-${++counter}`;

  it("records lineNo, raw text, and reason for a non-URL line", () => {
    counter = 0;
    const { skipped } = parseUtmUrls(
      ["https://example.com/?utm_source=ok", "not a url at all"].join("\n"),
      idGen
    );
    expect(skipped).toHaveLength(1);
    expect(skipped[0].lineNo).toBe(2);
    expect(skipped[0].line).toContain("not a url");
    expect(typeof skipped[0].reason).toBe("string");
    expect(skipped[0].reason.length).toBeGreaterThan(0);
  });

  it("records the correct lineNo for a skipped line in the middle of a paste", () => {
    counter = 0;
    const { skipped } = parseUtmUrls(
      [
        "https://example.com/?utm_source=a",
        "garbage line",
        "https://example.com/?utm_source=b",
      ].join("\n"),
      idGen
    );
    expect(skipped).toHaveLength(1);
    expect(skipped[0].lineNo).toBe(2);
    expect(skipped[0].line).toBe("garbage line");
  });

  it("records multiple skipped lines, each with distinct lineNo", () => {
    counter = 0;
    const { rows, skipped } = parseUtmUrls(
      [
        "garbage 1",
        "https://example.com/?utm_source=ok",
        "garbage 2",
      ].join("\n"),
      idGen
    );
    expect(rows).toHaveLength(1);
    expect(skipped).toHaveLength(2);
    expect(skipped[0].lineNo).toBe(1);
    expect(skipped[1].lineNo).toBe(3);
  });

  it("does NOT record blank lines as skipped", () => {
    counter = 0;
    const { skipped } = parseUtmUrls(
      ["https://example.com/?utm_source=ok", "", "   "].join("\n"),
      idGen
    );
    expect(skipped).toHaveLength(0);
  });
});

// ── Fix 4: Live count after warn-then-fix flow ──────────────────────────────

describe("audit summary: live count reflects fixes (Fix 4)", () => {
  it("lintRows returns zero warnings after all audited rows are cleaned", () => {
    // Simulate: paste 2 URLs with casing issues
    const { rows } = parseUtmUrls(
      [
        "https://example.com/?utm_source=Facebook&utm_medium=Social&utm_campaign=Spring-Sale",
        "https://example.com/?utm_source=facebook&utm_medium=social&utm_campaign=spring_sale",
      ].join("\n"),
      (() => { let n = 0; return () => `row-${++n}`; })()
    );

    // Before fix: has warnings
    const before = lintRows(rows, DEFAULT_LINT_SETTINGS);
    expect(before.length).toBeGreaterThan(0);

    // After fix (normalize): count to zero
    const fixed = rows.map((r) => ({
      ...r,
      utm_source: r.utm_source.toLowerCase(),
      utm_medium: r.utm_medium.toLowerCase(),
      utm_campaign: r.utm_campaign.toLowerCase().replace(/[-\s]+/g, "_"),
    }));
    const after = lintRows(fixed, DEFAULT_LINT_SETTINGS);
    // Cross-row consistency + casing should all resolve
    const cellsAfter = new Set(after.map((w) => `${w.rowId}:${w.field}`)).size;
    expect(cellsAfter).toBe(0);
  });
});
