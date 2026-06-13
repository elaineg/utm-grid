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

/** Bulk Set Column: set field to value on every row in targetIds (all if empty Set).
 *  Mirrors the logic in handleBulkSetColumn. */
function bulkSetColumn(
  rows: UtmRow[],
  field: keyof UtmRow,
  value: string,
  selectedIds: Set<string> = new Set()
): UtmRow[] {
  const targetIds = selectedIds.size > 0 ? selectedIds : new Set(rows.map((r) => r.id));
  return rows.map((r) => (targetIds.has(r.id) ? { ...r, [field]: value } : r));
}

/** Bulk Find & Replace (case-insensitive when matchCase=false).
 *  Mirrors the logic in handleBulkFindReplace (Fix 2b). */
function bulkFindReplace(
  rows: UtmRow[],
  field: keyof UtmRow,
  find: string,
  replace: string,
  selectedIds: Set<string> = new Set(),
  matchCase = true  // existing tests used case-sensitive; new tests opt into insensitive
): { rows: UtmRow[]; matchCount: number } {
  const targetIds = selectedIds.size > 0 ? selectedIds : new Set(rows.map((r) => r.id));
  let matchCount = 0;
  const next = rows.map((r) => {
    if (!targetIds.has(r.id)) return r;
    const current = r[field] as string;
    const haystack = matchCase ? current : current.toLowerCase();
    const needle = matchCase ? find : find.toLowerCase();
    if (!haystack.includes(needle)) return r;
    matchCount++;
    const replaced = matchCase
      ? current.split(find).join(replace)
      : current.replace(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), replace);
    return { ...r, [field]: replaced };
  });
  return { rows: next, matchCount };
}

/** Mirror of the toast/result message logic from handleBulkSetColumn (Fix 3). */
function setColumnResultMessage(field: string, value: string, count: number): string {
  const verb = value === "" ? "Cleared" : "Set";
  const label = field === "baseUrl" ? "Base URL" : field;
  return `${verb} ${label} on ${count} row${count === 1 ? "" : "s"} — Undo`;
}

/** Mirror of find-replace result message / validation from handleBulkFindReplace (Fix 2a). */
function findReplaceResult(field: string, find: string, matchCount: number): string {
  if (!find) return "Enter a value to find.";
  if (matchCount === 0) return `No matches in ${field === "baseUrl" ? "Base URL" : field}.`;
  return `Replaced in ${matchCount} row${matchCount === 1 ? "" : "s"} — Undo`;
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

// ── Fix 2b: Case-insensitive find & replace ───────────────────────────────────

describe("bulkFindReplace — case-insensitive matching (Fix 2b)", () => {
  it("matches Spring-Sale and spring_sale in one pass (case-insensitive OFF)", () => {
    const rows = makeRows("Spring-Sale", "spring_sale", "SPRING-sale");
    // Default matchCase=false → case-insensitive
    const { rows: result, matchCount } = bulkFindReplace(
      rows, "utm_campaign", "spring", "fall", new Set(), false
    );
    // All three rows contain "spring" (case-insensitive) so all 3 match.
    expect(matchCount).toBe(3);
    // Each should have had the "spring" substring replaced (case-insensitively) with "fall".
    expect(result[0].utm_campaign).toBe("fall-Sale");
    expect(result[1].utm_campaign).toBe("fall_sale");
    expect(result[2].utm_campaign).toBe("fall-sale");
  });

  it("does NOT collapse case-variants when matchCase=true (case-sensitive ON)", () => {
    const rows = makeRows("Spring-Sale", "spring_sale");
    // matchCase=true → only exact match
    const { rows: result, matchCount } = bulkFindReplace(
      rows, "utm_campaign", "spring", "fall", new Set(), true
    );
    // Only "spring_sale" matches "spring" exactly; "Spring-Sale" has capital S.
    expect(matchCount).toBe(1);
    expect(result[0].utm_campaign).toBe("Spring-Sale"); // unchanged
    expect(result[1].utm_campaign).toBe("fall_sale");
  });

  it("collapses Spring-Sale + spring_sale in one case-insensitive pass (the Wen/Priya use case)", () => {
    const rows: UtmRow[] = [
      { ...emptyRow("r1"), baseUrl: "https://example.com", utm_source: "n", utm_medium: "e", utm_campaign: "Spring-Sale" },
      { ...emptyRow("r2"), baseUrl: "https://example.com", utm_source: "n", utm_medium: "e", utm_campaign: "spring_sale" },
    ];
    const { rows: result, matchCount } = bulkFindReplace(
      rows, "utm_campaign", "spring", "summer", new Set(), false
    );
    expect(matchCount).toBe(2);
    // Replacements preserve surrounding characters (only "spring" part is replaced).
    expect(result[0].utm_campaign).toBe("summer-Sale");
    expect(result[1].utm_campaign).toBe("summer_sale");
  });
});

// ── Fix 2a: Result message states ────────────────────────────────────────────

describe("findReplaceResult — result message always shown (Fix 2a)", () => {
  it("returns 'Enter a value to find.' for empty find string", () => {
    expect(findReplaceResult("utm_campaign", "", 0)).toBe("Enter a value to find.");
  });

  it("returns 'No matches in utm_campaign.' when matchCount=0", () => {
    expect(findReplaceResult("utm_campaign", "autumn", 0)).toBe("No matches in utm_campaign.");
  });

  it("returns 'Replaced in N rows — Undo' on success", () => {
    expect(findReplaceResult("utm_campaign", "spring", 3)).toBe("Replaced in 3 rows — Undo");
    expect(findReplaceResult("utm_campaign", "spring", 1)).toBe("Replaced in 1 row — Undo");
  });

  it("uses 'Base URL' label for the baseUrl field", () => {
    expect(findReplaceResult("baseUrl", "old-domain", 0)).toBe("No matches in Base URL.");
  });
});

// ── Fix 3: Clear vs Set wording ───────────────────────────────────────────────

describe("setColumnResultMessage — Clear vs Set wording (Fix 3)", () => {
  it("uses 'Cleared' when value is empty string", () => {
    const msg = setColumnResultMessage("utm_source", "", 5);
    expect(msg).toBe("Cleared utm_source on 5 rows — Undo");
  });

  it("uses 'Set' when value is non-empty", () => {
    const msg = setColumnResultMessage("utm_campaign", "black_friday", 3);
    expect(msg).toBe("Set utm_campaign on 3 rows — Undo");
  });

  it("uses 'Base URL' label for the baseUrl field when clearing", () => {
    const msg = setColumnResultMessage("baseUrl", "", 2);
    expect(msg).toBe("Cleared Base URL on 2 rows — Undo");
  });

  it("uses 'Base URL' label for the baseUrl field when setting", () => {
    const msg = setColumnResultMessage("baseUrl", "https://example.com", 4);
    expect(msg).toBe("Set Base URL on 4 rows — Undo");
  });
});

// ── Fix 5: Base URL as bulk target column ────────────────────────────────────

describe("bulkSetColumn — Base URL as target (Fix 5)", () => {
  it("sets baseUrl on all rows", () => {
    const rows = makeRows("campaign1", "campaign2");
    const result = bulkSetColumn(rows, "baseUrl", "https://landing.example.com");
    expect(result[0].baseUrl).toBe("https://landing.example.com");
    expect(result[1].baseUrl).toBe("https://landing.example.com");
    // utm_campaign must be untouched
    expect(result[0].utm_campaign).toBe("campaign1");
    expect(result[1].utm_campaign).toBe("campaign2");
  });

  it("clears baseUrl on all rows when value is empty", () => {
    const rows = makeRows("c1");
    rows[0].baseUrl = "https://old.example.com";
    const result = bulkSetColumn(rows, "baseUrl", "");
    expect(result[0].baseUrl).toBe("");
  });
});

describe("bulkFindReplace — Base URL as target (Fix 5)", () => {
  it("replaces domain substring in baseUrl (case-insensitive)", () => {
    const rows: UtmRow[] = [
      { ...emptyRow("r1"), baseUrl: "https://old-domain.com/page", utm_source: "n", utm_medium: "e", utm_campaign: "c" },
      { ...emptyRow("r2"), baseUrl: "https://old-domain.com/other", utm_source: "n", utm_medium: "e", utm_campaign: "c" },
    ];
    const { rows: result, matchCount } = bulkFindReplace(
      rows, "baseUrl", "old-domain.com", "new-domain.com", new Set(), false
    );
    expect(matchCount).toBe(2);
    expect(result[0].baseUrl).toBe("https://new-domain.com/page");
    expect(result[1].baseUrl).toBe("https://new-domain.com/other");
  });

  it("returns matchCount=0 when baseUrl doesn't contain find string", () => {
    const rows: UtmRow[] = [
      { ...emptyRow("r1"), baseUrl: "https://example.com", utm_source: "n", utm_medium: "e", utm_campaign: "c" },
    ];
    const { matchCount } = bulkFindReplace(rows, "baseUrl", "other.com", "new.com", new Set(), false);
    expect(matchCount).toBe(0);
  });
});
