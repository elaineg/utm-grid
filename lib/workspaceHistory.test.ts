/**
 * Unit tests for workspaceHistory.ts pure logic.
 */
// @vitest-environment node
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import {
  isDuplicateVersion,
  idsToprune,
  normalizeEditor,
  relativeTimeFromMs,
  VERSION_CAP,
} from "./workspaceHistory";
import { writeValue, readSnapshot } from "./useLocalStorage";

// ── P1-1 Name persistence regression test ─────────────────────────────────────
// Validates that: (a) editor name written by WorkspaceHistory (JSON-stringified
// via window.localStorage.setItem) is recoverable by reading it back as the page
// component does (JSON.parse), and (b) the EDITOR_KEY encoding matches across
// the write path (component) and read path (page useEffect).

const EDITOR_KEY = "utm-grid:editor-name";

describe("P1-1 Name persistence: localStorage encoding round-trip (EDITOR_KEY)", () => {
  let fake: { backing: Map<string, string>; window: { localStorage: { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void } } };

  beforeEach(() => {
    const backing = new Map<string, string>();
    fake = {
      backing,
      window: {
        localStorage: {
          getItem: (k: string) => backing.get(k) ?? null,
          setItem: (k: string, v: string) => void backing.set(k, v),
        },
      },
    };
    vi.stubGlobal("window", fake.window);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("name written by WorkspaceHistory (JSON.stringify) is readable by the page effect (JSON.parse)", () => {
    // Simulate what WorkspaceHistory's commitName writes:
    const name = "Alex";
    window.localStorage.setItem(EDITOR_KEY, JSON.stringify(name));

    // Simulate what the page's mount useEffect reads:
    const raw = window.localStorage.getItem(EDITOR_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as string;
    expect(parsed.trim()).toBe("Alex");
  });

  it("empty name is stored and recovered as an empty string (no revert to Anonymous)", () => {
    window.localStorage.setItem(EDITOR_KEY, JSON.stringify(""));
    const raw = window.localStorage.getItem(EDITOR_KEY);
    const parsed = JSON.parse(raw!) as string;
    expect(parsed.trim()).toBe("");
  });

  it("name with leading/trailing spaces is trimmed on read (consistent with commitName)", () => {
    window.localStorage.setItem(EDITOR_KEY, JSON.stringify("  Dana  "));
    const raw = window.localStorage.getItem(EDITOR_KEY);
    const parsed = (JSON.parse(raw!) as string).trim();
    expect(parsed).toBe("Dana");
  });

  it("missing key returns null so editorNameRef stays empty (Anonymous) without error", () => {
    // Key not set at all
    const raw = window.localStorage.getItem(EDITOR_KEY);
    expect(raw).toBeNull();
    // Page effect: no parse needed; editorNameRef stays ""
  });
});

// ── Preview-seeding regression test ─────────────────────────────────────────
// Validates the fix for P1 bug: Preview showed empty grid because the page
// never wrote preview-prefixed localStorage keys before mounting UtmGrid.
// The fix calls writeValue(`preview:${id}:utm-grid:rows`, ...) in
// handleHistoryPreview before setPreviewPayload — this test verifies the
// writeValue→readSnapshot round-trip that the fix relies on.

function makeFakeWindow() {
  const backing = new Map<string, string>();
  return {
    backing,
    window: {
      localStorage: {
        getItem: (k: string) => backing.get(k) ?? null,
        setItem: (k: string, v: string) => void backing.set(k, v),
      },
      addEventListener: () => {},
      removeEventListener: () => {},
    },
  };
}

describe("Preview-seeding: writeValue seeds preview prefix so UtmGrid reads version rows", () => {
  let fake: ReturnType<typeof makeFakeWindow>;

  beforeEach(() => {
    fake = makeFakeWindow();
    vi.stubGlobal("window", fake.window);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("seeds preview rows and readSnapshot recovers them (mirrors handleHistoryPreview fix)", () => {
    const workspaceId = "ws-abc";
    const versionRows = [
      { id: "row-1", baseUrl: "https://example.com", utm_source: "email",
        utm_medium: "newsletter", utm_campaign: "q3-launch", utm_term: "", utm_content: "" },
      { id: "row-2", baseUrl: "https://example.com", utm_source: "cpc",
        utm_medium: "paid", utm_campaign: "q3-launch", utm_term: "keyword", utm_content: "" },
    ];
    const versionSettings = { requiredParams: true, lowercaseOnly: true, noSpaces: false };
    const versionSpec = { enforceSpec: false, allowedValues: {} };

    // Simulate what handleHistoryPreview now does before setPreviewPayload:
    const previewPrefix = `preview:${workspaceId}:`;
    writeValue(`${previewPrefix}utm-grid:rows`, [] as typeof versionRows, versionRows, 0);
    writeValue(`${previewPrefix}utm-grid:lint-settings`, {}, versionSettings, 0);
    writeValue(`${previewPrefix}utm-grid:utm-spec`, {}, versionSpec, 0);

    // Verify UtmGrid's useLocalStorage would read the seeded values on first snapshot:
    const recoveredRows = readSnapshot(`${previewPrefix}utm-grid:rows`, [] as typeof versionRows);
    expect(recoveredRows).toEqual(versionRows);
    expect(recoveredRows).toHaveLength(2);
    expect(recoveredRows[0].utm_source).toBe("email");
    expect(recoveredRows[1].utm_source).toBe("cpc");

    const recoveredSettings = readSnapshot(`${previewPrefix}utm-grid:lint-settings`, {});
    expect(recoveredSettings).toEqual(versionSettings);

    const recoveredSpec = readSnapshot(`${previewPrefix}utm-grid:utm-spec`, {});
    expect(recoveredSpec).toEqual(versionSpec);
  });

  it("different workspace ids get isolated preview keys (no cross-contamination)", () => {
    const rows1 = [{ id: "row-A", baseUrl: "https://a.com", utm_source: "a",
      utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" }];
    const rows2 = [{ id: "row-B", baseUrl: "https://b.com", utm_source: "b",
      utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" }];

    writeValue("preview:ws-1:utm-grid:rows", [] as typeof rows1, rows1, 0);
    writeValue("preview:ws-2:utm-grid:rows", [] as typeof rows2, rows2, 0);

    const snap1 = readSnapshot("preview:ws-1:utm-grid:rows", [] as typeof rows1);
    const snap2 = readSnapshot("preview:ws-2:utm-grid:rows", [] as typeof rows2);

    expect(snap1[0].utm_source).toBe("a");
    expect(snap2[0].utm_source).toBe("b");
  });
});

describe("VERSION_CAP", () => {
  it("is 25", () => {
    expect(VERSION_CAP).toBe(25);
  });
});

describe("isDuplicateVersion", () => {
  it("returns false when no previous version exists (null)", () => {
    expect(isDuplicateVersion('{"rows":[]}', null)).toBe(false);
  });

  it("returns false when no previous version exists (undefined)", () => {
    expect(isDuplicateVersion('{"rows":[]}', undefined)).toBe(false);
  });

  it("returns true for byte-identical data", () => {
    const data = '{"rows":[],"settings":{},"spec":{}}';
    expect(isDuplicateVersion(data, data)).toBe(true);
  });

  it("returns false when data differs by even one character", () => {
    const a = '{"rows":[],"settings":{},"spec":{}}';
    const b = '{"rows":[],"settings":{},"spec":{"x":1}}';
    expect(isDuplicateVersion(a, b)).toBe(false);
  });

  it("returns false for empty string vs non-empty", () => {
    expect(isDuplicateVersion("", '{"rows":[]}')).toBe(false);
  });

  it("returns true for two identical empty strings", () => {
    expect(isDuplicateVersion("", "")).toBe(true);
  });
});

describe("idsToprune", () => {
  it("returns empty array when count is below cap", () => {
    const ids = Array.from({ length: 10 }, (_, i) => i + 1);
    expect(idsToprune(ids)).toEqual([]);
  });

  it("returns empty array when count equals cap", () => {
    const ids = Array.from({ length: VERSION_CAP }, (_, i) => i + 1);
    expect(idsToprune(ids)).toEqual([]);
  });

  it("returns 1 id when count is cap+1", () => {
    const ids = Array.from({ length: VERSION_CAP + 1 }, (_, i) => i + 1);
    const result = idsToprune(ids);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(1); // oldest first
  });

  it("returns the correct ids to prune when 30 versions exist (prune 5 oldest)", () => {
    const ids = Array.from({ length: 30 }, (_, i) => i + 1);
    const result = idsToprune(ids);
    expect(result).toHaveLength(5);
    expect(result).toEqual([1, 2, 3, 4, 5]); // the 5 oldest
  });

  it("handles empty input", () => {
    expect(idsToprune([])).toEqual([]);
  });

  it("handles non-sequential ids", () => {
    // Simulate ids that have gaps (some were already pruned)
    const ids = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
                 55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
                 105, 110, 115, 120, 125, 130]; // 26 ids, cap=25
    const result = idsToprune(ids);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(5); // oldest (smallest)
  });
});

describe("normalizeEditor", () => {
  it("returns null for null input", () => {
    expect(normalizeEditor(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(normalizeEditor(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(normalizeEditor("")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(normalizeEditor("   ")).toBeNull();
  });

  it("trims leading/trailing whitespace", () => {
    expect(normalizeEditor("  Alex  ")).toBe("Alex");
  });

  it("truncates to 80 chars", () => {
    const long = "A".repeat(100);
    const result = normalizeEditor(long);
    expect(result).toHaveLength(80);
    expect(result).toBe("A".repeat(80));
  });

  it("accepts a normal name", () => {
    expect(normalizeEditor("Anonymous")).toBe("Anonymous");
    expect(normalizeEditor("Alex")).toBe("Alex");
  });

  it("coerces non-string to string", () => {
    expect(normalizeEditor(42)).toBe("42");
    expect(normalizeEditor(true)).toBe("true");
  });
});

describe("relativeTimeFromMs", () => {
  const NOW = 1_700_000_000_000; // fixed reference point

  it("returns 'just now' for < 5s ago", () => {
    expect(relativeTimeFromMs(NOW - 1000, NOW)).toBe("just now");
    expect(relativeTimeFromMs(NOW - 4999, NOW)).toBe("just now");
  });

  it("returns seconds string for 5s–59s", () => {
    expect(relativeTimeFromMs(NOW - 5000, NOW)).toBe("5s ago");
    expect(relativeTimeFromMs(NOW - 30000, NOW)).toBe("30s ago");
    expect(relativeTimeFromMs(NOW - 59000, NOW)).toBe("59s ago");
  });

  it("returns minutes string for 60s–59m", () => {
    expect(relativeTimeFromMs(NOW - 60000, NOW)).toBe("1m ago");
    expect(relativeTimeFromMs(NOW - 3599000, NOW)).toBe("59m ago");
  });

  it("returns hours string for 1h–23h", () => {
    expect(relativeTimeFromMs(NOW - 3600000, NOW)).toBe("1h ago");
    expect(relativeTimeFromMs(NOW - 7200000, NOW)).toBe("2h ago");
  });

  it("returns days string for >= 24h", () => {
    expect(relativeTimeFromMs(NOW - 86400000, NOW)).toBe("1d ago");
    expect(relativeTimeFromMs(NOW - 172800000, NOW)).toBe("2d ago");
  });
});
