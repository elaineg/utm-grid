/**
 * Campaigns library — pure, client-side, no network.
 * A Campaign is a named snapshot of the entire grid: every row + active lint
 * rule toggles. Saved in localStorage. Identical serialization shape as
 * SharePayload so we can reuse the same JSON structure.
 */
import type { LintSettings, UtmRow } from "./types";

export interface Campaign {
  /** Stable nanoid-style key (not the display name). */
  id: string;
  name: string;
  rows: UtmRow[];
  settings: LintSettings;
  savedAt: number; // Unix ms timestamp
}

// ── Serialization ──────────────────────────────────────────────────────────────

/** Serialize the full campaigns library to a JSON string for localStorage. */
export function serializeCampaigns(campaigns: Campaign[]): string {
  return JSON.stringify(campaigns);
}

/** Deserialize from localStorage JSON. Returns [] on any error. */
export function deserializeCampaigns(raw: string | null): Campaign[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCampaign);
  } catch {
    return [];
  }
}

/** Full round-trip: serialize then deserialize — result must be identical. */
export function roundTripCampaigns(campaigns: Campaign[]): Campaign[] {
  return deserializeCampaigns(serializeCampaigns(campaigns));
}

// ── CRUD helpers (pure — take/return new arrays, no mutation) ──────────────────

/** Generate a lightweight unique id. */
export function newCampaignId(): string {
  return `camp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Save (create or update) a campaign by name.
 * If a campaign with the same name exists it is replaced in-place (same index).
 * Returns the new campaigns array and the saved campaign object.
 */
export function saveCampaign(
  campaigns: Campaign[],
  name: string,
  rows: UtmRow[],
  settings: LintSettings,
  existingId?: string
): { campaigns: Campaign[]; campaign: Campaign } {
  const trimmed = name.trim();
  const idx = campaigns.findIndex((c) => c.name === trimmed);
  const campaign: Campaign = {
    id: existingId ?? (idx >= 0 ? campaigns[idx].id : newCampaignId()),
    name: trimmed,
    rows,
    settings,
    savedAt: Date.now(),
  };
  if (idx >= 0) {
    // Update in-place at the same position
    const next = [...campaigns];
    next[idx] = campaign;
    return { campaigns: next, campaign };
  }
  return { campaigns: [...campaigns, campaign], campaign };
}

/** Duplicate a campaign: creates a new entry named "<name> copy". */
export function duplicateCampaign(
  campaigns: Campaign[],
  id: string
): Campaign[] {
  const original = campaigns.find((c) => c.id === id);
  if (!original) return campaigns;
  const copy: Campaign = {
    ...original,
    id: newCampaignId(),
    name: `${original.name} copy`,
    savedAt: Date.now(),
  };
  return [...campaigns, copy];
}

/** Delete a campaign by id. */
export function deleteCampaign(campaigns: Campaign[], id: string): Campaign[] {
  return campaigns.filter((c) => c.id !== id);
}

/**
 * Rename a campaign by id.
 * - If the new name is the same as the current name (after trim), returns the
 *   original array unchanged (own-name no-op).
 * - If the new name collides with a DIFFERENT campaign's name, returns
 *   `{ campaigns: <array-with-target-replaced>, collision: <that-campaign> }`
 *   so the caller can surface a confirm-overwrite dialog before committing.
 *   The caller must call renameCampaign again with `forceOverwrite: true` on confirm.
 * - Otherwise renames in place: same id, same rows, same settings, same savedAt.
 */
export function renameCampaign(
  campaigns: Campaign[],
  id: string,
  newName: string,
  forceOverwrite?: boolean
): { campaigns: Campaign[]; collision: Campaign | null } {
  const trimmed = newName.trim();
  const idx = campaigns.findIndex((c) => c.id === id);
  if (idx < 0) return { campaigns, collision: null };

  const current = campaigns[idx];
  // Own-name no-op
  if (current.name === trimmed) return { campaigns, collision: null };

  // Collision with a different campaign
  const collisionIdx = campaigns.findIndex(
    (c) => c.id !== id && c.name === trimmed
  );
  if (collisionIdx >= 0 && !forceOverwrite) {
    return { campaigns, collision: campaigns[collisionIdx] };
  }

  // Apply rename: keep everything except name, remove collision target if overwriting
  const renamed: Campaign = { ...current, name: trimmed };
  let next = [...campaigns];
  next[idx] = renamed;
  if (collisionIdx >= 0) {
    // Remove the displaced campaign (overwrite confirmed)
    next = next.filter((_, i) => i !== collisionIdx);
  }
  return { campaigns: next, collision: null };
}

/** Find a campaign by id. */
export function findCampaign(
  campaigns: Campaign[],
  id: string
): Campaign | undefined {
  return campaigns.find((c) => c.id === id);
}

/** Find a campaign by exact name (case-sensitive). */
export function findCampaignByName(
  campaigns: Campaign[],
  name: string
): Campaign | undefined {
  return campaigns.find((c) => c.name === name.trim());
}

// ── Relative time ──────────────────────────────────────────────────────────────

/** Format a Unix ms timestamp as a human relative string: "just now", "3h ago", "2d ago", date. */
export function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ms).toLocaleDateString();
}

// ── Type guard ─────────────────────────────────────────────────────────────────

function isCampaign(v: unknown): v is Campaign {
  if (!v || typeof v !== "object") return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.name === "string" &&
    Array.isArray(c.rows) &&
    typeof c.settings === "object" &&
    c.settings !== null &&
    typeof c.savedAt === "number"
  );
}
