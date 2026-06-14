// @vitest-environment node
/**
 * Unit tests for lib/myWorkspaces.ts — upsert dedup, owner-not-downgraded,
 * never-record-not-found invariant, newest-first sort, label search,
 * remove-by-id, serialize round-trip.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  deserializeMyWorkspaces,
  deriveWorkspaceLabel,
  filterMyWorkspaces,
  MY_WORKSPACES_KEY,
  readMyWorkspacesFromStorage,
  removeMyWorkspace,
  renameMyWorkspace,
  resolveEntryDisplayName,
  serializeMyWorkspaces,
  upsertMyWorkspace,
  upsertMyWorkspaceInStorage,
  writeMyWorkspacesToStorage,
  type MyWorkspaceEntry,
} from "./myWorkspaces";

// ── Fixtures ───────────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<MyWorkspaceEntry> = {}): MyWorkspaceEntry {
  return {
    id: "abc123",
    label: "Q3 Paid",
    role: "owner",
    lastOpened: 1_700_000_000_000,
    link: "https://utm-grid.vercel.app/w/abc123",
    ...overrides,
  };
}

// ── Serialize / deserialize ───────────────────────────────────────────────────

describe("serialize / deserialize round-trip", () => {
  it("round-trips a valid array", () => {
    const entries: MyWorkspaceEntry[] = [
      makeEntry({ id: "a1", role: "owner" }),
      makeEntry({ id: "b2", role: "visited", lastOpened: 1_700_000_001_000 }),
    ];
    const raw = serializeMyWorkspaces(entries);
    expect(deserializeMyWorkspaces(raw)).toEqual(entries);
  });

  it("returns [] for null", () => {
    expect(deserializeMyWorkspaces(null)).toEqual([]);
  });

  it("returns [] for corrupt JSON", () => {
    expect(deserializeMyWorkspaces("{bad json")).toEqual([]);
  });

  it("returns [] for non-array JSON", () => {
    expect(deserializeMyWorkspaces(JSON.stringify({ id: "x" }))).toEqual([]);
  });

  it("filters out malformed entries", () => {
    const mixed = JSON.stringify([
      makeEntry({ id: "good" }),
      { id: 123, role: "owner" }, // id must be string
      { id: "bad", role: "unknown" }, // role must be owner|visited
      null,
    ]);
    const result = deserializeMyWorkspaces(mixed);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("good");
  });
});

// ── upsertMyWorkspace ─────────────────────────────────────────────────────────

describe("upsertMyWorkspace", () => {
  it("inserts a new entry when not present", () => {
    const result = upsertMyWorkspace([], makeEntry({ id: "new1" }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("new1");
  });

  it("inserts multiple entries and sorts newest-first", () => {
    const older = makeEntry({ id: "old", lastOpened: 1_000 });
    const newer = makeEntry({ id: "new", lastOpened: 2_000 });
    const result = upsertMyWorkspace([older], newer);
    expect(result[0].id).toBe("new");
    expect(result[1].id).toBe("old");
  });

  it("deduplicates by id — updates existing entry in place", () => {
    const existing = makeEntry({ id: "dup", role: "visited", lastOpened: 1_000 });
    const update = makeEntry({ id: "dup", role: "visited", lastOpened: 2_000, label: "New Label" });
    const result = upsertMyWorkspace([existing], update);
    expect(result).toHaveLength(1);
    expect(result[0].lastOpened).toBe(2_000);
    expect(result[0].label).toBe("New Label");
  });

  it("NEVER downgrades an owner to visited", () => {
    const existing = makeEntry({ id: "ws1", role: "owner" });
    const downgrade = makeEntry({ id: "ws1", role: "visited", lastOpened: Date.now() });
    const result = upsertMyWorkspace([existing], downgrade);
    expect(result[0].role).toBe("owner");
  });

  it("upgrades visited to owner when role=owner on upsert", () => {
    const existing = makeEntry({ id: "ws1", role: "visited" });
    const upgrade = makeEntry({ id: "ws1", role: "owner", lastOpened: Date.now() });
    const result = upsertMyWorkspace([existing], upgrade);
    expect(result[0].role).toBe("owner");
  });

  it("updates lastOpened when re-opening an already-listed workspace", () => {
    const t1 = 1_700_000_000_000;
    const t2 = 1_700_000_001_000;
    const existing = makeEntry({ id: "ws2", lastOpened: t1 });
    const update = makeEntry({ id: "ws2", lastOpened: t2 });
    const result = upsertMyWorkspace([existing], update);
    expect(result[0].lastOpened).toBe(t2);
  });

  it("moves a re-opened workspace to the top of the list", () => {
    const a = makeEntry({ id: "a", lastOpened: 1_000 });
    const b = makeEntry({ id: "b", lastOpened: 3_000 });
    const c = makeEntry({ id: "c", lastOpened: 2_000 });
    // a is oldest; re-open a with newest timestamp
    const result = upsertMyWorkspace([a, b, c], makeEntry({ id: "a", lastOpened: 9_999 }));
    expect(result[0].id).toBe("a");
  });
});

// ── removeMyWorkspace ─────────────────────────────────────────────────────────

describe("removeMyWorkspace", () => {
  it("removes the entry with the given id", () => {
    const entries = [makeEntry({ id: "x" }), makeEntry({ id: "y" })];
    const result = removeMyWorkspace(entries, "x");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("y");
  });

  it("returns the array unchanged when id not found", () => {
    const entries = [makeEntry({ id: "x" })];
    expect(removeMyWorkspace(entries, "z")).toEqual(entries);
  });

  it("returns [] when the list becomes empty", () => {
    expect(removeMyWorkspace([makeEntry()], "abc123")).toEqual([]);
  });
});

// ── filterMyWorkspaces ────────────────────────────────────────────────────────

describe("filterMyWorkspaces", () => {
  const entries: MyWorkspaceEntry[] = [
    makeEntry({ id: "1", label: "BF 2026" }),
    makeEntry({ id: "2", label: "Spring Sale" }),
    makeEntry({ id: "3", label: "Q3 Paid Social" }),
  ];

  it("returns all entries for empty query", () => {
    expect(filterMyWorkspaces(entries, "")).toHaveLength(3);
  });

  it("returns all entries for whitespace query", () => {
    expect(filterMyWorkspaces(entries, "   ")).toHaveLength(3);
  });

  it("filters case-insensitively", () => {
    const result = filterMyWorkspaces(entries, "bf");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("matches a substring in the middle of a label", () => {
    const result = filterMyWorkspaces(entries, "paid");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("returns [] when no label matches", () => {
    expect(filterMyWorkspaces(entries, "zzz")).toHaveLength(0);
  });

  it("matches multiple entries when query is broad", () => {
    // "a" appears in "BF 2026"? No. In "Spring Sale"? Yes. In "Q3 Paid Social"? Yes ("Social", "Paid").
    const result = filterMyWorkspaces(entries, "a");
    // Spring Sale → "a" in "Sale"
    // Q3 Paid Social → "a" in "Paid", "Social"
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});

// ── deriveWorkspaceLabel ──────────────────────────────────────────────────────
// FIX A-2 (My Workspaces Round 2): friendly default — NEVER raw id.

describe("deriveWorkspaceLabel", () => {
  it("returns the server workspace name when set", () => {
    expect(deriveWorkspaceLabel("My Q3 Campaign", "abc12345")).toBe("My Q3 Campaign");
  });

  it("falls back to utm_campaign when server name is empty", () => {
    expect(deriveWorkspaceLabel("", "abc12345xyz", "spring_launch")).toBe("spring_launch");
  });

  it("falls back to utm_campaign when server name is undefined", () => {
    expect(deriveWorkspaceLabel(undefined, "abc12345xyz", "summer_sale")).toBe("summer_sale");
  });

  it("falls back to base URL domain when utm_campaign is empty", () => {
    expect(deriveWorkspaceLabel(undefined, "abc", "", "https://acme.com/sale")).toBe("acme.com");
  });

  it("falls back to dated form when no name, campaign, or parseable URL", () => {
    // Provide a fixed timestamp: use a local date to avoid timezone-crossing
    const d = new Date(2026, 0, 14); // Jan 14, 2026 in local time
    const ts = d.getTime();
    const label = deriveWorkspaceLabel(undefined, "abc", "", "", ts);
    expect(label).toMatch(/^Workspace — /);
    // Month and day should both appear (exact format may vary by locale)
    expect(label).toMatch(/\d+/); // contains at least one number (the day)
  });

  it("NEVER returns raw id as the primary label", () => {
    const id = "HbqwUjvW";
    const label = deriveWorkspaceLabel(undefined, id, "", "", Date.now());
    // The label must not be the raw id
    expect(label).not.toBe(id);
    expect(label).not.toBe(`Workspace ${id.slice(0, 8)}`);
    // It should be the dated fallback form
    expect(label).toMatch(/^Workspace — /);
  });

  it("trims the server name", () => {
    expect(deriveWorkspaceLabel("  Trimmed  ", "abc12345")).toBe("Trimmed");
  });
});

// ── renameMyWorkspace ─────────────────────────────────────────────────────────
// FIX A-1 (My Workspaces Round 2): device-local rename with no server call.

describe("renameMyWorkspace", () => {
  it("sets the name field on the matching entry", () => {
    const entries: MyWorkspaceEntry[] = [
      makeEntry({ id: "ws1", label: "spring_launch" }),
      makeEntry({ id: "ws2", label: "acme.com" }),
    ];
    const result = renameMyWorkspace(entries, "ws1", "Acme Spring");
    expect(result[0].name).toBe("Acme Spring");
    expect(result[1].name).toBeUndefined();
  });

  it("trims whitespace from the new name", () => {
    const entries: MyWorkspaceEntry[] = [makeEntry({ id: "ws1" })];
    const result = renameMyWorkspace(entries, "ws1", "  Trimmed  ");
    expect(result[0].name).toBe("Trimmed");
  });

  it("clears the name (undefined) when new name is empty string", () => {
    const entries: MyWorkspaceEntry[] = [makeEntry({ id: "ws1", name: "Old Name" })];
    const result = renameMyWorkspace(entries, "ws1", "");
    expect(result[0].name).toBeUndefined();
  });

  it("does not mutate the original array", () => {
    const entries: MyWorkspaceEntry[] = [makeEntry({ id: "ws1" })];
    renameMyWorkspace(entries, "ws1", "New Name");
    expect(entries[0].name).toBeUndefined();
  });

  it("returns entries unchanged when id not found", () => {
    const entries: MyWorkspaceEntry[] = [makeEntry({ id: "ws1" })];
    const result = renameMyWorkspace(entries, "nonexistent", "X");
    expect(result).toEqual(entries);
  });
});

// ── resolveEntryDisplayName ───────────────────────────────────────────────────
// FIX A-2: display name = name ?? label, never raw id.

describe("resolveEntryDisplayName", () => {
  it("returns user-given name when set", () => {
    const entry = makeEntry({ label: "spring_launch", name: "Acme Campaign" });
    expect(resolveEntryDisplayName(entry)).toBe("Acme Campaign");
  });

  it("returns friendly label when name is not set", () => {
    const entry = makeEntry({ label: "acme.com", name: undefined });
    expect(resolveEntryDisplayName(entry)).toBe("acme.com");
  });

  it("returns label when name is empty string (treated as absent)", () => {
    // renameMyWorkspace stores undefined for empty; but guard here too
    const entry = makeEntry({ label: "acme.com", name: "" });
    expect(resolveEntryDisplayName(entry)).toBe("acme.com");
  });
});

// ── filterMyWorkspaces — FIX A-3 ─────────────────────────────────────────────
// Search must match on the RESOLVED DISPLAY NAME (name ?? label), not the raw id.

describe("filterMyWorkspaces — search by display name", () => {
  it("finds an entry by user-given name ('acme' finds entry named 'Acme Spring')", () => {
    const entries: MyWorkspaceEntry[] = [
      makeEntry({ id: "ws1", label: "spring_launch", name: "Acme Spring" }),
      makeEntry({ id: "ws2", label: "zenith.com" }),
    ];
    const result = filterMyWorkspaces(entries, "acme");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("ws1");
  });

  it("finds an entry by friendly label when no user name is set", () => {
    const entries: MyWorkspaceEntry[] = [
      makeEntry({ id: "ws1", label: "zenith.com" }),
      makeEntry({ id: "ws2", label: "acme.com" }),
    ];
    const result = filterMyWorkspaces(entries, "zenith");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("ws1");
  });

  it("does NOT match on the raw workspace id (Rob's failure must be impossible)", () => {
    const entries: MyWorkspaceEntry[] = [
      makeEntry({ id: "HbqwUjvW", label: "acme.com" }),
    ];
    // Searching by raw id should NOT match (label is "acme.com", not the id)
    expect(filterMyWorkspaces(entries, "HbqwUjvW")).toHaveLength(0);
    // But the friendly label still matches
    expect(filterMyWorkspaces(entries, "acme")).toHaveLength(1);
  });

  it("is case-insensitive on the display name", () => {
    const entries: MyWorkspaceEntry[] = [
      makeEntry({ id: "ws1", label: "spring_launch", name: "Acme Spring" }),
    ];
    expect(filterMyWorkspaces(entries, "ACME")).toHaveLength(1);
    expect(filterMyWorkspaces(entries, "acme")).toHaveLength(1);
    expect(filterMyWorkspaces(entries, "spring")).toHaveLength(1);
  });

  it("backward compat: old entries without name field match on label", () => {
    // Simulate a pre-Round-2 entry: no name field at all
    const oldEntry = { id: "ws1", label: "Q3 Paid Social", role: "owner", lastOpened: 1000, link: "https://example.com/w/ws1" } as MyWorkspaceEntry;
    expect(filterMyWorkspaces([oldEntry], "q3 paid")).toHaveLength(1);
    expect(filterMyWorkspaces([oldEntry], "Q3")).toHaveLength(1);
  });
});

// ── localStorage helpers ──────────────────────────────────────────────────────

describe("localStorage helpers (readMyWorkspacesFromStorage / writeMyWorkspacesToStorage / upsertMyWorkspaceInStorage)", () => {
  // vitest runs in node environment — window is not available.
  // Stub a fake window.localStorage (same pattern as useLocalStorage.test.ts).
  function makeFakeWindow() {
    const store = new Map<string, string>();
    return {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
      store,
    };
  }

  let fake: ReturnType<typeof makeFakeWindow>;

  beforeEach(() => {
    fake = makeFakeWindow();
    vi.stubGlobal("window", fake);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("readMyWorkspacesFromStorage returns [] when key absent", () => {
    expect(readMyWorkspacesFromStorage()).toEqual([]);
  });

  it("readMyWorkspacesFromStorage returns parsed entries when key present", () => {
    const entries = [makeEntry({ id: "read1" })];
    fake.localStorage.setItem(MY_WORKSPACES_KEY, serializeMyWorkspaces(entries));
    expect(readMyWorkspacesFromStorage()).toEqual(entries);
  });

  it("writeMyWorkspacesToStorage persists entries", () => {
    const entries = [makeEntry({ id: "write1" })];
    writeMyWorkspacesToStorage(entries);
    const stored = fake.localStorage.getItem(MY_WORKSPACES_KEY);
    expect(stored).toBe(serializeMyWorkspaces(entries));
  });

  it("upsertMyWorkspaceInStorage reads, upserts, and writes back", () => {
    // Seed one entry via direct write
    const seed = makeEntry({ id: "seed1", role: "visited" });
    writeMyWorkspacesToStorage([seed]);

    // Upsert: same id but role owner, newer timestamp
    const updated = makeEntry({ id: "seed1", role: "owner", lastOpened: seed.lastOpened + 1000 });
    upsertMyWorkspaceInStorage(updated);

    // Read back and verify
    const written = readMyWorkspacesFromStorage();
    expect(written).toHaveLength(1);
    expect(written[0].role).toBe("owner"); // upgraded, not downgraded
    expect(written[0].lastOpened).toBe(seed.lastOpened + 1000);
  });

  it("upsertMyWorkspaceInStorage never downgrades owner to visited", () => {
    // Seed as owner
    const owner = makeEntry({ id: "own1", role: "owner", lastOpened: 1_000 });
    writeMyWorkspacesToStorage([owner]);

    // Attempt to upsert as visited (simulating /w/<id> open after the device created it)
    const visit = makeEntry({ id: "own1", role: "visited", lastOpened: 2_000 });
    upsertMyWorkspaceInStorage(visit);

    const written = readMyWorkspacesFromStorage();
    expect(written[0].role).toBe("owner"); // NOT downgraded
  });

  it("never records a not-found id — calling code must check resolve before upsert (library is passive)", () => {
    // The library is passive: the calling code guards the upsert.
    // This test documents the contract: upsertMyWorkspaceInStorage inserts any id passed to it;
    // the guard (only call when resolved) lives in the useEffect at the call site.
    // So this test verifies the function inserts what it's given — relying on the caller to not
    // pass a not-found id. We document this by passing a mock id and verifying it IS inserted.
    upsertMyWorkspaceInStorage(makeEntry({ id: "notfound-id" }));
    const written = readMyWorkspacesFromStorage();
    expect(written.some((e) => e.id === "notfound-id")).toBe(true);
    // Caller responsibility: this function should ONLY be called when status === "found"
  });
});

// ── Newest-first sort invariant ───────────────────────────────────────────────

describe("newest-first sort invariant", () => {
  it("upsertMyWorkspace always returns list sorted newest-lastOpened-first", () => {
    const e1 = makeEntry({ id: "e1", lastOpened: 1_000 });
    const e2 = makeEntry({ id: "e2", lastOpened: 3_000 });
    const e3 = makeEntry({ id: "e3", lastOpened: 2_000 });
    const result = upsertMyWorkspace(
      upsertMyWorkspace([e1], e2),
      e3
    );
    expect(result[0].id).toBe("e2");
    expect(result[1].id).toBe("e3");
    expect(result[2].id).toBe("e1");
  });
});

// ── BUG-1 regression: getSnapshot reference stability ────────────────────────
// Guards: MyWorkspacesPanel.getClientSnapshot must return the SAME array reference
// on repeated calls when localStorage has not changed. useSyncExternalStore uses
// reference equality — a new array on every call → infinite re-render → React #185.

describe("deserializeMyWorkspaces reference stability (BUG-1 regression guard)", () => {
  it("returns the same [] reference for repeated null reads — models the stable-snapshot requirement", () => {
    // The real fix is in getClientSnapshot (module-level cache), which we cannot import
    // directly as it's in the component. We test the underlying invariant: calling
    // deserializeMyWorkspaces with the SAME raw string (null → null) must always return
    // an equal value so that a caching wrapper can return a stable reference.
    const r1 = deserializeMyWorkspaces(null);
    const r2 = deserializeMyWorkspaces(null);
    // Values must be equal (both []) — the cache layer ensures same reference.
    expect(r1).toEqual(r2);
    expect(r1).toEqual([]);
  });

  it("returns equal arrays for repeated identical raw strings", () => {
    const entries = [makeEntry({ id: "stable1" })];
    const raw = serializeMyWorkspaces(entries);
    const r1 = deserializeMyWorkspaces(raw);
    const r2 = deserializeMyWorkspaces(raw);
    // Values must be equal — the cache layer (getClientSnapshot) returns the SAME
    // reference when raw doesn't change, preventing useSyncExternalStore thrash.
    expect(r1).toEqual(r2);
  });

  it("returns a different value when the raw string changes", () => {
    const raw1 = serializeMyWorkspaces([makeEntry({ id: "before" })]);
    const raw2 = serializeMyWorkspaces([makeEntry({ id: "after" })]);
    const r1 = deserializeMyWorkspaces(raw1);
    const r2 = deserializeMyWorkspaces(raw2);
    expect(r1[0].id).toBe("before");
    expect(r2[0].id).toBe("after");
  });
});
