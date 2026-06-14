import { describe, expect, it } from "vitest";
import { isCellFixable, normalizeAllRows, normalizeRow, normalizeValue } from "./normalize";
import { DEFAULT_LINT_SETTINGS, emptyRow } from "./types";

describe("normalizeValue", () => {
  it("lowercases uppercase letters", () => {
    expect(normalizeValue("Facebook", DEFAULT_LINT_SETTINGS)).toBe("facebook");
  });

  it("replaces spaces with underscores", () => {
    expect(normalizeValue("spring sale", DEFAULT_LINT_SETTINGS)).toBe("spring_sale");
  });

  it("replaces hyphens with underscores when noSpaces is on", () => {
    expect(normalizeValue("Spring-Sale", DEFAULT_LINT_SETTINGS)).toBe("spring_sale");
  });

  it("handles mixed separators (Spring-Sale → spring_sale)", () => {
    expect(normalizeValue("Spring-Sale", DEFAULT_LINT_SETTINGS)).toBe("spring_sale");
    expect(normalizeValue("SPRING - SALE", DEFAULT_LINT_SETTINGS)).toBe("spring_sale");
    expect(normalizeValue("spring__sale", { lowercaseOnly: false, noSpaces: true })).toBe("spring__sale");
  });

  it("does not modify already-clean values", () => {
    expect(normalizeValue("spring_sale", DEFAULT_LINT_SETTINGS)).toBe("spring_sale");
  });

  it("respects lowercaseOnly=false", () => {
    expect(normalizeValue("Spring Sale", { lowercaseOnly: false, noSpaces: true })).toBe("Spring_Sale");
  });

  it("respects noSpaces=false", () => {
    expect(normalizeValue("Spring Sale", { lowercaseOnly: true, noSpaces: false })).toBe("spring sale");
  });

  it("cross-row consistency: variants collapse to the same value after fixing", () => {
    const variants = ["Spring-Sale", "spring_sale", "spring sale", "SPRING_SALE"];
    const fixed = variants.map((v) => normalizeValue(v, DEFAULT_LINT_SETTINGS));
    const unique = new Set(fixed);
    expect(unique.size).toBe(1);
    expect([...unique][0]).toBe("spring_sale");
  });

  // P1-2 regression: trailing/leading whitespace must never become trailing/leading underscores.
  it("trims trailing space before converting spaces to underscores (Instagram  → instagram, not instagram_)", () => {
    expect(normalizeValue("Instagram ", DEFAULT_LINT_SETTINGS)).toBe("instagram");
  });

  it("trims leading space before converting spaces to underscores ( Instagram → instagram)", () => {
    expect(normalizeValue(" Instagram", DEFAULT_LINT_SETTINGS)).toBe("instagram");
  });

  it("trims both leading and trailing spaces, then normalizes internal spaces (Spring Sale  → spring_sale)", () => {
    expect(normalizeValue(" Spring Sale ", DEFAULT_LINT_SETTINGS)).toBe("spring_sale");
  });
});

describe("isCellFixable", () => {
  it("returns true for fixable values", () => {
    expect(isCellFixable("Facebook", DEFAULT_LINT_SETTINGS)).toBe(true);
    expect(isCellFixable("spring sale", DEFAULT_LINT_SETTINGS)).toBe(true);
    expect(isCellFixable("Spring-Sale", DEFAULT_LINT_SETTINGS)).toBe(true);
  });

  it("returns false for already-clean values", () => {
    expect(isCellFixable("spring_sale", DEFAULT_LINT_SETTINGS)).toBe(false);
    expect(isCellFixable("", DEFAULT_LINT_SETTINGS)).toBe(false);
  });
});

describe("normalizeRow", () => {
  it("fixes all fixable UTM fields in a row", () => {
    const r = { ...emptyRow("r1"), utm_source: "Facebook", utm_campaign: "Spring Sale", utm_medium: "paid_social" };
    const fixed = normalizeRow(r, DEFAULT_LINT_SETTINGS);
    expect(fixed.utm_source).toBe("facebook");
    expect(fixed.utm_campaign).toBe("spring_sale");
    expect(fixed.utm_medium).toBe("paid_social"); // unchanged
  });

  it("returns the same reference when nothing changed", () => {
    const r = { ...emptyRow("r1"), utm_source: "facebook", utm_campaign: "spring_sale" };
    expect(normalizeRow(r, DEFAULT_LINT_SETTINGS)).toBe(r);
  });
});

describe("normalizeAllRows", () => {
  it("counts CELLS changed (not rows)", () => {
    // Row 1: 1 cell to fix (utm_source). Row 2: nothing. Total = 1 cell.
    const rows = [
      { ...emptyRow("r1"), utm_source: "Facebook" },
      { ...emptyRow("r2"), utm_source: "facebook" },
    ];
    const result = normalizeAllRows(rows, DEFAULT_LINT_SETTINGS);
    expect(result.count).toBe(1); // 1 cell fixed
    expect(result.rows[0].utm_source).toBe("facebook");
    expect(result.rows[1].utm_source).toBe("facebook");
  });

  it("counts multiple cells changed across rows correctly", () => {
    // Row 1: 2 cells to fix (utm_source + utm_campaign). Row 2: 1 cell.
    const rows = [
      { ...emptyRow("r1"), utm_source: "Facebook", utm_campaign: "Spring Sale" },
      { ...emptyRow("r2"), utm_source: "Instagram " },
    ];
    const result = normalizeAllRows(rows, DEFAULT_LINT_SETTINGS);
    expect(result.count).toBe(3); // 3 cells total (2 in r1, 1 in r2)
    expect(result.rows[0].utm_source).toBe("facebook");
    expect(result.rows[0].utm_campaign).toBe("spring_sale");
    expect(result.rows[1].utm_source).toBe("instagram"); // trailing space trimmed, not trailing _
  });

  it("returns same reference when nothing changed", () => {
    const rows = [{ ...emptyRow("r1"), utm_source: "facebook" }];
    const result = normalizeAllRows(rows, DEFAULT_LINT_SETTINGS);
    expect(result.rows).toBe(rows);
    expect(result.count).toBe(0);
  });

  // FIX C (My Workspaces Round 2): uniform lowercase across ALL utm_* fields.
  // Wen's failure: utm_source "Google" left capitalized while medium/campaign were fixed.
  it("lowercases ALL utm_* fields uniformly including utm_source (GROUP C fix)", () => {
    const rows = [
      {
        ...emptyRow("r1"),
        utm_source: "Google",   // must become "google"
        utm_medium: "CPC",      // must become "cpc"
        utm_campaign: "Summer Sale", // must become "summer_sale"
        utm_term: "Brand",      // must become "brand"
        utm_content: "Hero Ad", // must become "hero_ad"
      },
    ];
    const result = normalizeAllRows(rows, DEFAULT_LINT_SETTINGS);
    expect(result.rows[0].utm_source).toBe("google");
    expect(result.rows[0].utm_medium).toBe("cpc");
    expect(result.rows[0].utm_campaign).toBe("summer_sale");
    expect(result.rows[0].utm_term).toBe("brand");
    expect(result.rows[0].utm_content).toBe("hero_ad");
    // All 5 fields changed
    expect(result.count).toBe(5);
  });
});
