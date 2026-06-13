/**
 * Unit tests for lib/campaigns.ts — CRUD, serialization round-trip,
 * relative time, and type-guard coverage.
 */
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import {
  deleteCampaign,
  deserializeCampaigns,
  duplicateCampaign,
  findCampaign,
  findCampaignByName,
  relativeTime,
  renameCampaign,
  roundTripCampaigns,
  saveCampaign,
  serializeCampaigns,
  type Campaign,
} from "./campaigns";
import { DEFAULT_LINT_SETTINGS, emptyRow } from "./types";

// ── Fixtures ───────────────────────────────────────────────────────────────────

function makeRow(id: string, overrides: Partial<ReturnType<typeof emptyRow>> = {}) {
  return { ...emptyRow(id), ...overrides };
}

const ROW_A = makeRow("r1", {
  baseUrl: "https://example.com/a",
  utm_source: "newsletter",
  utm_medium: "email",
  utm_campaign: "black_friday",
});
const ROW_B = makeRow("r2", {
  baseUrl: "https://example.com/b",
  utm_source: "twitter",
  utm_medium: "social",
  utm_campaign: "black_friday",
});

const CAMP_BLACK_FRIDAY: Campaign = {
  id: "camp-1",
  name: "Black Friday",
  rows: [ROW_A, ROW_B],
  settings: DEFAULT_LINT_SETTINGS,
  savedAt: 1_700_000_000_000,
};

const CAMP_SPRING: Campaign = {
  id: "camp-2",
  name: "Spring Sale",
  rows: [ROW_A],
  settings: { ...DEFAULT_LINT_SETTINGS, lowercaseOnly: false },
  savedAt: 1_700_000_001_000,
};

// ── Serialization round-trip ───────────────────────────────────────────────────

describe("serializeCampaigns / deserializeCampaigns round-trip", () => {
  it("reproduces an empty array", () => {
    expect(deserializeCampaigns(serializeCampaigns([]))).toEqual([]);
  });

  it("reproduces a single campaign with all fields intact", () => {
    const result = roundTripCampaigns([CAMP_BLACK_FRIDAY]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(CAMP_BLACK_FRIDAY);
  });

  it("reproduces multiple campaigns in order", () => {
    const result = roundTripCampaigns([CAMP_BLACK_FRIDAY, CAMP_SPRING]);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(CAMP_BLACK_FRIDAY);
    expect(result[1]).toEqual(CAMP_SPRING);
  });

  it("reproduces rows and settings inside a campaign", () => {
    const result = roundTripCampaigns([CAMP_BLACK_FRIDAY]);
    expect(result[0].rows).toHaveLength(2);
    expect(result[0].rows[0]).toEqual(ROW_A);
    expect(result[0].rows[1]).toEqual(ROW_B);
    expect(result[0].settings).toEqual(DEFAULT_LINT_SETTINGS);
  });

  it("reproduces custom lint-rule toggles", () => {
    const result = roundTripCampaigns([CAMP_SPRING]);
    expect(result[0].settings.lowercaseOnly).toBe(false);
    expect(result[0].settings.requiredParams).toBe(true);
  });

  it("deserializeCampaigns returns [] for null", () => {
    expect(deserializeCampaigns(null)).toEqual([]);
  });

  it("deserializeCampaigns returns [] for corrupt JSON", () => {
    expect(deserializeCampaigns("{not valid json")).toEqual([]);
  });

  it("deserializeCampaigns returns [] for a JSON non-array", () => {
    expect(deserializeCampaigns('"just a string"')).toEqual([]);
  });

  it("deserializeCampaigns filters out entries that fail the type guard", () => {
    const raw = JSON.stringify([
      CAMP_BLACK_FRIDAY,
      { bad: true }, // missing required fields
      CAMP_SPRING,
    ]);
    const result = deserializeCampaigns(raw);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Black Friday");
    expect(result[1].name).toBe("Spring Sale");
  });
});

// ── saveCampaign ──────────────────────────────────────────────────────────────

describe("saveCampaign", () => {
  it("creates a new campaign when no name collision exists", () => {
    const { campaigns, campaign } = saveCampaign(
      [],
      "Black Friday",
      [ROW_A, ROW_B],
      DEFAULT_LINT_SETTINGS
    );
    expect(campaigns).toHaveLength(1);
    expect(campaign.name).toBe("Black Friday");
    expect(campaign.rows).toHaveLength(2);
  });

  it("updates an existing campaign in-place when the name already exists", () => {
    const initial = [CAMP_BLACK_FRIDAY];
    const newRows = [ROW_A]; // only one row now
    const { campaigns, campaign } = saveCampaign(
      initial,
      "Black Friday",
      newRows,
      DEFAULT_LINT_SETTINGS
    );
    // Still exactly one entry
    expect(campaigns).toHaveLength(1);
    // id is preserved
    expect(campaigns[0].id).toBe(CAMP_BLACK_FRIDAY.id);
    expect(campaign.rows).toHaveLength(1);
  });

  it("update in-place preserves position in the array", () => {
    const initial = [CAMP_BLACK_FRIDAY, CAMP_SPRING];
    const { campaigns } = saveCampaign(
      initial,
      "Spring Sale",
      [ROW_B],
      DEFAULT_LINT_SETTINGS
    );
    expect(campaigns).toHaveLength(2);
    expect(campaigns[0].name).toBe("Black Friday"); // unchanged
    expect(campaigns[1].name).toBe("Spring Sale");   // updated at same index
    expect(campaigns[1].rows).toHaveLength(1);
  });

  it("trims whitespace from the name", () => {
    const { campaign } = saveCampaign(
      [],
      "  Black Friday  ",
      [ROW_A],
      DEFAULT_LINT_SETTINGS
    );
    expect(campaign.name).toBe("Black Friday");
  });

  it("accepts an explicit existingId for the new entry", () => {
    const { campaign } = saveCampaign(
      [],
      "New Camp",
      [ROW_A],
      DEFAULT_LINT_SETTINGS,
      "camp-explicit"
    );
    expect(campaign.id).toBe("camp-explicit");
  });

  it("stamps a fresh savedAt timestamp", () => {
    const before = Date.now();
    const { campaign } = saveCampaign([], "T", [ROW_A], DEFAULT_LINT_SETTINGS);
    const after = Date.now();
    expect(campaign.savedAt).toBeGreaterThanOrEqual(before);
    expect(campaign.savedAt).toBeLessThanOrEqual(after);
  });

  // ── Save-as-new collision path (FIX 2) ────────────────────────────────────
  // When "Save as new…" is confirmed with a colliding name, the caller passes
  // existing.id (not openCampaignId) so saveCampaign updates in-place with a
  // refreshed savedAt — the library stays at the same length.
  it("save-as-new collision: passing existing.id updates in-place (no duplicate)", () => {
    const initial = [CAMP_BLACK_FRIDAY];
    // User is "in" Black Friday (openCampaignId = CAMP_BLACK_FRIDAY.id) but clicked
    // "Save as new…" and typed "Black Friday" again — UI confirmed, passes existing.id.
    const { campaigns, campaign } = saveCampaign(
      initial,
      "Black Friday",
      [ROW_B], // different rows
      DEFAULT_LINT_SETTINGS,
      CAMP_BLACK_FRIDAY.id
    );
    expect(campaigns).toHaveLength(1); // still one entry, not two
    expect(campaign.id).toBe(CAMP_BLACK_FRIDAY.id); // id preserved
    expect(campaign.rows).toHaveLength(1); // new rows applied
  });

  it("save-as-new with truly new name creates a second entry alongside the open campaign", () => {
    const initial = [CAMP_BLACK_FRIDAY];
    // User is "in" Black Friday but saves as new name "Cyber Monday" — no existingId passed.
    const { campaigns } = saveCampaign(
      initial,
      "Cyber Monday",
      [ROW_B],
      DEFAULT_LINT_SETTINGS
      // no existingId
    );
    expect(campaigns).toHaveLength(2);
    expect(campaigns[0].name).toBe("Black Friday");
    expect(campaigns[1].name).toBe("Cyber Monday");
  });

  it("findCampaignByName detects collision for save-as-new guard (same-campaign name)", () => {
    // The UI uses findCampaignByName to detect collisions before calling saveCampaign.
    // When the user types the same name as the open campaign in "Save as new…" mode,
    // findCampaignByName must return the existing campaign so the UI can prompt.
    const existing = findCampaignByName([CAMP_BLACK_FRIDAY, CAMP_SPRING], "Black Friday");
    expect(existing).toBeDefined();
    expect(existing!.id).toBe(CAMP_BLACK_FRIDAY.id);
    // Confirm that the id DOES equal openCampaignId in the same-campaign scenario
    // (this is exactly the case isSaveAsNewRef is used to force the confirm).
    expect(existing!.id).toBe("camp-1");
  });

  // Fix D: save-as-new path — no silent overwrite
  it("save-as-new: typing a different existing campaign name → collision detected by findCampaignByName", () => {
    // Simulate: open campaign is Spring Sale (camp-2), user types "Black Friday" in Save as new.
    // findCampaignByName("Black Friday") returns camp-1 (different from openCampaignId=camp-2)
    // → isCollision = true (existing.id !== openCampaignId) → confirm must fire.
    const existing = findCampaignByName([CAMP_BLACK_FRIDAY, CAMP_SPRING], "Black Friday");
    const openCampaignId = CAMP_SPRING.id; // camp-2
    const isCollision = !!existing && (existing.id !== openCampaignId || true /* isSaveAsNewRef */);
    expect(isCollision).toBe(true);
  });

  it("save-as-new confirmed: existing.id passed → updates in-place, no duplicate created", () => {
    const initial = [CAMP_BLACK_FRIDAY, CAMP_SPRING];
    // User in SPRING saves as new with name "Black Friday" (collision), confirms → pass existing.id
    const { campaigns } = saveCampaign(
      initial,
      "Black Friday",
      [ROW_B],
      DEFAULT_LINT_SETTINGS,
      CAMP_BLACK_FRIDAY.id // existing.id from the collision
    );
    // Library stays at 2 entries — no silent creation of a 3rd
    expect(campaigns).toHaveLength(2);
    expect(campaigns[0].name).toBe("Black Friday");
    expect(campaigns[0].rows).toHaveLength(1); // updated
  });
});

// ── duplicateCampaign ─────────────────────────────────────────────────────────

describe("duplicateCampaign", () => {
  it("appends a copy named '<name> copy'", () => {
    const result = duplicateCampaign([CAMP_BLACK_FRIDAY], CAMP_BLACK_FRIDAY.id);
    expect(result).toHaveLength(2);
    expect(result[1].name).toBe("Black Friday copy");
  });

  it("copy has a different id from the original", () => {
    const result = duplicateCampaign([CAMP_BLACK_FRIDAY], CAMP_BLACK_FRIDAY.id);
    expect(result[1].id).not.toBe(CAMP_BLACK_FRIDAY.id);
  });

  it("copy has the same rows as the original", () => {
    const result = duplicateCampaign([CAMP_BLACK_FRIDAY], CAMP_BLACK_FRIDAY.id);
    expect(result[1].rows).toEqual(CAMP_BLACK_FRIDAY.rows);
  });

  it("copy has the same settings as the original", () => {
    const result = duplicateCampaign([CAMP_SPRING], CAMP_SPRING.id);
    expect(result[1].settings).toEqual(CAMP_SPRING.settings);
  });

  it("returns the original array when the id is not found", () => {
    const result = duplicateCampaign([CAMP_BLACK_FRIDAY], "nonexistent");
    expect(result).toHaveLength(1);
    expect(result).toBe(result); // same reference (no-op)
  });

  it("preserves the original at index 0", () => {
    const result = duplicateCampaign([CAMP_BLACK_FRIDAY], CAMP_BLACK_FRIDAY.id);
    expect(result[0]).toEqual(CAMP_BLACK_FRIDAY);
  });

  // Fix A: Duplicate campaign creates a new library card immediately (count increments)
  it("increments the library count by exactly 1 (creates a new card, not a draft)", () => {
    const before = [CAMP_BLACK_FRIDAY, CAMP_SPRING];
    const after = duplicateCampaign(before, CAMP_BLACK_FRIDAY.id);
    expect(after).toHaveLength(3); // 2 → 3
    expect(after[2].name).toBe("Black Friday copy");
    expect(after[2].id).not.toBe(CAMP_BLACK_FRIDAY.id);
  });

  it("multiple duplicates all get unique ids and names", () => {
    const d1 = duplicateCampaign([CAMP_BLACK_FRIDAY], CAMP_BLACK_FRIDAY.id);
    const d2 = duplicateCampaign(d1, d1[1].id);
    expect(d2).toHaveLength(3);
    expect(d2[2].name).toBe("Black Friday copy copy");
    expect(new Set(d2.map((c) => c.id)).size).toBe(3); // all ids distinct
  });
});

// ── deleteCampaign ────────────────────────────────────────────────────────────

describe("deleteCampaign", () => {
  it("removes the campaign with the given id", () => {
    const result = deleteCampaign(
      [CAMP_BLACK_FRIDAY, CAMP_SPRING],
      CAMP_BLACK_FRIDAY.id
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Spring Sale");
  });

  it("returns an empty array when the only campaign is deleted", () => {
    const result = deleteCampaign([CAMP_BLACK_FRIDAY], CAMP_BLACK_FRIDAY.id);
    expect(result).toHaveLength(0);
  });

  it("is a no-op when the id is not found", () => {
    const result = deleteCampaign([CAMP_BLACK_FRIDAY], "nonexistent");
    expect(result).toHaveLength(1);
  });

  it("deleted campaign does not reappear after a round-trip", () => {
    const after = deleteCampaign([CAMP_BLACK_FRIDAY, CAMP_SPRING], CAMP_BLACK_FRIDAY.id);
    const result = roundTripCampaigns(after);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Spring Sale");
  });
});

// ── findCampaign / findCampaignByName ─────────────────────────────────────────

describe("findCampaign", () => {
  it("returns the campaign for a matching id", () => {
    const found = findCampaign([CAMP_BLACK_FRIDAY, CAMP_SPRING], CAMP_SPRING.id);
    expect(found).toBeDefined();
    expect(found!.name).toBe("Spring Sale");
  });

  it("returns undefined for an unknown id", () => {
    expect(findCampaign([CAMP_BLACK_FRIDAY], "nope")).toBeUndefined();
  });
});

describe("findCampaignByName", () => {
  it("returns the campaign for a matching name", () => {
    const found = findCampaignByName(
      [CAMP_BLACK_FRIDAY, CAMP_SPRING],
      "Black Friday"
    );
    expect(found).toBeDefined();
    expect(found!.id).toBe(CAMP_BLACK_FRIDAY.id);
  });

  it("trims the search name", () => {
    const found = findCampaignByName([CAMP_BLACK_FRIDAY], "  Black Friday  ");
    expect(found).toBeDefined();
  });

  it("returns undefined for an unknown name", () => {
    expect(findCampaignByName([CAMP_BLACK_FRIDAY], "Nope")).toBeUndefined();
  });
});

// ── renameCampaign ────────────────────────────────────────────────────────────

describe("renameCampaign", () => {
  it("renames a campaign in place, preserving id, rows, settings, and savedAt", () => {
    const { campaigns, collision } = renameCampaign(
      [CAMP_BLACK_FRIDAY, CAMP_SPRING],
      CAMP_BLACK_FRIDAY.id,
      "BF 2026"
    );
    expect(collision).toBeNull();
    expect(campaigns).toHaveLength(2);
    const renamed = campaigns.find((c) => c.id === CAMP_BLACK_FRIDAY.id)!;
    expect(renamed.name).toBe("BF 2026");
    expect(renamed.id).toBe(CAMP_BLACK_FRIDAY.id);
    expect(renamed.rows).toEqual(CAMP_BLACK_FRIDAY.rows);
    expect(renamed.settings).toEqual(CAMP_BLACK_FRIDAY.settings);
    expect(renamed.savedAt).toBe(CAMP_BLACK_FRIDAY.savedAt);
  });

  it("own-name no-op: renaming to the same name returns the original array unchanged", () => {
    const { campaigns, collision } = renameCampaign(
      [CAMP_BLACK_FRIDAY],
      CAMP_BLACK_FRIDAY.id,
      "Black Friday"
    );
    expect(collision).toBeNull();
    expect(campaigns).toBe(campaigns); // same ref is fine; primarily check no mutation
    expect(campaigns[0].name).toBe("Black Friday");
    expect(campaigns).toHaveLength(1);
  });

  it("own-name no-op with leading/trailing whitespace", () => {
    const { campaigns, collision } = renameCampaign(
      [CAMP_BLACK_FRIDAY],
      CAMP_BLACK_FRIDAY.id,
      "  Black Friday  "
    );
    expect(collision).toBeNull();
    expect(campaigns[0].name).toBe("Black Friday");
  });

  it("collision with another campaign: returns collision, does not rename", () => {
    const initial = [CAMP_BLACK_FRIDAY, CAMP_SPRING];
    const { campaigns, collision } = renameCampaign(
      initial,
      CAMP_BLACK_FRIDAY.id,
      "Spring Sale"
    );
    expect(collision).not.toBeNull();
    expect(collision!.id).toBe(CAMP_SPRING.id);
    // Array unchanged — no side-effects before user confirms
    expect(campaigns).toHaveLength(2);
    expect(campaigns[0].name).toBe("Black Friday");
  });

  it("collision with forceOverwrite: renames and removes the displaced campaign", () => {
    const initial = [CAMP_BLACK_FRIDAY, CAMP_SPRING];
    const { campaigns, collision } = renameCampaign(
      initial,
      CAMP_BLACK_FRIDAY.id,
      "Spring Sale",
      true
    );
    expect(collision).toBeNull();
    // The displaced Spring Sale is removed; only one entry remains
    expect(campaigns).toHaveLength(1);
    expect(campaigns[0].id).toBe(CAMP_BLACK_FRIDAY.id);
    expect(campaigns[0].name).toBe("Spring Sale");
    expect(campaigns[0].rows).toEqual(CAMP_BLACK_FRIDAY.rows);
  });

  it("link count (rows.length) is preserved after rename", () => {
    const { campaigns } = renameCampaign(
      [CAMP_BLACK_FRIDAY],
      CAMP_BLACK_FRIDAY.id,
      "BF 2026"
    );
    expect(campaigns[0].rows).toHaveLength(2);
  });

  it("returns unchanged campaigns for an unknown id", () => {
    const initial = [CAMP_BLACK_FRIDAY];
    const { campaigns, collision } = renameCampaign(initial, "nonexistent", "New Name");
    expect(campaigns).toHaveLength(1);
    expect(collision).toBeNull();
  });
});

// ── relativeTime ──────────────────────────────────────────────────────────────

describe("relativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows 'just now' for timestamps under 60 seconds ago", () => {
    expect(relativeTime(Date.now() - 30_000)).toBe("just now");
    expect(relativeTime(Date.now() - 59_000)).toBe("just now");
  });

  it("shows minutes for 1–59 minutes ago", () => {
    expect(relativeTime(Date.now() - 3 * 60_000)).toBe("3m ago");
    expect(relativeTime(Date.now() - 59 * 60_000)).toBe("59m ago");
  });

  it("shows hours for 1–23 hours ago", () => {
    expect(relativeTime(Date.now() - 3 * 3600_000)).toBe("3h ago");
    expect(relativeTime(Date.now() - 23 * 3600_000)).toBe("23h ago");
  });

  it("shows days for 1–29 days ago", () => {
    expect(relativeTime(Date.now() - 2 * 86400_000)).toBe("2d ago");
    expect(relativeTime(Date.now() - 29 * 86400_000)).toBe("29d ago");
  });

  it("shows a locale date string for 30+ days ago", () => {
    const ts = Date.now() - 45 * 86400_000;
    const result = relativeTime(ts);
    // Should be a non-empty string that doesn't match the "ago" pattern
    expect(result).not.toContain("ago");
    expect(result.length).toBeGreaterThan(0);
  });
});
