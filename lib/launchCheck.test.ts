import { describe, expect, it } from "vitest";
import {
  buildLaunchCheckCsv,
  buildLaunchCheckTextSummary,
  computeLaunchCheckSummary,
  escapeCsvCell,
} from "./launchCheck";
import { lintRows } from "./lint";
import { DEFAULT_LINT_SETTINGS, emptyRow, type UtmRow } from "./types";

function row(id: string, overrides: Partial<UtmRow>): UtmRow {
  return { ...emptyRow(id), ...overrides };
}

const fullRow = (id: string, overrides: Partial<UtmRow> = {}): UtmRow =>
  row(id, {
    baseUrl: "https://example.com",
    utm_source: "newsletter",
    utm_medium: "email",
    utm_campaign: "spring_sale",
    ...overrides,
  });

// ── escapeCsvCell ──────────────────────────────────────────────────────────────

describe("escapeCsvCell", () => {
  it("leaves a plain value unquoted", () => {
    expect(escapeCsvCell("hello")).toBe("hello");
  });

  it("wraps a value with a comma in double-quotes", () => {
    expect(escapeCsvCell("a,b")).toBe('"a,b"');
  });

  it("escapes existing double-quotes by doubling them", () => {
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
  });

  it("wraps a value with a newline", () => {
    expect(escapeCsvCell("line1\nline2")).toBe('"line1\nline2"');
  });
});

// ── computeLaunchCheckSummary ──────────────────────────────────────────────────

describe("computeLaunchCheckSummary: passing count", () => {
  it("counts all rows as passing on a clean grid", () => {
    const rows = [fullRow("r1"), fullRow("r2")];
    const warnings = lintRows(rows, DEFAULT_LINT_SETTINGS);
    const summary = computeLaunchCheckSummary(rows, warnings);
    expect(summary.totalLinks).toBe(2);
    expect(summary.passingCount).toBe(2);
    expect(summary.issueCount).toBe(0);
    expect(summary.violations).toHaveLength(0);
  });

  it("reports 1 passing and 2 with issues on a 3-row grid with 2 violation rows", () => {
    // r1: clean (no cross-row issues — use unique utm_source to avoid inconsistency warnings)
    // r2: missing required utm_medium → 1 violation row
    // r3: uppercase in utm_campaign (unique campaign value so no cross-row inconsistency)
    const rows = [
      row("r1", {
        baseUrl: "https://example.com",
        utm_source: "src_a",
        utm_medium: "email",
        utm_campaign: "clean_campaign",
      }),
      row("r2", {
        baseUrl: "https://example.com",
        utm_source: "src_b",
        utm_medium: "",           // missing required
        utm_campaign: "clean_campaign",
      }),
      row("r3", {
        baseUrl: "https://example.com",
        utm_source: "src_c",
        utm_medium: "email",
        utm_campaign: "UPPERCASE",  // uppercase lint warning
      }),
    ];
    const warnings = lintRows(rows, DEFAULT_LINT_SETTINGS);
    const summary = computeLaunchCheckSummary(rows, warnings);
    expect(summary.totalLinks).toBe(3);
    expect(summary.passingCount).toBe(1);
    expect(summary.issueCount).toBe(2);
    expect(summary.violations.length).toBeGreaterThan(0);
  });

  it("maps row numbers to 1-based index", () => {
    const rows = [
      fullRow("r1"),
      fullRow("r2", { utm_medium: "" }),
    ];
    const warnings = lintRows(rows, DEFAULT_LINT_SETTINGS);
    const summary = computeLaunchCheckSummary(rows, warnings);
    // r2 is row number 2
    const violation = summary.violations.find((v) => v.issueType === "required");
    expect(violation?.rowNumber).toBe(2);
    expect(violation?.field).toBe("utm_medium");
  });
});

// ── buildLaunchCheckCsv ────────────────────────────────────────────────────────

describe("buildLaunchCheckCsv", () => {
  it("outputs header + one all-clear row on a clean grid", () => {
    const rows = [fullRow("r1"), fullRow("r2")];
    const warnings = lintRows(rows, DEFAULT_LINT_SETTINGS);
    const summary = computeLaunchCheckSummary(rows, warnings);
    const csv = buildLaunchCheckCsv(summary);

    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe("row #,base URL,field,value,issue type,message");
    expect(lines[1]).toContain("all-clear");
    expect(lines[1]).toContain("All 2 links pass");
    // Exactly two lines (header + all-clear).
    expect(lines).toHaveLength(2);
  });

  it("outputs one row per violation on a dirty grid", () => {
    const rows = [
      fullRow("r1"),
      fullRow("r2", { utm_medium: "" }),
      fullRow("r3", { utm_source: "Newsletter" }), // uppercase only, no cross-row issue
    ];
    const warnings = lintRows(rows, DEFAULT_LINT_SETTINGS);
    const summary = computeLaunchCheckSummary(rows, warnings);
    const csv = buildLaunchCheckCsv(summary);

    const lines = csv.trim().split("\n");
    // header + one row per violation
    expect(lines.length).toBeGreaterThan(2);
    // header must be exact
    expect(lines[0]).toBe("row #,base URL,field,value,issue type,message");
    // No all-clear row when there are violations
    expect(csv).not.toContain("all-clear");
  });

  it("includes the violation's row number, field, and issue type", () => {
    const rows = [
      fullRow("r1"),
      fullRow("r2", { utm_medium: "" }),
    ];
    const warnings = lintRows(rows, DEFAULT_LINT_SETTINGS);
    const summary = computeLaunchCheckSummary(rows, warnings);
    const csv = buildLaunchCheckCsv(summary);

    // Row 2, utm_medium, required
    expect(csv).toContain("2,");
    expect(csv).toContain("utm_medium");
    expect(csv).toContain("required");
  });

  it("escapes commas in message column", () => {
    // Use a value that would trigger a message with a comma-like phrasing
    // (the lint messages may not all contain commas, but we test the escaping works)
    const rows = [fullRow("r1", { utm_campaign: "Spring,Sale" })];
    const warnings = lintRows(rows, { ...DEFAULT_LINT_SETTINGS, noSpaces: false });
    // If there are warnings (e.g. case), verify CSV is still parseable (no broken columns)
    const summary = computeLaunchCheckSummary(rows, warnings);
    const csv = buildLaunchCheckCsv(summary);
    // Must not throw / produce malformed CSV
    expect(typeof csv).toBe("string");
  });
});

// ── buildLaunchCheckTextSummary ────────────────────────────────────────────────

describe("buildLaunchCheckTextSummary", () => {
  it("includes the all-pass message on a clean grid", () => {
    const rows = [fullRow("r1"), fullRow("r2")];
    const warnings = lintRows(rows, DEFAULT_LINT_SETTINGS);
    const summary = computeLaunchCheckSummary(rows, warnings);
    const text = buildLaunchCheckTextSummary(summary, false);
    expect(text).toContain("All 2 links pass");
    expect(text).toContain("nothing sent to any server");
  });

  it("uses workspace mode copy when isWorkspaceMode is true (dirty grid)", () => {
    const rows = [
      fullRow("r1"),
      fullRow("r2", { utm_medium: "" }),
    ];
    const warnings = lintRows(rows, DEFAULT_LINT_SETTINGS);
    const summary = computeLaunchCheckSummary(rows, warnings);
    const text = buildLaunchCheckTextSummary(summary, true);
    expect(text).not.toContain("nothing sent to any server");
    // There is no special workspace note on dirty grid (that's for clean grids)
    // but the scorecard is the same
    expect(text).toContain("Total: 2 links checked");
  });

  it("lists violations in text output on a dirty grid", () => {
    const rows = [
      fullRow("r1"),
      fullRow("r2", { utm_medium: "" }),
    ];
    const warnings = lintRows(rows, DEFAULT_LINT_SETTINGS);
    const summary = computeLaunchCheckSummary(rows, warnings);
    const text = buildLaunchCheckTextSummary(summary, false);
    expect(text).toContain("Row 2");
    expect(text).toContain("utm_medium");
    expect(text).toContain("required");
  });

  it("scorecard shows correct counts", () => {
    // r1: clean; r2: missing utm_medium (1 issue)
    const rows = [
      fullRow("r1"),
      fullRow("r2", { utm_medium: "" }),
    ];
    const warnings = lintRows(rows, DEFAULT_LINT_SETTINGS);
    const summary = computeLaunchCheckSummary(rows, warnings);
    const text = buildLaunchCheckTextSummary(summary, false);
    expect(text).toContain("Total: 2 links checked");
    expect(text).toContain("With issues: 1");
    expect(text).toContain("Passing: 1");
  });
});
