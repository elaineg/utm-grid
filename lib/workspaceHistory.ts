/**
 * Pure logic for workspace version history.
 * No Node.js or browser APIs — safe for unit tests.
 */

export const VERSION_CAP = 25;

export interface WorkspaceVersion {
  id: number;
  workspace_id: string;
  data: string;
  editor: string | null;
  created_at: number;
}

/**
 * Returns true if the incoming data string is byte-identical to the latest
 * stored version's data — used to skip duplicate version inserts from
 * debounced no-op saves.
 */
export function isDuplicateVersion(
  incomingData: string,
  latestStoredData: string | null | undefined
): boolean {
  if (latestStoredData === null || latestStoredData === undefined) return false;
  return incomingData === latestStoredData;
}

/**
 * Given an ordered list of version ids (ascending), returns the ids of rows
 * that should be deleted to bring the total down to VERSION_CAP.
 * The list must be sorted oldest-first (lowest id first).
 * Returns an empty array if no pruning is needed.
 */
export function idsToprune(ascendingIds: number[]): number[] {
  const excess = ascendingIds.length - VERSION_CAP;
  if (excess <= 0) return [];
  return ascendingIds.slice(0, excess);
}

/**
 * Normalize an editor label from request input.
 * - null / undefined / empty string → null (stored as NULL in DB)
 * - Non-string coerced to string
 * - Trimmed; if empty after trim → null
 * - Truncated to 80 chars max
 */
export function normalizeEditor(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().slice(0, 80);
  return s.length > 0 ? s : null;
}

/**
 * Format a relative time string from a unix ms timestamp.
 * Matches the format used in the /w/[id] page.
 */
export function relativeTimeFromMs(ts: number, now: number = Date.now()): string {
  const diffMs = now - ts;
  const s = Math.floor(diffMs / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
