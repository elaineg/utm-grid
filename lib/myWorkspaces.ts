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
  /**
   * Friendly default label — computed at record time from workspace content.
   * Derivation order: utm_campaign of first row → domain of base URL → "Workspace — Mon DD".
   * NEVER the raw id string.
   */
  label: string;
  /**
   * User-given name (device-local, stored here in localStorage).
   * When set, takes precedence over `label` for display and search.
   * NO server call — anonymous-first, free-tier.
   */
  name?: string;
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
    // `name` is optional — backward compat with entries that predate this field
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
 * Filter entries by the RESOLVED DISPLAY NAME (user `name` ?? friendly `label`),
 * case-insensitively. Also matches the base URL fragment in `label`.
 * Returns all entries when query is empty/whitespace.
 *
 * FIX A-3 (My Workspaces Round 2): must match on name/friendly-default, NOT the raw id.
 */
export function filterMyWorkspaces(
  entries: MyWorkspaceEntry[],
  query: string
): MyWorkspaceEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter((e) => {
    // Resolved display name: user-given name takes priority, then friendly label
    const displayName = (e.name ?? e.label).toLowerCase();
    return displayName.includes(q);
  });
}

/**
 * Returns the resolved display name for an entry:
 * user-given `name` (if set), otherwise the friendly `label`.
 * This is what gets shown in the panel and matched by search.
 */
export function resolveEntryDisplayName(entry: MyWorkspaceEntry): string {
  return entry.name?.trim() || entry.label;
}

/**
 * Derive a human-readable FRIENDLY label for a workspace entry.
 *
 * FIX A-2 (My Workspaces Round 2): NEVER expose the raw secret id as the primary label.
 * Derivation order (per UX brief):
 *   (a) workspace name if non-empty (server-side optional name from the payload)
 *   (b) first row's utm_campaign if non-empty
 *   (c) base URL's domain/host if parseable
 *   (d) dated fallback "Workspace — Mon DD" using the given timestamp
 *
 * @param serverName - the workspace's optional server-side name (from payload.name)
 * @param id         - the workspace id (kept for backward compat but NEVER used as label)
 * @param utmCampaign - first row's utm_campaign value, if known
 * @param baseUrl     - first row's base URL, if known
 * @param timestamp   - Unix ms, used for the dated fallback (defaults to Date.now())
 */
export function deriveWorkspaceLabel(
  serverName: string | undefined,
  id: string,
  utmCampaign?: string,
  baseUrl?: string,
  timestamp?: number
): string {
  // (a) Server-given workspace name
  const name = (serverName ?? "").trim();
  if (name) return name;

  // (b) First row utm_campaign
  const campaign = (utmCampaign ?? "").trim();
  if (campaign) return campaign;

  // (c) Domain of the base URL
  if (baseUrl) {
    try {
      const url = new URL(baseUrl.trim());
      const host = url.hostname;
      if (host) return host;
    } catch {
      // URL unparseable — fall through
    }
  }

  // (d) Dated fallback "Workspace — Mon DD"
  const date = new Date(timestamp ?? Date.now());
  const monthShort = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  return `Workspace — ${monthShort} ${day}`;
}

/**
 * Rename a workspace entry by id (device-local only — NO server call).
 * Stores the user-given name in the entry's `name` field.
 * Trimmed; empty string clears the user name (reverts to friendly default).
 * Returns a new array (pure — no mutation).
 *
 * FIX A-1 (My Workspaces Round 2): inline rename, no server call.
 */
export function renameMyWorkspace(
  entries: MyWorkspaceEntry[],
  id: string,
  newName: string
): MyWorkspaceEntry[] {
  return entries.map((e) =>
    e.id === id
      ? { ...e, name: newName.trim() || undefined }
      : e
  );
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
