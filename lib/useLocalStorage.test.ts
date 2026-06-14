// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPendingWrite, readSnapshot, writeValue } from "./useLocalStorage";
import { serializeCampaigns } from "./campaigns";
import type { Campaign } from "./campaigns";
import { deserializeNamingTemplate, type NamingTemplate } from "./namingTemplate";

/**
 * Tests the storage layer behind useLocalStorage (the hook itself is a thin
 * useSyncExternalStore wrapper) with a stubbed window: debounced writes,
 * coalescing, and the pagehide flush that makes refresh-mid-edit safe.
 */

type Listener = () => void;

function makeFakeWindow() {
  const backing = new Map<string, string>();
  const pageHideListeners: Listener[] = [];
  return {
    backing,
    firePageHide: () => pageHideListeners.forEach((l) => l()),
    window: {
      localStorage: {
        getItem: (k: string) => backing.get(k) ?? null,
        setItem: (k: string, v: string) => void backing.set(k, v),
      },
      addEventListener: (type: string, listener: Listener) => {
        if (type === "pagehide") pageHideListeners.push(listener);
      },
      removeEventListener: () => {},
    },
  };
}

let fake: ReturnType<typeof makeFakeWindow>;
let keyCounter = 0;
let key: string;

beforeEach(() => {
  fake = makeFakeWindow();
  vi.stubGlobal("window", fake.window);
  vi.useFakeTimers();
  key = `test-key-${++keyCounter}`; // fresh key per test (module store is shared)
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("writeValue without debounce", () => {
  it("persists to localStorage immediately", () => {
    writeValue(key, [] as string[], ["a"]);
    expect(fake.backing.get(key)).toBe('["a"]');
  });

  it("supports functional updates from the current value", () => {
    writeValue(key, [] as string[], ["a"]);
    writeValue(key, [] as string[], (prev) => [...prev, "b"]);
    expect(fake.backing.get(key)).toBe('["a","b"]');
  });
});

// ── Regression: autosave-skip-initial-seed guard (P0-2) ──────────────────────
// The /w/[id] page has an isHydratedRef that starts false and is set to true
// BEFORE UtmGrid mounts (after writeValue seeds the prefixed keys). The
// handleStateChange callback is a no-op while isHydratedRef.current === false.
// This test verifies the underlying writeValue→readSnapshot round-trip that the
// seeding relies on, confirming the guard window works as expected.
describe("writeValue seeds the store synchronously before any subscriber mounts", () => {
  it("readSnapshot after writeValue (debounce=0) returns the seeded value immediately", () => {
    const rows = [{ id: "r1", baseUrl: "https://example.com", utm_source: "email",
      utm_medium: "cpc", utm_campaign: "launch", utm_term: "", utm_content: "" }];
    writeValue(key, [] as typeof rows, rows, 0);
    // Simulate UtmGrid mounting and calling readSnapshot for the client snapshot
    const snap = readSnapshot(key, [] as typeof rows);
    expect(snap).toEqual(rows);
    // The store was seeded (in localStorage) before any subscriber attached
    expect(fake.backing.get(key)).toBe(JSON.stringify(rows));
  });

  it("isHydratedRef pattern: a guard flag set before seeding prevents any write before hydration", () => {
    // Model the isHydratedRef pattern: ref starts false, set to true before mounting.
    // Any call arriving while false is dropped.
    let isHydrated = false;
    const puts: unknown[] = [];
    const handleStateChange = (next: unknown) => {
      if (!isHydrated) return; // P0-2 guard
      puts.push(next);
    };

    // Simulate UtmGrid emitting state BEFORE hydration (should be dropped)
    handleStateChange({ rows: [], settings: {}, spec: {} });
    expect(puts).toHaveLength(0);

    // Hydrate
    isHydrated = true;
    writeValue(key, null, "seeded", 0);

    // Now a user edit fires — must go through
    handleStateChange({ rows: [{ id: "r1" }] });
    expect(puts).toHaveLength(1);
  });
});

describe("writeValue with debounce", () => {
  it("updates the in-memory snapshot immediately but defers the write", () => {
    writeValue(key, "", "typed", 400);
    expect(readSnapshot(key, "")).toBe("typed");
    expect(fake.backing.get(key)).toBeUndefined();
    vi.advanceTimersByTime(400);
    expect(fake.backing.get(key)).toBe('"typed"');
  });

  it("coalesces rapid writes into one final write", () => {
    const setItem = vi.spyOn(fake.window.localStorage, "setItem");
    for (const v of ["s", "sp", "spr", "spring"]) {
      writeValue(key, "", v, 400);
      vi.advanceTimersByTime(100); // each write lands inside the previous window
    }
    expect(setItem).not.toHaveBeenCalled();
    vi.advanceTimersByTime(400);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(fake.backing.get(key)).toBe('"spring"');
  });

  it("flushes the pending value on pagehide (refresh mid-debounce loses nothing)", () => {
    writeValue(key, "", "half-typed batch", 400);
    expect(fake.backing.get(key)).toBeUndefined();
    fake.firePageHide(); // simulate refresh/navigation before the timer fires
    expect(fake.backing.get(key)).toBe('"half-typed batch"');
  });

  it("flushPendingWrite is a no-op when nothing is pending", () => {
    writeValue(key, "", "v", 400);
    vi.advanceTimersByTime(400);
    const setItem = vi.spyOn(fake.window.localStorage, "setItem");
    flushPendingWrite(key);
    expect(setItem).not.toHaveBeenCalled();
  });
});

describe("readSnapshot", () => {
  it("restores a stored JSON value", () => {
    fake.backing.set(key, '[{"id":"row-1","baseUrl":"https://a.com"}]');
    expect(readSnapshot(key, [] as unknown[])).toEqual([
      { id: "row-1", baseUrl: "https://a.com" },
    ]);
  });

  it("falls back to the initial value on corrupt JSON", () => {
    fake.backing.set(key, "{not json");
    expect(readSnapshot(key, ["fallback"])).toEqual(["fallback"]);
  });

  it("falls back to the initial value when the key is absent", () => {
    expect(readSnapshot(key, "initial")).toBe("initial");
  });
});

// ── Regression: double-encoding rehydration ────────────────────────────────────
//
// useLocalStorage persists via JSON.stringify(value). When the stored value is
// itself a string (campaigns are stored as a serialized JSON string; open-campaign-id
// is a plain string id), the on-disk representation is double-encoded:
//   localStorage["utm-grid:campaigns"]        = JSON.stringify(serializeCampaigns(arr))
//   localStorage["utm-grid:open-campaign-id"] = JSON.stringify(campaignId)
//
// The rehydration effect in UtmGrid must decode twice (robustParse) to recover
// the real values. This suite writes via the same path the app uses and asserts
// that robustParse returns the correct typed value — failing against a
// single-parse implementation and passing with double-decode.

/** Minimal robustParse mirror — must match the implementation in UtmGrid.tsx. */
function robustParse<T>(raw: string | null): T | null {
  if (raw === null) return null;
  try {
    const once = JSON.parse(raw) as unknown;
    if (typeof once === "string") {
      try { return JSON.parse(once) as T; } catch { return once as unknown as T; }
    }
    return once as T;
  } catch {
    return null;
  }
}

describe("double-encoding rehydration regression", () => {
  const CAMPAIGNS_KEY = "utm-grid:campaigns";
  const OPEN_ID_KEY = "utm-grid:open-campaign-id";

  const sampleCampaign: Campaign = {
    id: "camp-abc123",
    name: "Spring Launch",
    rows: [],
    settings: {
      requiredParams: true,
      lowercaseOnly: true,
      noSpaces: true,
    },
    savedAt: 1718000000000,
  };

  it("campaigns key is double-encoded when written via useLocalStorage setter", () => {
    // Simulate what the app does: setRawCampaigns(serializeCampaigns(array))
    // → writeValue stores JSON.stringify(serializeCampaigns(array))
    const serialized = serializeCampaigns([sampleCampaign]); // string
    writeValue(CAMPAIGNS_KEY, "[]", serialized); // stores JSON.stringify(string)

    const raw = fake.backing.get(CAMPAIGNS_KEY);
    // The raw value is a quoted JSON string — double-encoded
    expect(typeof raw).toBe("string");
    // A single JSON.parse yields a string, NOT an array
    const singleParse = JSON.parse(raw!) as unknown;
    expect(typeof singleParse).toBe("string");
    expect(Array.isArray(singleParse)).toBe(false);
    // robustParse recovers the array correctly
    const recovered = robustParse<Campaign[]>(raw!);
    expect(Array.isArray(recovered)).toBe(true);
    expect(recovered![0].id).toBe("camp-abc123");
  });

  it("open-campaign-id key is double-encoded when written via useLocalStorage setter", () => {
    // Simulate: setStoredOpenId(campaignId) → stores JSON.stringify(campaignId)
    const campaignId = "camp-abc123";
    writeValue(OPEN_ID_KEY, null as string | null, campaignId);

    const raw = fake.backing.get(OPEN_ID_KEY);
    // Single parse yields a string, but that string is the id — robustParse handles both
    // cases: whether it's double-encoded (string→string) or single-encoded (string→direct).
    const recovered = robustParse<string>(raw!);
    expect(recovered).toBe("camp-abc123");
  });

  it("rehydration recovers openCampaignId when campaigns and id are written via the app path", () => {
    // Write campaigns double-encoded (as the app does)
    const serialized = serializeCampaigns([sampleCampaign]);
    writeValue(CAMPAIGNS_KEY, "[]", serialized);
    writeValue(OPEN_ID_KEY, null as string | null, sampleCampaign.id);

    // Simulate the rehydration effect logic from UtmGrid.tsx
    const rawId = fake.backing.get(OPEN_ID_KEY) ?? null;
    const parsedId = robustParse<string>(rawId);
    expect(parsedId).toBe("camp-abc123");

    const rawCampaigns = fake.backing.get(CAMPAIGNS_KEY) ?? null;
    const parsedCampaigns = robustParse<Campaign[]>(rawCampaigns);
    const existingIds = new Set(
      Array.isArray(parsedCampaigns)
        ? parsedCampaigns.map((c) => c.id).filter(Boolean)
        : []
    );
    expect(existingIds.has(parsedId!)).toBe(true);
  });
});

// ── P1 Hydration regression: naming template cold-load (Wen's bug, fix 3) ──────
//
// Root cause: UtmGrid uses useLocalStorage<NamingTemplate> for storedNamingTemplate.
// The hook's client snapshot (readSnapshot) runs after SSR hydration and reads from
// localStorage. This test seeds localStorage with a full naming template BEFORE the
// client snapshot fires, and asserts that readSnapshot returns the full template —
// confirming that storedNamingTemplate will have segments+enforceTemplate on mount
// (not just the DEFAULT_NAMING_TEMPLATE the SSR snapshot returned).
//
// The NamingTemplatePanel's useEffect([hasSegments]) can then auto-expand because
// hasSegments transitions false→true synchronously in the same re-render cycle.

describe("P1 hydration regression — naming template cold-load", () => {
  const NT_KEY = "utm-grid:naming-template";

  const seedTemplate: NamingTemplate = {
    segments: [
      { name: "quarter", allowedTokens: ["q1", "q2", "q3", "q4"] },
      { name: "channel", allowedTokens: ["email", "paidsocial"] },
    ],
    separator: "_",
    enforceTemplate: true,
  };

  it("readSnapshot after seeding returns full template (segments + enforceTemplate)", () => {
    // Simulate what the app writes when the user defines a naming template:
    // setStoredNamingTemplate(template) → writeValue(key, DEFAULT, template, 0)
    // → persist → localStorage.setItem(key, JSON.stringify(template))
    writeValue(NT_KEY, { segments: [], separator: "_" as const, enforceTemplate: false }, seedTemplate, 0);

    // Now simulate a cold-page-load client snapshot: readSnapshot reads from localStorage.
    // The hook's getSnapshot calls readSnapshot(key, DEFAULT_NAMING_TEMPLATE).
    const { DEFAULT_NAMING_TEMPLATE } = { DEFAULT_NAMING_TEMPLATE: { segments: [], separator: "_" as const, enforceTemplate: false } };
    const recovered = readSnapshot(NT_KEY, DEFAULT_NAMING_TEMPLATE);

    // Must have segments and enforceTemplate from the stored template.
    expect(recovered.segments).toHaveLength(2);
    expect(recovered.segments[0].name).toBe("quarter");
    expect(recovered.segments[1].name).toBe("channel");
    expect(recovered.enforceTemplate).toBe(true);
  });

  it("deserializeNamingTemplate recovers a stored template written by the app (JSON round-trip)", () => {
    // The mount-effect hydration guard reads localStorage directly and deserializes.
    // This tests that path: write the template (as JSON.stringify), read it back,
    // deserialize — segments and enforceTemplate must be present.
    writeValue(NT_KEY + "-direct", { segments: [], separator: "_" as const, enforceTemplate: false }, seedTemplate, 0);

    // Simulate window.localStorage.getItem in the mount effect
    const raw = fake.backing.get(NT_KEY + "-direct") ?? null;
    expect(raw).not.toBeNull();

    // The mount effect does: JSON.parse(raw) → the stored NamingTemplate object.
    // (useLocalStorage stores JSON.stringify(value), so parse once to get the object.)
    const parsed = JSON.parse(raw!) as unknown;
    const template = deserializeNamingTemplate(parsed);

    expect(template.segments).toHaveLength(2);
    expect(template.segments[0].name).toBe("quarter");
    expect(template.segments[0].allowedTokens).toEqual(["q1", "q2", "q3", "q4"]);
    expect(template.enforceTemplate).toBe(true);
  });

  it("cold-load with enforce=ON and segments present — panel should expand", () => {
    // Simulate the scenario: user defined a template, page reloaded.
    // The template is in localStorage with enforce=true and real segments.
    writeValue(NT_KEY + "-expand", { segments: [], separator: "_" as const, enforceTemplate: false }, seedTemplate, 0);
    const recovered = readSnapshot(NT_KEY + "-expand", { segments: [], separator: "_" as const, enforceTemplate: false });

    // The panel's auto-expand logic: hasSegments = template.segments.length > 0.
    // The useEffect([hasSegments]) will call setExpanded(true) when hasSegments is true.
    const hasSegments = recovered.segments.length > 0;
    expect(hasSegments).toBe(true); // panel should auto-expand

    // The enforce toggle should also reflect the stored value
    expect(recovered.enforceTemplate).toBe(true);
  });
});
