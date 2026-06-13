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
