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
  it("counts only changed rows", () => {
    const rows = [
      { ...emptyRow("r1"), utm_source: "Facebook" },
      { ...emptyRow("r2"), utm_source: "facebook" },
    ];
    const result = normalizeAllRows(rows, DEFAULT_LINT_SETTINGS);
    expect(result.count).toBe(1);
    expect(result.rows[0].utm_source).toBe("facebook");
    expect(result.rows[1].utm_source).toBe("facebook");
  });

  it("returns same reference when nothing changed", () => {
    const rows = [{ ...emptyRow("r1"), utm_source: "facebook" }];
    const result = normalizeAllRows(rows, DEFAULT_LINT_SETTINGS);
    expect(result.rows).toBe(rows);
    expect(result.count).toBe(0);
  });
});
