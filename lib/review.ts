/**
 * Review & Approval types and utilities.
 * Pure module — no Node.js or browser APIs.
 *
 * Review state is an ADDITIVE field on the workspace payload (reviewMap).
 * No new DB table, no migration — legacy workspaces simply have no reviewMap
 * and show 0 reviews (all rows unreviewed).
 *
 * SINGLE SOURCE OF TRUTH (guard: ui-enabled-and-action-filter-from-one-eligibility-source):
 * All counts (approved / needs-changes / unreviewed) and per-row state
 * derive from computeReviewRollup() which takes the reviewMap + row ids.
 * Never re-derive counts in parallel places.
 */

export type ReviewState = "approved" | "needs-changes" | "unreviewed";

/** Per-row review entry stored in reviewMap. */
export interface ReviewEntry {
  /** The review decision. */
  state: "approved" | "needs-changes";
  /** Reviewer display name (optional, anonymous-first). */
  reviewer: string;
  /** Short note from reviewer (optional). */
  note: string;
  /** Unix ms timestamp of when this review was set. */
  updatedAt: number;
}

/**
 * Map from row.id → ReviewEntry.
 * Stored as an additive field (reviewMap) on WorkspacePayload.
 * Absent / null → all rows unreviewed (legacy compat).
 */
export type ReviewMap = Record<string, ReviewEntry>;

/** Roll-up counts derived from reviewMap + row ids. */
export interface ReviewRollup {
  approved: number;
  needsChanges: number;
  unreviewed: number;
  total: number;
}

/**
 * Compute the roll-up from a ReviewMap and the ordered list of row ids.
 * SINGLE SOURCE: both the roll-up panel and per-row badge state call this.
 * Legacy workspaces (reviewMap undefined/null) return all-unreviewed.
 */
export function computeReviewRollup(
  reviewMap: ReviewMap | undefined | null,
  rowIds: string[]
): ReviewRollup {
  const total = rowIds.length;
  if (!reviewMap || total === 0) {
    return { approved: 0, needsChanges: 0, unreviewed: total, total };
  }

  let approved = 0;
  let needsChanges = 0;

  for (const id of rowIds) {
    const entry = reviewMap[id];
    if (!entry) continue;
    if (entry.state === "approved") approved++;
    else if (entry.state === "needs-changes") needsChanges++;
  }

  const unreviewed = total - approved - needsChanges;
  return { approved, needsChanges, unreviewed, total };
}

/**
 * Get the ReviewState for a single row.
 * Returns "unreviewed" when no entry exists (legacy compat).
 * Use this in both the row badge and the /review page — single source.
 */
export function getRowReviewState(
  reviewMap: ReviewMap | undefined | null,
  rowId: string
): ReviewState {
  if (!reviewMap) return "unreviewed";
  const entry = reviewMap[rowId];
  if (!entry) return "unreviewed";
  return entry.state;
}

/**
 * Get the ReviewEntry for a single row, or null if unreviewed.
 */
export function getRowReviewEntry(
  reviewMap: ReviewMap | undefined | null,
  rowId: string
): ReviewEntry | null {
  if (!reviewMap) return null;
  return reviewMap[rowId] ?? null;
}

/**
 * Return a new ReviewMap with the entry for rowId set to the given state + note + reviewer.
 * Immutable — returns a new map object.
 */
export function setRowReview(
  reviewMap: ReviewMap | undefined | null,
  rowId: string,
  state: "approved" | "needs-changes",
  reviewer: string,
  note: string
): ReviewMap {
  const base: ReviewMap = reviewMap ? { ...reviewMap } : {};
  base[rowId] = {
    state,
    reviewer: reviewer.trim().slice(0, 80),
    note: note.trim().slice(0, 300),
    updatedAt: Date.now(),
  };
  return base;
}

/**
 * Return a new ReviewMap with the entry for rowId cleared (set to unreviewed).
 */
export function clearRowReview(
  reviewMap: ReviewMap | undefined | null,
  rowId: string
): ReviewMap {
  if (!reviewMap) return {};
  const next = { ...reviewMap };
  delete next[rowId];
  return next;
}

/**
 * Parse a reviewMap from an unknown value (from server payload).
 * Returns null if the value is not a valid reviewMap shape.
 * Used in parseWorkspacePayload for backward compat.
 */
export function deserializeReviewMap(v: unknown): ReviewMap | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v !== "object" || Array.isArray(v)) return undefined;
  const obj = v as Record<string, unknown>;
  const result: ReviewMap = {};
  for (const [rowId, entry] of Object.entries(obj)) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    if (
      (e.state !== "approved" && e.state !== "needs-changes") ||
      typeof e.reviewer !== "string" ||
      typeof e.note !== "string" ||
      typeof e.updatedAt !== "number"
    ) {
      continue; // skip malformed entries
    }
    result[rowId] = {
      state: e.state,
      reviewer: e.reviewer,
      note: e.note,
      updatedAt: e.updatedAt,
    };
  }
  return Object.keys(result).length > 0 ? result : undefined;
}
