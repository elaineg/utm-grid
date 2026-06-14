/**
 * My Workspaces — device-local index of workspaces this browser created or opened.
 *
 * 100% client-side (localStorage key `utm-grid:my-workspaces`).
 * No Turso, no API, no accounts.
 *
 * Each entry: { id, label, role, lastOpened, link }
 * - role "owner": this browser POSTed the workspace (Create shared workspace)
 * - role "visited": this browser opened a /w/<id> that resolved
 * - Owner is NEVER downgraded to visited
 * - Only workspaces that RESOLVE are recorded (never "not found" ids)
 * - lastOpened is updated on every subsequent open; label updated if changed
 */

export const MY_WORKSPACES_KEY = "utm-grid:my-workspaces";

export type WorkspaceRole = "owner" | "visited";

export interface MyWorkspaceEntry {
  id: string;
  /** Display name — workspace editor label or derived fallback ("Workspace <short-id>"). */
  label: string;
  /** "owner" = this device created it; "visited" = this device opened it. */
  role: WorkspaceRole;
  /** Unix ms timestamp of most recent open on this device. */
  lastOpened: number;
  /** Full https://<host>/w/<id> URL, built from window.location.origin. */
  link: string;
}

// ── Parse / serialize ──────────────────────────────────────────────────────────

/** Deserialize from raw localStorage value. Returns [] on any error or absence. */
export function deserializeMyWorkspaces(raw: string | null): MyWorkspaceEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMyWorkspaceEntry);
  } catch {
    return [];
  }
}

/** Serialize to JSON string for localStorage. */
export function serializeMyWorkspaces(entries: MyWorkspaceEntry[]): string {
  return JSON.stringify(entries);
}

function isMyWorkspaceEntry(v: unknown): v is MyWorkspaceEntry {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.label === "string" &&
    (e.role === "owner" || e.role === "visited") &&
    typeof e.lastOpened === "number" &&
    typeof e.link === "string"
  );
}

// ── CRUD helpers (pure — take/return new arrays, no mutation) ──────────────────

/**
 * Upsert a workspace entry by id.
 * - If not present: insert with the given role.
 * - If already present as "owner": update label + lastOpened only (NEVER downgrade to visited).
 * - If already present as "visited": update label, lastOpened, link; upgrade to owner if role="owner".
 * Returns a new array sorted newest-lastOpened-first.
 */
export function upsertMyWorkspace(
  entries: MyWorkspaceEntry[],
  next: MyWorkspaceEntry
): MyWorkspaceEntry[] {
  const idx = entries.findIndex((e) => e.id === next.id);
  if (idx < 0) {
    // New entry: prepend (newest first)
    return sortByLastOpened([next, ...entries]);
  }
  const existing = entries[idx];
  // Never downgrade owner to visited
  const resolvedRole: WorkspaceRole =
    existing.role === "owner" ? "owner" : next.role;
  const updated: MyWorkspaceEntry = {
    ...existing,
    label: next.label || existing.label,
    role: resolvedRole,
    lastOpened: next.lastOpened,
    link: next.link || existing.link,
  };
  const copy = [...entries];
  copy[idx] = updated;
  return sortByLastOpened(copy);
}

/** Remove a workspace entry by id (local-only — does NOT touch the server). */
export function removeMyWorkspace(
  entries: MyWorkspaceEntry[],
  id: string
): MyWorkspaceEntry[] {
  return entries.filter((e) => e.id !== id);
}

/** Sort entries newest-lastOpened first (mutates and returns the passed array). */
function sortByLastOpened(entries: MyWorkspaceEntry[]): MyWorkspaceEntry[] {
  return [...entries].sort((a, b) => b.lastOpened - a.lastOpened);
}

/**
 * Filter entries by label substring, case-insensitively.
 * Returns all entries when query is empty/whitespace.
 */
export function filterMyWorkspaces(
  entries: MyWorkspaceEntry[],
  query: string
): MyWorkspaceEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter((e) => e.label.toLowerCase().includes(q));
}

/**
 * Derive a human-readable label from a workspace payload's name field.
 * Falls back to "Workspace <first-8-chars-of-id>" when no name is set.
 */
export function deriveWorkspaceLabel(name: string | undefined, id: string): string {
  const trimmed = (name ?? "").trim();
  return trimmed || `Workspace ${id.slice(0, 8)}`;
}

// ── localStorage read/write helpers (for effects — NOT for render/useState) ────

/**
 * Read the current my-workspaces list directly from window.localStorage.
 * MUST only be called inside a useEffect (never in render or useState initializer).
 */
export function readMyWorkspacesFromStorage(): MyWorkspaceEntry[] {
  try {
    const raw = window.localStorage.getItem(MY_WORKSPACES_KEY);
    return deserializeMyWorkspaces(raw);
  } catch {
    return [];
  }
}

/**
 * Write the my-workspaces list directly to window.localStorage.
 * MUST only be called inside a useEffect.
 */
export function writeMyWorkspacesToStorage(entries: MyWorkspaceEntry[]): void {
  try {
    window.localStorage.setItem(MY_WORKSPACES_KEY, serializeMyWorkspaces(entries));
  } catch {
    // Storage unavailable — silently ignore
  }
}

/**
 * Convenience: upsert a single entry into localStorage.
 * Reads current list, upserts, writes back.
 * MUST only be called inside a useEffect.
 */
export function upsertMyWorkspaceInStorage(next: MyWorkspaceEntry): void {
  const current = readMyWorkspacesFromStorage();
  const updated = upsertMyWorkspace(current, next);
  writeMyWorkspacesToStorage(updated);
}
