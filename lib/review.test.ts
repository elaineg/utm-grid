/**
 * Unit tests for lib/review.ts
 *
 * Tests:
 * - computeReviewRollup: count roll-up, legacy-empty default, single-source eligibility
 * - getRowReviewState: per-row state derivation
 * - setRowReview / clearRowReview: immutable updates
 * - deserializeReviewMap: backward compat (legacy workspaces, malformed data)
 *
 * Guard #2 (SINGLE SOURCE): all counts derived from computeReviewRollup.
 * Guard #3 (LEGACY DEFAULT): missing reviewMap → all unreviewed, no crash.
 */

import { describe, it, expect } from "vitest";
import {
  computeReviewRollup,
  getRowReviewState,
  getRowReviewEntry,
  setRowReview,
  clearRowReview,
  deserializeReviewMap,
  type ReviewMap,
  type ReviewEntry,
} from "./review";

// ── computeReviewRollup ───────────────────────────────────────────────────────

describe("computeReviewRollup", () => {
  const rowIds = ["row-1", "row-2", "row-3"];

  it("returns all-unreviewed for undefined reviewMap (legacy workspace default)", () => {
    const r = computeReviewRollup(undefined, rowIds);
    expect(r.approved).toBe(0);
    expect(r.needsChanges).toBe(0);
    expect(r.unreviewed).toBe(3);
    expect(r.total).toBe(3);
  });

  it("returns all-unreviewed for null reviewMap (legacy compat)", () => {
    const r = computeReviewRollup(null, rowIds);
    expect(r.approved).toBe(0);
    expect(r.needsChanges).toBe(0);
    expect(r.unreviewed).toBe(3);
    expect(r.total).toBe(3);
  });

  it("returns all-unreviewed for empty reviewMap ({})", () => {
    const r = computeReviewRollup({}, rowIds);
    expect(r.approved).toBe(0);
    expect(r.needsChanges).toBe(0);
    expect(r.unreviewed).toBe(3);
    expect(r.total).toBe(3);
  });

  it("counts approved and needs-changes correctly", () => {
    const reviewMap: ReviewMap = {
      "row-1": { state: "approved", reviewer: "Sam", note: "", updatedAt: 100 },
      "row-2": { state: "needs-changes", reviewer: "Alex", note: "fix casing", updatedAt: 200 },
    };
    const r = computeReviewRollup(reviewMap, rowIds);
    expect(r.approved).toBe(1);
    expect(r.needsChanges).toBe(1);
    expect(r.unreviewed).toBe(1);
    expect(r.total).toBe(3);
  });

  it("all-approved scenario", () => {
    const reviewMap: ReviewMap = {
      "row-1": { state: "approved", reviewer: "Sam", note: "", updatedAt: 100 },
      "row-2": { state: "approved", reviewer: "Sam", note: "", updatedAt: 200 },
      "row-3": { state: "approved", reviewer: "Sam", note: "", updatedAt: 300 },
    };
    const r = computeReviewRollup(reviewMap, rowIds);
    expect(r.approved).toBe(3);
    expect(r.needsChanges).toBe(0);
    expect(r.unreviewed).toBe(0);
    expect(r.total).toBe(3);
  });

  it("all-needs-changes scenario", () => {
    const reviewMap: ReviewMap = {
      "row-1": { state: "needs-changes", reviewer: "Alex", note: "x", updatedAt: 1 },
      "row-2": { state: "needs-changes", reviewer: "Alex", note: "y", updatedAt: 2 },
      "row-3": { state: "needs-changes", reviewer: "Alex", note: "z", updatedAt: 3 },
    };
    const r = computeReviewRollup(reviewMap, rowIds);
    expect(r.approved).toBe(0);
    expect(r.needsChanges).toBe(3);
    expect(r.unreviewed).toBe(0);
    expect(r.total).toBe(3);
  });

  it("handles empty rowIds", () => {
    const r = computeReviewRollup({}, []);
    expect(r.approved).toBe(0);
    expect(r.needsChanges).toBe(0);
    expect(r.unreviewed).toBe(0);
    expect(r.total).toBe(0);
  });

  it("ignores reviewMap entries for row ids not in the current rows (stale entries)", () => {
    // This guards against stale entries from deleted rows inflating counts
    const reviewMap: ReviewMap = {
      "old-row-deleted": { state: "approved", reviewer: "Sam", note: "", updatedAt: 100 },
      "row-1": { state: "approved", reviewer: "Sam", note: "", updatedAt: 200 },
    };
    const r = computeReviewRollup(reviewMap, ["row-1", "row-2"]);
    expect(r.approved).toBe(1); // only row-1 counts
    expect(r.needsChanges).toBe(0);
    expect(r.unreviewed).toBe(1); // row-2 is unreviewed
    expect(r.total).toBe(2);
  });

  it("SINGLE SOURCE: approved+needsChanges+unreviewed always sums to total", () => {
    // Guard #2: verify roll-up math is never inconsistent
    const reviewMap: ReviewMap = {
      "row-1": { state: "approved", reviewer: "A", note: "", updatedAt: 1 },
      "row-2": { state: "needs-changes", reviewer: "B", note: "x", updatedAt: 2 },
    };
    const ids = ["row-1", "row-2", "row-3", "row-4"];
    const r = computeReviewRollup(reviewMap, ids);
    expect(r.approved + r.needsChanges + r.unreviewed).toBe(r.total);
    expect(r.total).toBe(4);
  });
});

// ── getRowReviewState ─────────────────────────────────────────────────────────

describe("getRowReviewState", () => {
  const reviewMap: ReviewMap = {
    "row-1": { state: "approved", reviewer: "Sam", note: "", updatedAt: 100 },
    "row-2": { state: "needs-changes", reviewer: "Alex", note: "fix", updatedAt: 200 },
  };

  it("returns 'approved' for an approved row", () => {
    expect(getRowReviewState(reviewMap, "row-1")).toBe("approved");
  });

  it("returns 'needs-changes' for a needs-changes row", () => {
    expect(getRowReviewState(reviewMap, "row-2")).toBe("needs-changes");
  });

  it("returns 'unreviewed' for a row with no entry", () => {
    expect(getRowReviewState(reviewMap, "row-3")).toBe("unreviewed");
  });

  it("returns 'unreviewed' when reviewMap is undefined (legacy)", () => {
    expect(getRowReviewState(undefined, "row-1")).toBe("unreviewed");
  });

  it("returns 'unreviewed' when reviewMap is null (legacy)", () => {
    expect(getRowReviewState(null, "row-1")).toBe("unreviewed");
  });

  it("returns 'unreviewed' when reviewMap is empty", () => {
    expect(getRowReviewState({}, "row-1")).toBe("unreviewed");
  });
});

// ── getRowReviewEntry ─────────────────────────────────────────────────────────

describe("getRowReviewEntry", () => {
  const entry: ReviewEntry = { state: "approved", reviewer: "Sam", note: "looks good", updatedAt: 999 };
  const reviewMap: ReviewMap = { "row-1": entry };

  it("returns the entry for a reviewed row", () => {
    const result = getRowReviewEntry(reviewMap, "row-1");
    expect(result).not.toBeNull();
    expect(result!.state).toBe("approved");
    expect(result!.reviewer).toBe("Sam");
    expect(result!.note).toBe("looks good");
  });

  it("returns null for an unreviewed row", () => {
    expect(getRowReviewEntry(reviewMap, "row-99")).toBeNull();
  });

  it("returns null when reviewMap is undefined", () => {
    expect(getRowReviewEntry(undefined, "row-1")).toBeNull();
  });
});

// ── setRowReview ──────────────────────────────────────────────────────────────

describe("setRowReview", () => {
  it("creates a new ReviewMap entry from undefined (legacy workspace)", () => {
    const next = setRowReview(undefined, "row-1", "approved", "Sam", "LGTM");
    expect(next["row-1"]).toBeDefined();
    expect(next["row-1"].state).toBe("approved");
    expect(next["row-1"].reviewer).toBe("Sam");
    expect(next["row-1"].note).toBe("LGTM");
  });

  it("adds entry to existing map without mutating the original", () => {
    const original: ReviewMap = {
      "row-1": { state: "approved", reviewer: "Sam", note: "", updatedAt: 1 },
    };
    const next = setRowReview(original, "row-2", "needs-changes", "Alex", "fix casing");
    expect(next["row-2"]).toBeDefined();
    expect(next["row-2"].state).toBe("needs-changes");
    // Original not mutated
    expect(original["row-2"]).toBeUndefined();
    // row-1 preserved
    expect(next["row-1"].state).toBe("approved");
  });

  it("updates an existing entry (last reviewer wins)", () => {
    const original: ReviewMap = {
      "row-1": { state: "approved", reviewer: "Sam", note: "ok", updatedAt: 1 },
    };
    const next = setRowReview(original, "row-1", "needs-changes", "Alex", "reconsider");
    expect(next["row-1"].state).toBe("needs-changes");
    expect(next["row-1"].reviewer).toBe("Alex");
    expect(next["row-1"].note).toBe("reconsider");
  });

  it("trims reviewer name and note", () => {
    const next = setRowReview(undefined, "row-1", "approved", "  Sam  ", "  fix  ");
    expect(next["row-1"].reviewer).toBe("Sam");
    expect(next["row-1"].note).toBe("fix");
  });

  it("caps reviewer name at 80 chars", () => {
    const longName = "A".repeat(200);
    const next = setRowReview(undefined, "row-1", "approved", longName, "");
    expect(next["row-1"].reviewer.length).toBeLessThanOrEqual(80);
  });

  it("caps note at 300 chars", () => {
    const longNote = "B".repeat(400);
    const next = setRowReview(undefined, "row-1", "approved", "Sam", longNote);
    expect(next["row-1"].note.length).toBeLessThanOrEqual(300);
  });

  it("sets updatedAt to a recent timestamp", () => {
    const before = Date.now();
    const next = setRowReview(undefined, "row-1", "approved", "Sam", "");
    const after = Date.now();
    expect(next["row-1"].updatedAt).toBeGreaterThanOrEqual(before);
    expect(next["row-1"].updatedAt).toBeLessThanOrEqual(after);
  });
});

// ── clearRowReview ────────────────────────────────────────────────────────────

describe("clearRowReview", () => {
  it("removes the review entry for the given row", () => {
    const original: ReviewMap = {
      "row-1": { state: "approved", reviewer: "Sam", note: "", updatedAt: 1 },
      "row-2": { state: "needs-changes", reviewer: "Alex", note: "x", updatedAt: 2 },
    };
    const next = clearRowReview(original, "row-1");
    expect(next["row-1"]).toBeUndefined();
    // row-2 preserved
    expect(next["row-2"]).toBeDefined();
  });

  it("is a no-op on an already-unreviewed row", () => {
    const original: ReviewMap = {
      "row-2": { state: "approved", reviewer: "Sam", note: "", updatedAt: 1 },
    };
    const next = clearRowReview(original, "row-99");
    // row-2 still there
    expect(next["row-2"]).toBeDefined();
    // row-99 not there (was never there)
    expect(next["row-99"]).toBeUndefined();
  });

  it("handles undefined reviewMap (legacy)", () => {
    const next = clearRowReview(undefined, "row-1");
    expect(next).toEqual({});
  });

  it("does not mutate the original map", () => {
    const original: ReviewMap = {
      "row-1": { state: "approved", reviewer: "Sam", note: "", updatedAt: 1 },
    };
    const ref = original["row-1"];
    clearRowReview(original, "row-1");
    // Original unchanged
    expect(original["row-1"]).toBe(ref);
  });
});

// ── deserializeReviewMap ──────────────────────────────────────────────────────

describe("deserializeReviewMap", () => {
  it("returns undefined for undefined (legacy workspace — no reviewMap field)", () => {
    expect(deserializeReviewMap(undefined)).toBeUndefined();
  });

  it("returns undefined for null (null reviewMap field in payload)", () => {
    expect(deserializeReviewMap(null)).toBeUndefined();
  });

  it("returns undefined for non-object (malformed)", () => {
    expect(deserializeReviewMap("string")).toBeUndefined();
    expect(deserializeReviewMap(42)).toBeUndefined();
    expect(deserializeReviewMap([])).toBeUndefined();
  });

  it("returns undefined for empty object (no entries)", () => {
    // An empty reviewMap serializes as {} and deserializes back to undefined
    // (we return undefined for 0-entry maps to keep payload clean)
    expect(deserializeReviewMap({})).toBeUndefined();
  });

  it("deserializes a valid reviewMap correctly", () => {
    const raw = {
      "row-1": { state: "approved", reviewer: "Sam", note: "looks good", updatedAt: 1000 },
      "row-2": { state: "needs-changes", reviewer: "Alex", note: "fix", updatedAt: 2000 },
    };
    const result = deserializeReviewMap(raw);
    expect(result).not.toBeUndefined();
    expect(result!["row-1"].state).toBe("approved");
    expect(result!["row-1"].reviewer).toBe("Sam");
    expect(result!["row-2"].state).toBe("needs-changes");
    expect(result!["row-2"].note).toBe("fix");
  });

  it("skips malformed entries and keeps valid ones", () => {
    const raw = {
      "row-1": { state: "approved", reviewer: "Sam", note: "", updatedAt: 100 },
      "row-bad-1": { state: "invalid-state", reviewer: "Sam", note: "", updatedAt: 100 },
      "row-bad-2": { state: "approved", reviewer: 999, note: "", updatedAt: 100 }, // reviewer not string
      "row-bad-3": null, // null entry
    };
    const result = deserializeReviewMap(raw);
    expect(result).not.toBeUndefined();
    expect(result!["row-1"]).toBeDefined();
    expect(result!["row-bad-1"]).toBeUndefined();
    expect(result!["row-bad-2"]).toBeUndefined();
    expect(result!["row-bad-3"]).toBeUndefined();
  });

  it("round-trips through JSON.stringify/parse (wire format compat)", () => {
    const reviewMap: ReviewMap = {
      "row-1": { state: "approved", reviewer: "Sam", note: "LGTM", updatedAt: 12345 },
      "row-2": { state: "needs-changes", reviewer: "Alex", note: "fix casing", updatedAt: 67890 },
    };
    // Simulate serializing to server payload and deserializing back
    const serialized = JSON.parse(JSON.stringify(reviewMap)) as unknown;
    const result = deserializeReviewMap(serialized);
    expect(result).not.toBeUndefined();
    expect(result!["row-1"].state).toBe("approved");
    expect(result!["row-1"].reviewer).toBe("Sam");
    expect(result!["row-1"].updatedAt).toBe(12345);
    expect(result!["row-2"].state).toBe("needs-changes");
    expect(result!["row-2"].note).toBe("fix casing");
  });
});

// ── FIX A: Unified identity — reviewer name attaches to ReviewEntry (not "Anonymous") ─────

describe("FIX A: unified identity attaches reviewer name to ReviewEntry.reviewer", () => {
  it("setRowReview stores the reviewer name on the entry (not 'Anonymous')", () => {
    const map = setRowReview(undefined, "row-1", "approved", "Sam", "LGTM");
    expect(map["row-1"].reviewer).toBe("Sam");
    expect(map["row-1"].reviewer).not.toBe("Anonymous");
  });

  it("setRowReview with empty string stores '' (not 'Anonymous')", () => {
    // Unified identity: empty string = name not set; caller decides display fallback.
    // The ReviewEntry.reviewer must NOT be "Anonymous" — that was the P0 bug.
    const map = setRowReview(undefined, "row-1", "approved", "", "LGTM");
    expect(map["row-1"].reviewer).toBe("");
    expect(map["row-1"].reviewer).not.toBe("Anonymous");
  });

  it("setRowReview with trimmed name stores trimmed value", () => {
    const map = setRowReview(undefined, "row-1", "approved", "  Priya  ", "looks good");
    expect(map["row-1"].reviewer).toBe("Priya");
  });

  it("note persists on the ReviewEntry and round-trips through serialize/deserialize", () => {
    // FIX B: note must survive serialization (the 'note persists' requirement)
    const map = setRowReview(undefined, "row-1", "needs-changes", "Wen", "fix campaign casing");
    expect(map["row-1"].note).toBe("fix campaign casing");

    const serialized = JSON.parse(JSON.stringify(map)) as unknown;
    const result = deserializeReviewMap(serialized);
    expect(result).not.toBeUndefined();
    expect(result!["row-1"].note).toBe("fix campaign casing");
    expect(result!["row-1"].reviewer).toBe("Wen");
  });
});

// ── FIX B: Note persistence ───────────────────────────────────────────────────

describe("FIX B: note persists on ReviewEntry and renders on /review", () => {
  it("note is stored in ReviewEntry and survives setRowReview", () => {
    const map = setRowReview(undefined, "row-1", "needs-changes", "Wen", "needs lower case");
    expect(map["row-1"].note).toBe("needs lower case");
  });

  it("note is preserved when updating state of the same row", () => {
    const initial = setRowReview(undefined, "row-1", "needs-changes", "Wen", "original note");
    // Update with a new note
    const updated = setRowReview(initial, "row-1", "approved", "Wen", "fixed now");
    expect(updated["row-1"].note).toBe("fixed now");
  });

  it("empty note is stored as empty string (not null/undefined)", () => {
    const map = setRowReview(undefined, "row-1", "approved", "Sam", "");
    expect(map["row-1"].note).toBe("");
    expect(map["row-1"].note).not.toBeNull();
    expect(map["row-1"].note).not.toBeUndefined();
  });
});

// ── Legacy workspace backward compatibility ───────────────────────────────────

describe("legacy workspace backward compatibility (guard #3: legacy-empty default)", () => {
  it("a legacy workspace with no reviewMap field shows 0 reviews / all unreviewed", () => {
    // Simulate parseWorkspacePayload receiving a workspace saved before the review feature
    const legacyPayload = { reviewMap: undefined };
    const rowIds = ["row-1", "row-2", "row-3"];

    const rollup = computeReviewRollup(legacyPayload.reviewMap, rowIds);
    expect(rollup.approved).toBe(0);
    expect(rollup.needsChanges).toBe(0);
    expect(rollup.unreviewed).toBe(3);
    expect(rollup.total).toBe(3);

    // Every row shows "unreviewed"
    for (const id of rowIds) {
      expect(getRowReviewState(legacyPayload.reviewMap, id)).toBe("unreviewed");
      expect(getRowReviewEntry(legacyPayload.reviewMap, id)).toBeNull();
    }
  });

  it("a workspace with reviewMap: null also shows 0 reviews (defensive)", () => {
    const payloadWithNull = { reviewMap: null as unknown as undefined };
    const rowIds = ["row-1"];
    const rollup = computeReviewRollup(payloadWithNull.reviewMap, rowIds);
    expect(rollup.unreviewed).toBe(1);
    expect(rollup.approved).toBe(0);
  });
});
