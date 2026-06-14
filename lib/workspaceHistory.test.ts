/**
 * Unit tests for workspaceHistory.ts pure logic.
 */
import { describe, it, expect } from "vitest";
import {
  isDuplicateVersion,
  idsToprune,
  normalizeEditor,
  relativeTimeFromMs,
  VERSION_CAP,
} from "./workspaceHistory";

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
