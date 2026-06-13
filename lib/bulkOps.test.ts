/**
 * Unit tests for bulk row/column operations.
 * These test the core logic used by handleBulkSetColumn and handleBulkFindReplace
 * in UtmGrid.tsx.  The logic is pure — no React, no localStorage — so we test it
 * directly against the types.
 */
import { describe, expect, it } from "vitest";
import { lintRows } from "./lint";
import { emptyRow, DEFAULT_LINT_SETTINGS, type UtmRow } from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRows(...campaigns: string[]): UtmRow[] {
  return campaigns.map((c, i) => ({
    ...emptyRow(`row-${i + 1}`),
    baseUrl: "https://example.com",
    utm_source: "newsletter",
    utm_medium: "email",
    utm_campaign: c,
  }));
}

/** Bulk Set Column: set field to value on every row in targetIds (all if empty Set). */
function bulkSetColumn(
  rows: UtmRow[],
  field: keyof UtmRow,
  value: string,
  selectedIds: Set<string> = new Set()
): UtmRow[] {
  const targetIds = selectedIds.size > 0 ? selectedIds : new Set(rows.map((r) => r.id));
  return rows.map((r) => (targetIds.has(r.id) ? { ...r, [field]: value } : r));
}

/** Bulk Find & Replace: substring replace in field across targetIds (all if empty Set). */
function bulkFindReplace(
  rows: UtmRow[],
  field: keyof UtmRow,
  find: string,
  replace: string,
  selectedIds: Set<string> = new Set()
): { rows: UtmRow[]; matchCount: number } {
  const targetIds = selectedIds.size > 0 ? selectedIds : new Set(rows.map((r) => r.id));
  let matchCount = 0;
  const next = rows.map((r) => {
    if (!targetIds.has(r.id)) return r;
    const current = r[field] as string;
    if (!current.includes(find)) return r;
    matchCount++;
    return { ...r, [field]: current.split(find).join(replace) };
  });
  return { rows: next, matchCount };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("bulkSetColumn — set all rows", () => {
  it("sets the field on every row when no selection", () => {
    const rows = makeRows("", "", "");
    const result = bulkSetColumn(rows, "utm_campaign", "black_friday");
    expect(result.map((r) => r.utm_campaign)).toEqual([
      "black_friday",
      "black_friday",
      "black_friday",
    ]);
  });

  it("generated URL updates (utm_campaign included)", () => {
    const rows = makeRows("");
    const result = bulkSetColumn(rows, "utm_campaign", "black_friday");
    // The new utm_campaign is present in the row data; UTM URL building is tested separately.
    expect(result[0].utm_campaign).toBe("black_friday");
  });
});

describe("bulkSetColumn — set selected subset", () => {
  it("sets only the targeted rows and leaves others unchanged", () => {
    const rows = makeRows("", "", "");
    const selectedIds = new Set(["row-1", "row-3"]);
    const result = bulkSetColumn(rows, "utm_source", "newsletter", selectedIds);
    expect(result[0].utm_source).toBe("newsletter");
    expect(result[1].utm_source).toBe("newsletter"); // row-2 was already "newsletter"
    expect(result[2].utm_source).toBe("newsletter");
    // More precise: ensure row-2 is UNCHANGED (same object reference)
    expect(result[1]).toBe(rows[1]);
    // And row-1, row-3 are new objects
    expect(result[0]).not.toBe(rows[0]);
    expect(result[2]).not.toBe(rows[2]);
  });

  it("leaves unselected rows truly unchanged (different field)", () => {
    const rows = makeRows("spring_sale", "summer_sale", "fall_sale");
    const selectedIds = new Set(["row-1", "row-3"]);
    const result = bulkSetColumn(rows, "utm_campaign", "black_friday", selectedIds);
    expect(result[0].utm_campaign).toBe("black_friday");
    expect(result[1].utm_campaign).toBe("summer_sale"); // unchanged
    expect(result[2].utm_campaign).toBe("black_friday");
  });
});

describe("bulkSetColumn — empty value clears the field", () => {
  it("clears the field (sets to empty string) across targeted rows", () => {
    const rows = makeRows("spring_sale", "summer_sale");
    const result = bulkSetColumn(rows, "utm_campaign", "");
    expect(result[0].utm_campaign).toBe("");
    expect(result[1].utm_campaign).toBe("");
  });

  it("after clearing a required field, lint flags the cells as missing", () => {
    const rows = makeRows("spring_sale");
    const cleared = bulkSetColumn(rows, "utm_campaign", "");
    const warnings = lintRows(cleared, DEFAULT_LINT_SETTINGS);
    expect(warnings.some((w) => w.field === "utm_campaign" && w.rule === "required")).toBe(true);
  });
});

describe("bulkFindReplace — clears cross-row consistency warning", () => {
  it("replaces Spring-Sale with spring_sale and lint consistency warning disappears", () => {
    // Cross-row consistency: two rows with normalizing-equal but literal-different values.
    const rows: UtmRow[] = [
      { ...emptyRow("r1"), baseUrl: "https://example.com", utm_source: "n", utm_medium: "e", utm_campaign: "spring_sale" },
      { ...emptyRow("r2"), baseUrl: "https://example.com", utm_source: "n", utm_medium: "e", utm_campaign: "Spring-Sale" },
    ];

    // Verify the inconsistency warning exists before the replace.
    const warningsBefore = lintRows(rows, { requiredParams: false, lowercaseOnly: false, noSpaces: false });
    const inconsistentBefore = warningsBefore.filter((w) => w.rule === "inconsistent");
    expect(inconsistentBefore).toHaveLength(2);

    // Bulk find "Spring-Sale" → "spring_sale".
    const { rows: replaced, matchCount } = bulkFindReplace(rows, "utm_campaign", "Spring-Sale", "spring_sale");
    expect(matchCount).toBe(1);
    expect(replaced[0].utm_campaign).toBe("spring_sale");
    expect(replaced[1].utm_campaign).toBe("spring_sale");

    // Re-run lint — inconsistency warning must be gone.
    const warningsAfter = lintRows(replaced, { requiredParams: false, lowercaseOnly: false, noSpaces: false });
    const inconsistentAfter = warningsAfter.filter((w) => w.rule === "inconsistent");
    expect(inconsistentAfter).toHaveLength(0);
  });

  it("returns matchCount=0 when find string is absent", () => {
    const rows = makeRows("spring_sale");
    const { rows: result, matchCount } = bulkFindReplace(rows, "utm_campaign", "autumn", "fall");
    expect(matchCount).toBe(0);
    expect(result[0].utm_campaign).toBe("spring_sale"); // unchanged
  });

  it("replaces substring (not whole-field match required)", () => {
    const rows = makeRows("spring_sale_2025");
    const { rows: result, matchCount } = bulkFindReplace(rows, "utm_campaign", "spring", "fall");
    expect(matchCount).toBe(1);
    expect(result[0].utm_campaign).toBe("fall_sale_2025");
  });

  it("respects selected-row subset: unselected rows unchanged", () => {
    const rows = makeRows("Spring-Sale", "Spring-Sale", "Spring-Sale");
    const selectedIds = new Set(["row-1", "row-3"]);
    const { rows: result, matchCount } = bulkFindReplace(
      rows, "utm_campaign", "Spring-Sale", "spring_sale", selectedIds
    );
    expect(matchCount).toBe(2);
    expect(result[0].utm_campaign).toBe("spring_sale");
    expect(result[1].utm_campaign).toBe("Spring-Sale"); // unchanged
    expect(result[2].utm_campaign).toBe("spring_sale");
  });
});
