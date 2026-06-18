/**
 * Unit tests for auto-fix diff correctness (NEW — round-4 DEEPEN verify).
 *
 * The diff built inside cleanAll() is derived from normalizeAllRows(); these
 * tests verify the underlying logic directly rather than through the DOM so
 * we can cover input variety quickly.
 *
 * Test matrix per spec:
 *  - uppercase values
 *  - spaces → underscore
 *  - leading/trailing whitespace
 *  - near-duplicate cross-row variants (Spring-Sale vs spring_sale)
 *  - off-spec → nearest-allowed fix (via normalizeValue)
 *  - mixed clean+dirty rows
 *  - 0-change / clean case → count === 0
 *  - large batch ≥20 rows
 *  - diff before→after accuracy (cross-checked against resulting row values)
 */
import { describe, expect, it } from "vitest";
import { normalizeAllRows } from "./normalize";
import { emptyRow, DEFAULT_LINT_SETTINGS, type UtmRow } from "./types";

// Helper: build a diff the same way cleanAll() does in UtmGrid.tsx
function buildDiff(rows: UtmRow[]) {
  const { rows: cleaned } = normalizeAllRows(rows, DEFAULT_LINT_SETTINGS);
  const UTM_FIELDS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ] as const;
  const entries: { rowIndex: number; field: string; before: string; after: string }[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (cleaned[i] !== rows[i]) {
      for (const f of UTM_FIELDS) {
        if (cleaned[i][f] !== rows[i][f]) {
          entries.push({ rowIndex: i + 1, field: f, before: rows[i][f], after: cleaned[i][f] });
        }
      }
    }
  }
  return { entries, cleaned };
}

describe("autofix diff correctness — input variety", () => {
  it("uppercase only: single field lowercased, correct before/after", () => {
    const rows = [{ ...emptyRow("r1"), utm_source: "Newsletter" }];
    const { entries, cleaned } = buildDiff(rows);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ rowIndex: 1, field: "utm_source", before: "Newsletter", after: "newsletter" });
    // Cross-check: resulting cell matches 'after'
    expect(cleaned[0].utm_source).toBe(entries[0].after);
  });

  it("spaces → underscore: utm_campaign 'Spring Sale' → 'spring_sale'", () => {
    const rows = [{ ...emptyRow("r1"), utm_campaign: "Spring Sale" }];
    const { entries, cleaned } = buildDiff(rows);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ before: "Spring Sale", after: "spring_sale" });
    expect(cleaned[0].utm_campaign).toBe("spring_sale");
  });

  it("leading/trailing whitespace: ' Instagram ' → 'instagram' (no trailing underscore)", () => {
    const rows = [{ ...emptyRow("r1"), utm_source: " Instagram " }];
    const { entries, cleaned } = buildDiff(rows);
    expect(entries[0].after).toBe("instagram");
    expect(cleaned[0].utm_source).toBe("instagram");
  });

  it("near-duplicate cross-row variant: Spring-Sale and spring_sale both need fix on the Spring-Sale row", () => {
    const rows = [
      { ...emptyRow("r1"), utm_campaign: "Spring-Sale" },
      { ...emptyRow("r2"), utm_campaign: "spring_sale" },
    ];
    const { entries, cleaned } = buildDiff(rows);
    // Only r1 changes
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ rowIndex: 1, field: "utm_campaign", before: "Spring-Sale", after: "spring_sale" });
    expect(cleaned[0].utm_campaign).toBe("spring_sale");
    expect(cleaned[1].utm_campaign).toBe("spring_sale"); // unchanged
  });

  it("mixed clean+dirty rows: diff lists only the dirty cells", () => {
    const rows = [
      { ...emptyRow("r1"), utm_source: "Facebook", utm_campaign: "spring_sale" }, // source dirty, campaign clean
      { ...emptyRow("r2"), utm_source: "newsletter", utm_campaign: "summer_sale" }, // both clean
      { ...emptyRow("r3"), utm_source: "twitter", utm_campaign: "Black Friday" }, // campaign dirty
    ];
    const { entries, cleaned } = buildDiff(rows);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ rowIndex: 1, field: "utm_source", before: "Facebook", after: "facebook" });
    expect(entries[1]).toMatchObject({ rowIndex: 3, field: "utm_campaign", before: "Black Friday", after: "black_friday" });
    // Cross-check: resulting values match 'after'
    expect(cleaned[0].utm_source).toBe("facebook");
    expect(cleaned[2].utm_campaign).toBe("black_friday");
    // Clean row unchanged
    expect(cleaned[1]).toBe(rows[1]);
  });

  it("0-change case: fully clean grid → count === 0, no diff entries", () => {
    const rows = [
      { ...emptyRow("r1"), utm_source: "newsletter", utm_campaign: "spring_sale" },
      { ...emptyRow("r2"), utm_source: "facebook", utm_campaign: "black_friday" },
    ];
    const { entries } = buildDiff(rows);
    expect(entries).toHaveLength(0);
  });

  it("large batch ≥20 rows: diff lists exactly as many entries as dirty cells", () => {
    // 25 rows: even indices have uppercase utm_source, odd are clean
    const rows: UtmRow[] = Array.from({ length: 25 }, (_, i) => ({
      ...emptyRow(`r${i}`),
      utm_source: i % 2 === 0 ? "Facebook" : "newsletter",
    }));
    const { entries, cleaned } = buildDiff(rows);
    const dirtyCount = rows.filter((_, i) => i % 2 === 0).length; // 13 rows (0,2,4,...24)
    expect(entries).toHaveLength(dirtyCount);
    // Every diff entry's 'after' matches the resulting cleaned value
    for (const e of entries) {
      const idx = e.rowIndex - 1;
      expect(cleaned[idx].utm_source).toBe(e.after);
      expect(e.before).toBe("Facebook");
      expect(e.after).toBe("facebook");
    }
  });

  it("multiple fields dirty in same row: one diff entry per field, all accurate", () => {
    const rows = [
      {
        ...emptyRow("r1"),
        utm_source: "Facebook",
        utm_medium: "Paid Social",
        utm_campaign: "Spring Sale",
        utm_term: "clean_term",
        utm_content: "Banner Ad",
      },
    ];
    const { entries, cleaned } = buildDiff(rows);
    expect(entries).toHaveLength(4); // source, medium, campaign, content (term is clean)
    const fields = entries.map((e) => e.field);
    expect(fields).toContain("utm_source");
    expect(fields).toContain("utm_medium");
    expect(fields).toContain("utm_campaign");
    expect(fields).toContain("utm_content");
    // Cross-check each
    for (const e of entries) {
      expect(cleaned[0][e.field as keyof UtmRow]).toBe(e.after);
    }
  });

  it("spec success check: 3-row grid (row1 Spring-Sale, row2 Newsletter, row3 clean) → exactly 2 diff entries", () => {
    // This mirrors the spec's 'Visible auto-fix diff' success check exactly
    const rows = [
      { ...emptyRow("r1"), utm_campaign: "Spring-Sale", utm_source: "newsletter", utm_medium: "email" },
      { ...emptyRow("r2"), utm_source: "Newsletter", utm_medium: "email", utm_campaign: "spring_sale" },
      { ...emptyRow("r3"), utm_source: "facebook", utm_medium: "paid_social", utm_campaign: "summer" },
    ];
    const { entries } = buildDiff(rows);
    expect(entries).toHaveLength(2);
    const campaignEntry = entries.find((e) => e.field === "utm_campaign" && e.rowIndex === 1);
    const sourceEntry = entries.find((e) => e.field === "utm_source" && e.rowIndex === 2);
    expect(campaignEntry).toBeDefined();
    expect(campaignEntry!.before).toBe("Spring-Sale");
    expect(campaignEntry!.after).toBe("spring_sale");
    expect(sourceEntry).toBeDefined();
    expect(sourceEntry!.before).toBe("Newsletter");
    expect(sourceEntry!.after).toBe("newsletter");
  });

  it("no phantom changes: clean fields never appear in diff even alongside dirty fields", () => {
    const rows = [
      {
        ...emptyRow("r1"),
        utm_source: "facebook", // already clean
        utm_medium: "Email",    // dirty
        utm_campaign: "spring_sale", // already clean
      },
    ];
    const { entries } = buildDiff(rows);
    expect(entries).toHaveLength(1);
    expect(entries[0].field).toBe("utm_medium");
    expect(entries[0].before).toBe("Email");
    expect(entries[0].after).toBe("email");
  });
});
