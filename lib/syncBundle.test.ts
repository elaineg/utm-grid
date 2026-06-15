/**
 * Unit tests for lib/syncBundle.ts
 * All pure — no DOM, no React, no localStorage.
 */

import { describe, it, expect } from "vitest";
import {
  encodeBundle,
  decodeBundle,
  validateBundle,
  computeMergePlan,
  applyMergePlan,
  serializeBundle,
  bundleHasContent,
  buildContentSummary,
  BUNDLE_VERSION,
  BUNDLE_APP,
  type SyncBundle,
  type ExistingState,
  type BundleInputs,
} from "./syncBundle";
import { DEFAULT_SPEC } from "./spec";
import { DEFAULT_NAMING_TEMPLATE } from "./namingTemplate";
import { DEFAULT_LINT_SETTINGS, SEEDED_PRESETS, type Preset } from "./types";
import type { Campaign } from "./campaigns";
import type { MyWorkspaceEntry } from "./myWorkspaces";

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeCampaign(id: string, name: string, extra: Partial<Campaign> = {}): Campaign {
  return {
    id,
    name,
    rows: [],
    settings: DEFAULT_LINT_SETTINGS,
    savedAt: 1000,
    ...extra,
  };
}

function makePreset(id: string, name: string): Preset {
  return { id, name, values: { utm_source: "test" } };
}

function makeWorkspace(id: string, label: string): MyWorkspaceEntry {
  return {
    id,
    label,
    role: "owner",
    lastOpened: 2000,
    link: `https://example.com/w/${id}`,
  };
}

function emptyExisting(): ExistingState {
  return {
    campaigns: [],
    presets: [],
    myWorkspaces: [],
    spec: DEFAULT_SPEC,
    namingTemplate: DEFAULT_NAMING_TEMPLATE,
    lintSettings: DEFAULT_LINT_SETTINGS,
    editorName: "",
    reviewerName: "",
  };
}

function validBundle(overrides: Partial<SyncBundle> = {}): SyncBundle {
  return {
    app: BUNDLE_APP,
    version: BUNDLE_VERSION,
    exportedAt: Date.now(),
    ...overrides,
  };
}

// ── encode / decode round-trip ─────────────────────────────────────────────────

describe("encodeBundle / decodeBundle", () => {
  it("round-trips a minimal bundle", () => {
    const bundle = validBundle();
    const code = encodeBundle(bundle);
    expect(typeof code).toBe("string");
    expect(code.length).toBeGreaterThan(0);

    const result = decodeBundle(code);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.bundle.app).toBe(BUNDLE_APP);
      expect(result.bundle.version).toBe(BUNDLE_VERSION);
    }
  });

  it("round-trips a bundle with campaigns, presets, workspaces", () => {
    const bundle = validBundle({
      campaigns: [makeCampaign("c1", "Black Friday")],
      presets: [makePreset("p1", "Email")],
      myWorkspaces: [makeWorkspace("ws1", "My workspace")],
      editorName: "Alex",
      reviewerName: "Sam",
    });
    const code = encodeBundle(bundle);
    const result = decodeBundle(code);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.bundle.campaigns?.[0].name).toBe("Black Friday");
      expect(result.bundle.presets?.[0].name).toBe("Email");
      expect(result.bundle.myWorkspaces?.[0].label).toBe("My workspace");
      expect(result.bundle.editorName).toBe("Alex");
      expect(result.bundle.reviewerName).toBe("Sam");
    }
  });

  it("returns ok=false for empty string", () => {
    const result = decodeBundle("");
    expect(result.ok).toBe(false);
  });

  it("returns ok=false for garbage input", () => {
    const result = decodeBundle("not-a-valid-bundle-!!!xyz");
    expect(result.ok).toBe(false);
  });

  it("returns ok=false for a base64 string that decodes to non-JSON", () => {
    const fakeBase64 = encodeBundle(validBundle()).slice(0, 10) + "ZZZZ";
    const result = decodeBundle(fakeBase64);
    expect(result.ok).toBe(false);
  });

  it("code string is paste-safe (no +, /, or = characters)", () => {
    const code = encodeBundle(validBundle({
      campaigns: [makeCampaign("c1", "Spring Sale")],
    }));
    expect(code).not.toMatch(/[+/=]/);
  });
});

// ── validateBundle ─────────────────────────────────────────────────────────────

describe("validateBundle", () => {
  it("accepts a valid v1 bundle", () => {
    const bundle = validBundle();
    const result = validateBundle(bundle);
    expect(result.ok).toBe(true);
  });

  it("rejects null / undefined", () => {
    expect(validateBundle(null).ok).toBe(false);
    expect(validateBundle(undefined).ok).toBe(false);
  });

  it("rejects wrong app", () => {
    const result = validateBundle({ ...validBundle(), app: "other-app" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("malformed");
  });

  it("rejects missing version", () => {
    const bundle = { app: BUNDLE_APP, exportedAt: Date.now() } as unknown;
    const result = validateBundle(bundle);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("malformed");
  });

  it("rejects version 0", () => {
    const result = validateBundle({ ...validBundle(), version: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("malformed");
  });

  it("rejects version > BUNDLE_VERSION with 'unknown-version' reason", () => {
    const result = validateBundle({ ...validBundle(), version: BUNDLE_VERSION + 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("unknown-version");
      expect(result.error).toMatch(/newer version/i);
    }
  });

  it("accepts bundles with missing optional fields (legacy bundles)", () => {
    // A bundle with only the required fields — no campaigns, no presets, etc.
    const legacyBundle = { app: BUNDLE_APP, version: 1, exportedAt: 1000 };
    const result = validateBundle(legacyBundle);
    expect(result.ok).toBe(true);
  });

  it("error message for malformed bundle mentions 'unchanged'", () => {
    const result = validateBundle({ app: BUNDLE_APP }); // missing version
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/unchanged/i);
  });
});

// ── computeMergePlan ──────────────────────────────────────────────────────────

describe("computeMergePlan — campaigns", () => {
  it("adds campaigns with new ids", () => {
    const existing = emptyExisting();
    const bundle = validBundle({ campaigns: [makeCampaign("c1", "New Camp")] });
    const plan = computeMergePlan(existing, bundle);
    expect(plan.campaigns.added).toHaveLength(1);
    expect(plan.campaigns.added[0].name).toBe("New Camp");
    expect(plan.campaigns.updated).toHaveLength(0);
    expect(plan.campaigns.skipped).toHaveLength(0);
  });

  it("marks campaign as updated when same id but different content (savedAt differs)", () => {
    const existing = { ...emptyExisting(), campaigns: [makeCampaign("c1", "Camp", { savedAt: 1000 })] };
    const bundle = validBundle({ campaigns: [makeCampaign("c1", "Camp", { savedAt: 9999 })] });
    const plan = computeMergePlan(existing, bundle);
    expect(plan.campaigns.updated).toHaveLength(1);
    expect(plan.campaigns.added).toHaveLength(0);
    expect(plan.campaigns.skipped).toHaveLength(0);
  });

  it("skips campaign when same id and identical content", () => {
    const camp = makeCampaign("c1", "Camp");
    const existing = { ...emptyExisting(), campaigns: [camp] };
    const bundle = validBundle({ campaigns: [{ ...camp }] });
    const plan = computeMergePlan(existing, bundle);
    expect(plan.campaigns.skipped).toHaveLength(1);
    expect(plan.campaigns.added).toHaveLength(0);
    expect(plan.campaigns.updated).toHaveLength(0);
  });

  it("name collision on DIFFERENT id → adds as '<name> (imported)'", () => {
    const existing = { ...emptyExisting(), campaigns: [makeCampaign("local-id", "Black Friday")] };
    const bundle = validBundle({ campaigns: [makeCampaign("different-id", "Black Friday")] });
    const plan = computeMergePlan(existing, bundle);
    expect(plan.campaigns.added).toHaveLength(1);
    expect(plan.campaigns.added[0].name).toBe("Black Friday (imported)");
    expect(plan.campaigns.added[0].id).toBe("different-id");
  });

  it("returning-user: existing campaign is preserved after import (conflict-safe)", () => {
    const existingCamp = makeCampaign("local-id", "Existing");
    const existing = { ...emptyExisting(), campaigns: [existingCamp] };
    const bundle = validBundle({ campaigns: [makeCampaign("new-id", "Black Friday")] });
    const plan = computeMergePlan(existing, bundle);
    const result = applyMergePlan(plan, { overwriteSettings: false });
    const names = result.campaigns.map((c) => c.name);
    expect(names).toContain("Existing");
    expect(names).toContain("Black Friday");
    expect(result.campaigns).toHaveLength(2);
  });
});

describe("computeMergePlan — presets", () => {
  it("adds preset with new id", () => {
    const existing = emptyExisting();
    const bundle = validBundle({ presets: [makePreset("p1", "Email")] });
    const plan = computeMergePlan(existing, bundle);
    expect(plan.presets.added).toHaveLength(1);
  });

  it("updates preset with same id but different values", () => {
    const existing = { ...emptyExisting(), presets: [makePreset("p1", "Email")] };
    const bundle = validBundle({ presets: [{ id: "p1", name: "Email Updated", values: { utm_source: "new" } }] });
    const plan = computeMergePlan(existing, bundle);
    expect(plan.presets.updated).toHaveLength(1);
  });

  it("name collision on DIFFERENT id → adds as '<name> (imported)'", () => {
    const existing = { ...emptyExisting(), presets: [makePreset("local-p", "Email")] };
    const bundle = validBundle({ presets: [makePreset("import-p", "Email")] });
    const plan = computeMergePlan(existing, bundle);
    expect(plan.presets.added[0].name).toBe("Email (imported)");
  });
});

describe("computeMergePlan — myWorkspaces", () => {
  it("adds workspace with new id", () => {
    const existing = emptyExisting();
    const bundle = validBundle({ myWorkspaces: [makeWorkspace("ws1", "My WS")] });
    const plan = computeMergePlan(existing, bundle);
    expect(plan.myWorkspaces.added).toHaveLength(1);
  });

  it("skips workspace that is already up to date", () => {
    const ws = makeWorkspace("ws1", "My WS");
    const existing = { ...emptyExisting(), myWorkspaces: [ws] };
    const bundle = validBundle({ myWorkspaces: [{ ...ws }] });
    const plan = computeMergePlan(existing, bundle);
    expect(plan.myWorkspaces.skipped).toHaveLength(1);
  });
});

describe("computeMergePlan — settings", () => {
  it("settings.specWouldOverwrite = false when local spec is default (empty)", () => {
    const existing = emptyExisting();
    const bundle = validBundle({
      spec: { allowedValues: { utm_source: ["test"], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] }, enforceSpec: true },
    });
    const plan = computeMergePlan(existing, bundle);
    expect(plan.settings.specWouldOverwrite).toBe(false);
  });

  it("settings.specWouldOverwrite = true when local spec has values", () => {
    const existing = {
      ...emptyExisting(),
      spec: {
        allowedValues: { utm_source: ["fb"], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] },
        enforceSpec: false,
      },
    };
    const bundle = validBundle({
      spec: {
        allowedValues: { utm_source: ["newsletter"], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] },
        enforceSpec: true,
      },
    });
    const plan = computeMergePlan(existing, bundle);
    expect(plan.settings.specWouldOverwrite).toBe(true);
  });

  it("settings.templateWouldOverwrite = false when local template is empty", () => {
    const existing = emptyExisting();
    const bundle = validBundle({ namingTemplate: { segments: [{ name: "q", allowedTokens: [] }], separator: "_", enforceTemplate: false } });
    const plan = computeMergePlan(existing, bundle);
    expect(plan.settings.templateWouldOverwrite).toBe(false);
  });

  it("settings.templateWouldOverwrite = true when local template has segments", () => {
    const existing = { ...emptyExisting(), namingTemplate: { segments: [{ name: "channel", allowedTokens: [] }], separator: "_" as const, enforceTemplate: false } };
    const bundle = validBundle({ namingTemplate: { segments: [{ name: "quarter", allowedTokens: [] }], separator: "_", enforceTemplate: false } });
    const plan = computeMergePlan(existing, bundle);
    expect(plan.settings.templateWouldOverwrite).toBe(true);
  });
});

// ── applyMergePlan ─────────────────────────────────────────────────────────────

describe("applyMergePlan", () => {
  it("merged campaigns = existing + added, updated replaces in-place", () => {
    const existingCamp = makeCampaign("c1", "Existing", { savedAt: 1 });
    const updatedCamp = makeCampaign("c1", "Existing", { savedAt: 999 });
    const newCamp = makeCampaign("c2", "New");
    const existing = { ...emptyExisting(), campaigns: [existingCamp] };
    const bundle = validBundle({ campaigns: [updatedCamp, newCamp] });
    const plan = computeMergePlan(existing, bundle);
    const result = applyMergePlan(plan, { overwriteSettings: false });

    expect(result.campaigns).toHaveLength(2);
    const c1 = result.campaigns.find((c) => c.id === "c1")!;
    expect(c1.savedAt).toBe(999); // updated
    expect(result.campaigns.find((c) => c.id === "c2")).toBeDefined(); // added
  });

  it("does NOT apply spec when local is non-default and overwriteSettings=false", () => {
    const existing = {
      ...emptyExisting(),
      spec: {
        allowedValues: { utm_source: ["existing"], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] },
        enforceSpec: false,
      },
    };
    const bundle = validBundle({
      spec: { allowedValues: { utm_source: ["imported"], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] }, enforceSpec: true },
    });
    const plan = computeMergePlan(existing, bundle);
    const result = applyMergePlan(plan, { overwriteSettings: false });
    expect(result.spec).toBeUndefined(); // not applied
  });

  it("applies spec when local is non-default but overwriteSettings=true (opt-in)", () => {
    const existing = {
      ...emptyExisting(),
      spec: {
        allowedValues: { utm_source: ["existing"], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] },
        enforceSpec: false,
      },
    };
    const bundle = validBundle({
      spec: { allowedValues: { utm_source: ["imported"], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] }, enforceSpec: true },
    });
    const plan = computeMergePlan(existing, bundle);
    const result = applyMergePlan(plan, { overwriteSettings: true });
    expect(result.spec).toBeDefined();
    expect(result.spec?.allowedValues.utm_source).toEqual(["imported"]);
  });

  it("applies spec when local is default (empty) even with overwriteSettings=false", () => {
    const existing = emptyExisting(); // default spec
    const bundle = validBundle({
      spec: { allowedValues: { utm_source: ["imported"], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] }, enforceSpec: true },
    });
    const plan = computeMergePlan(existing, bundle);
    const result = applyMergePlan(plan, { overwriteSettings: false });
    expect(result.spec).toBeDefined();
    expect(result.spec?.allowedValues.utm_source).toEqual(["imported"]);
  });

  it("empty bundle merges into existing state without loss", () => {
    const existing = {
      ...emptyExisting(),
      campaigns: [makeCampaign("c1", "Existing")],
    };
    const bundle = validBundle({}); // no campaigns, no presets, etc.
    const plan = computeMergePlan(existing, bundle);
    const result = applyMergePlan(plan, { overwriteSettings: false });
    expect(result.campaigns).toHaveLength(1);
    expect(result.campaigns[0].name).toBe("Existing");
  });
});

// ── serializeBundle ────────────────────────────────────────────────────────────

describe("serializeBundle", () => {
  it("filters out seeded presets", () => {
    const inputs: BundleInputs = {
      campaigns: [],
      presets: [...SEEDED_PRESETS, makePreset("user-p1", "My Preset")],
      spec: DEFAULT_SPEC,
      namingTemplate: DEFAULT_NAMING_TEMPLATE,
      lintSettings: DEFAULT_LINT_SETTINGS,
      editorName: "",
      reviewerName: "",
      myWorkspaces: [],
    };
    const bundle = serializeBundle(inputs);
    expect(bundle.presets).toHaveLength(1);
    expect(bundle.presets![0].name).toBe("My Preset");
  });

  it("omits empty arrays (campaigns, presets, myWorkspaces not present when empty)", () => {
    const inputs: BundleInputs = {
      campaigns: [],
      presets: [],
      spec: DEFAULT_SPEC,
      namingTemplate: DEFAULT_NAMING_TEMPLATE,
      lintSettings: DEFAULT_LINT_SETTINGS,
      editorName: "",
      reviewerName: "",
      myWorkspaces: [],
    };
    const bundle = serializeBundle(inputs);
    expect(bundle.campaigns).toBeUndefined();
    expect(bundle.presets).toBeUndefined();
    expect(bundle.myWorkspaces).toBeUndefined();
    expect(bundle.editorName).toBeUndefined();
    expect(bundle.reviewerName).toBeUndefined();
  });

  it("includes non-empty campaigns", () => {
    const inputs: BundleInputs = {
      campaigns: [makeCampaign("c1", "BF")],
      presets: [],
      spec: DEFAULT_SPEC,
      namingTemplate: DEFAULT_NAMING_TEMPLATE,
      lintSettings: DEFAULT_LINT_SETTINGS,
      editorName: "Alex",
      reviewerName: "",
      myWorkspaces: [],
    };
    const bundle = serializeBundle(inputs);
    expect(bundle.campaigns).toHaveLength(1);
    expect(bundle.editorName).toBe("Alex");
  });

  it("bundle has correct app and version", () => {
    const inputs: BundleInputs = {
      campaigns: [],
      presets: [],
      spec: DEFAULT_SPEC,
      namingTemplate: DEFAULT_NAMING_TEMPLATE,
      lintSettings: DEFAULT_LINT_SETTINGS,
      editorName: "",
      reviewerName: "",
      myWorkspaces: [],
    };
    const bundle = serializeBundle(inputs);
    expect(bundle.app).toBe(BUNDLE_APP);
    expect(bundle.version).toBe(BUNDLE_VERSION);
  });
});

// ── bundleHasContent ──────────────────────────────────────────────────────────

describe("bundleHasContent", () => {
  it("returns false when everything is empty/default", () => {
    const inputs: BundleInputs = {
      campaigns: [],
      presets: SEEDED_PRESETS, // seeded only → ignored
      spec: DEFAULT_SPEC,
      namingTemplate: DEFAULT_NAMING_TEMPLATE,
      lintSettings: DEFAULT_LINT_SETTINGS,
      editorName: "",
      reviewerName: "",
      myWorkspaces: [],
    };
    expect(bundleHasContent(inputs)).toBe(false);
  });

  it("returns true when there are campaigns", () => {
    const inputs: BundleInputs = {
      campaigns: [makeCampaign("c1", "BF")],
      presets: [],
      spec: DEFAULT_SPEC,
      namingTemplate: DEFAULT_NAMING_TEMPLATE,
      lintSettings: DEFAULT_LINT_SETTINGS,
      editorName: "",
      reviewerName: "",
      myWorkspaces: [],
    };
    expect(bundleHasContent(inputs)).toBe(true);
  });

  it("returns true when there is a user preset", () => {
    const inputs: BundleInputs = {
      campaigns: [],
      presets: [makePreset("p1", "Custom")],
      spec: DEFAULT_SPEC,
      namingTemplate: DEFAULT_NAMING_TEMPLATE,
      lintSettings: DEFAULT_LINT_SETTINGS,
      editorName: "",
      reviewerName: "",
      myWorkspaces: [],
    };
    expect(bundleHasContent(inputs)).toBe(true);
  });
});

// ── buildContentSummary ───────────────────────────────────────────────────────

describe("buildContentSummary", () => {
  it("returns 'Nothing saved yet' when empty", () => {
    const inputs: BundleInputs = {
      campaigns: [],
      presets: SEEDED_PRESETS,
      spec: DEFAULT_SPEC,
      namingTemplate: DEFAULT_NAMING_TEMPLATE,
      lintSettings: DEFAULT_LINT_SETTINGS,
      editorName: "",
      reviewerName: "",
      myWorkspaces: [],
    };
    expect(buildContentSummary(inputs)).toBe("Nothing saved yet");
  });

  it("includes campaign count and preset count and workspace count", () => {
    const inputs: BundleInputs = {
      campaigns: [makeCampaign("c1", "BF"), makeCampaign("c2", "SP")],
      presets: [makePreset("p1", "Email")],
      spec: DEFAULT_SPEC,
      namingTemplate: DEFAULT_NAMING_TEMPLATE,
      lintSettings: DEFAULT_LINT_SETTINGS,
      editorName: "",
      reviewerName: "",
      myWorkspaces: [makeWorkspace("ws1", "My WS")],
    };
    const summary = buildContentSummary(inputs);
    expect(summary).toContain("2 campaigns");
    expect(summary).toContain("1 preset");
    expect(summary).toContain("1 saved workspace");
  });
});

// ── Full round-trip integration test (returning user) ─────────────────────────

describe("full round-trip integration", () => {
  it("serializeBundle → encodeBundle → decodeBundle → validateBundle → computeMergePlan → applyMergePlan preserves existing + adds new", () => {
    const existingCamp = makeCampaign("existing-id", "Existing Campaign");
    const existing: ExistingState = {
      campaigns: [existingCamp],
      presets: [],
      myWorkspaces: [],
      spec: DEFAULT_SPEC,
      namingTemplate: DEFAULT_NAMING_TEMPLATE,
      lintSettings: DEFAULT_LINT_SETTINGS,
      editorName: "",
      reviewerName: "",
    };

    // Export from "device 1"
    const inputs: BundleInputs = {
      campaigns: [makeCampaign("imported-id", "Black Friday")],
      presets: [makePreset("p1", "Custom Email")],
      spec: DEFAULT_SPEC,
      namingTemplate: DEFAULT_NAMING_TEMPLATE,
      lintSettings: DEFAULT_LINT_SETTINGS,
      editorName: "Alex",
      reviewerName: "",
      myWorkspaces: [makeWorkspace("ws1", "Team WS")],
    };
    const bundle = serializeBundle(inputs);
    const code = encodeBundle(bundle);

    // Import on "device 2" (which already has its own campaign)
    const decoded = decodeBundle(code);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;

    const validated = validateBundle(decoded.bundle);
    expect(validated.ok).toBe(true);
    if (!validated.ok) return;

    const plan = computeMergePlan(existing, validated.bundle);
    const result = applyMergePlan(plan, { overwriteSettings: false });

    // Both campaigns are present
    const names = result.campaigns.map((c) => c.name);
    expect(names).toContain("Existing Campaign");
    expect(names).toContain("Black Friday");
    expect(result.campaigns).toHaveLength(2);

    // Preset was added
    expect(result.presets).toHaveLength(1);
    expect(result.presets[0].name).toBe("Custom Email");

    // Workspace was added
    expect(result.myWorkspaces).toHaveLength(1);
    expect(result.myWorkspaces[0].label).toBe("Team WS");
  });
});
