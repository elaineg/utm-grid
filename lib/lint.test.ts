import { describe, expect, it } from "vitest";
import { groupWarnings, lintRows, normalizeUtmValue, warningKey } from "./lint";
import { DEFAULT_LINT_SETTINGS, emptyRow, type UtmRow } from "./types";

function row(id: string, overrides: Partial<UtmRow>): UtmRow {
  return { ...emptyRow(id), ...overrides };
}

const full = (id: string, overrides: Partial<UtmRow> = {}): UtmRow =>
  row(id, {
    baseUrl: "https://example.com",
    utm_source: "newsletter",
    utm_medium: "email",
    utm_campaign: "spring_sale",
    ...overrides,
  });

describe("normalizeUtmValue", () => {
  it("equates case and -/_/space separator variants", () => {
    expect(normalizeUtmValue("Spring-Sale")).toBe(normalizeUtmValue("spring_sale"));
    expect(normalizeUtmValue("spring sale")).toBe(normalizeUtmValue("spring_sale"));
    expect(normalizeUtmValue("SPRING  -  SALE")).toBe("spring_sale");
    expect(normalizeUtmValue("springsale")).not.toBe(normalizeUtmValue("spring_sale"));
  });
});

describe("lintRows: required params", () => {
  it("flags missing required params on a row with content", () => {
    const warnings = lintRows([full("r1", { utm_medium: "" })], DEFAULT_LINT_SETTINGS);
    expect(warnings).toContainEqual(
      expect.objectContaining({ rowId: "r1", field: "utm_medium", rule: "required" })
    );
    // Filled fields are not flagged.
    expect(warnings.filter((w) => w.rule === "required")).toHaveLength(1);
  });

  it("does not flag completely empty rows", () => {
    expect(lintRows([emptyRow("r1")], DEFAULT_LINT_SETTINGS)).toEqual([]);
  });

  it("is toggleable", () => {
    const warnings = lintRows(
      [full("r1", { utm_medium: "" })],
      { ...DEFAULT_LINT_SETTINGS, requiredParams: false }
    );
    expect(warnings).toEqual([]);
  });
});

describe("lintRows: case and space rules", () => {
  it("flags uppercase and spaces (spec example 'Spring Sale')", () => {
    const warnings = lintRows([full("r1", { utm_campaign: "Spring Sale" })], DEFAULT_LINT_SETTINGS);
    const rules = warnings
      .filter((w) => w.field === "utm_campaign")
      .map((w) => w.rule)
      .sort();
    expect(rules).toEqual(["lowercase", "no-spaces"]);
  });

  it("each rule is independently toggleable", () => {
    const value = full("r1", { utm_campaign: "Spring Sale" });
    const noCase = lintRows([value], { ...DEFAULT_LINT_SETTINGS, lowercaseOnly: false });
    expect(noCase.map((w) => w.rule)).toEqual(["no-spaces"]);
    const noSpace = lintRows([value], { ...DEFAULT_LINT_SETTINGS, noSpaces: false });
    expect(noSpace.map((w) => w.rule)).toEqual(["lowercase"]);
  });
});

describe("lintRows: invalid base URL", () => {
  it("flags non-URL base values but not empty ones", () => {
    const warnings = lintRows([full("r1", { baseUrl: "example.com" })], DEFAULT_LINT_SETTINGS);
    expect(warnings).toContainEqual(
      expect.objectContaining({ field: "baseUrl", rule: "invalid-url" })
    );
  });
});

describe("lintRows: utm params already in the base URL", () => {
  it("warns on the base URL cell, naming the param, when the row sets that field", () => {
    const warnings = lintRows(
      [full("r1", { baseUrl: "https://example.com/p?utm_source=old" })],
      DEFAULT_LINT_SETTINGS
    );
    const baseUtm = warnings.filter((w) => w.rule === "base-utm");
    expect(baseUtm).toHaveLength(1);
    expect(baseUtm[0].field).toBe("baseUrl");
    expect(baseUtm[0].message).toContain("utm_source");
    expect(baseUtm[0].message).toContain("replaced");
  });

  it("warns with a move-it message when the row leaves that column empty", () => {
    const warnings = lintRows(
      [full("r1", { baseUrl: "https://example.com/p?utm_term=shoes" })],
      DEFAULT_LINT_SETTINGS
    );
    const baseUtm = warnings.filter((w) => w.rule === "base-utm");
    expect(baseUtm).toHaveLength(1);
    expect(baseUtm[0].message).toContain("utm_term");
    expect(baseUtm[0].message).toContain("move it");
  });

  it("does not warn for non-utm query params", () => {
    const warnings = lintRows(
      [full("r1", { baseUrl: "https://example.com/p?ref=1" })],
      DEFAULT_LINT_SETTINGS
    );
    expect(warnings.filter((w) => w.rule === "base-utm")).toEqual([]);
  });
});

describe("lintRows: cross-row consistency", () => {
  it("flags every affected cell and names the variants", () => {
    const warnings = lintRows(
      [full("r1"), full("r2", { utm_campaign: "Spring-Sale" })],
      // Disable other rules to isolate cross-row warnings.
      { requiredParams: false, lowercaseOnly: false, noSpaces: false }
    );
    const inconsistent = warnings.filter((w) => w.rule === "inconsistent");
    expect(inconsistent).toHaveLength(2);
    expect(inconsistent.map((w) => w.rowId).sort()).toEqual(["r1", "r2"]);
    for (const w of inconsistent) {
      expect(w.field).toBe("utm_campaign");
      expect(w.message).toContain('"spring_sale"');
      expect(w.message).toContain('"Spring-Sale"');
    }
  });

  it("clears when values are made identical", () => {
    const warnings = lintRows([full("r1"), full("r2")], DEFAULT_LINT_SETTINGS);
    expect(warnings.filter((w) => w.rule === "inconsistent")).toEqual([]);
  });

  it("does not flag values that normalize differently", () => {
    const warnings = lintRows(
      [full("r1"), full("r2", { utm_campaign: "summer_sale" })],
      DEFAULT_LINT_SETTINGS
    );
    expect(warnings.filter((w) => w.rule === "inconsistent")).toEqual([]);
  });

  it("compares per column only", () => {
    const warnings = lintRows(
      [full("r1", { utm_term: "spring_sale" })],
      DEFAULT_LINT_SETTINGS
    );
    expect(warnings.filter((w) => w.rule === "inconsistent")).toEqual([]);
  });

  it("flags three-way variants on all cells", () => {
    const warnings = lintRows(
      [
        full("r1"),
        full("r2", { utm_campaign: "Spring-Sale" }),
        full("r3", { utm_campaign: "spring sale" }),
      ],
      { requiredParams: false, lowercaseOnly: false, noSpaces: false }
    );
    const inconsistent = warnings.filter((w) => w.rule === "inconsistent");
    expect(inconsistent).toHaveLength(3);
    expect(inconsistent[0].message).toContain('"spring_sale" vs "Spring-Sale" vs "spring sale"');
  });
});

describe("groupWarnings", () => {
  it("indexes warnings per cell", () => {
    const warnings = lintRows([full("r1", { utm_campaign: "Spring Sale" })], DEFAULT_LINT_SETTINGS);
    const grouped = groupWarnings(warnings);
    expect(grouped.get(warningKey("r1", "utm_campaign"))).toHaveLength(2);
    expect(grouped.get(warningKey("r1", "utm_source"))).toBeUndefined();
  });
});
