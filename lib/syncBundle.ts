/**
 * Cross-device portable bundle — serialize / deserialize / merge ALL local accumulation.
 *
 * Pure module — no DOM, no React, no window/document reads.
 * All localStorage access is done by the caller (UI layer), passed in as plain values.
 * Safe for unit tests and SSR.
 *
 * Bundle format v1:
 *   { app: "utm-grid", version: 1, exportedAt: <epoch ms>,
 *     campaigns?: Campaign[], presets?: Preset[],
 *     spec?: UtmSpec, namingTemplate?: NamingTemplate,
 *     lintSettings?: LintSettings, editorName?: string, reviewerName?: string,
 *     myWorkspaces?: MyWorkspaceEntry[] }
 *
 * Encoding: JSON → base64url (via btoa of UTF-8 bytes).
 * Mirror of share.ts approach (no LZString dependency — bundle is user-visible and
 * benefits from paste-safe plain base64url over compressed binary).
 */

import type { LintSettings } from "./types";
import type { UtmSpec } from "./spec";
import type { NamingTemplate } from "./namingTemplate";
import type { Campaign } from "./campaigns";
import type { Preset } from "./types";
import type { MyWorkspaceEntry } from "./myWorkspaces";

// ── Bundle types ──────────────────────────────────────────────────────────────

export const BUNDLE_VERSION = 1;
export const BUNDLE_APP = "utm-grid";

export interface SyncBundle {
  app: string;
  version: number;
  exportedAt: number;
  campaigns?: Campaign[];
  presets?: Preset[];
  spec?: UtmSpec;
  namingTemplate?: NamingTemplate;
  lintSettings?: LintSettings;
  editorName?: string;
  reviewerName?: string;
  myWorkspaces?: MyWorkspaceEntry[];
}

// ── Serialization inputs (passed in by UI — no localStorage reads here) ───────

export interface BundleInputs {
  campaigns: Campaign[];
  /** Only user presets — seeded presets are filtered out here. */
  presets: Preset[];
  spec: UtmSpec;
  namingTemplate: NamingTemplate;
  lintSettings: LintSettings;
  editorName: string;
  reviewerName: string;
  myWorkspaces: MyWorkspaceEntry[];
}

// ── Encode / decode ───────────────────────────────────────────────────────────

/**
 * Encode a bundle to a paste-safe base64url string.
 * Uses base64url alphabet (+ → -, / → _, drop = padding) for URL/form safety.
 */
export function encodeBundle(bundle: SyncBundle): string {
  const json = JSON.stringify(bundle);
  // Convert to base64url via btoa over UTF-8 bytes
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  // base64url: replace + with -, / with _, strip trailing =
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decode a base64url string back to a SyncBundle.
 * Returns a typed result: { ok: true, bundle } | { ok: false, error: string }.
 * NEVER throws — all errors are caught and returned as { ok: false }.
 */
export type DecodeResult =
  | { ok: true; bundle: SyncBundle }
  | { ok: false; error: string };

export function decodeBundle(code: string): DecodeResult {
  if (!code || typeof code !== "string") {
    return { ok: false, error: "Empty or non-string input." };
  }
  try {
    // Restore standard base64 from base64url
    const b64 = code.trim().replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "Invalid bundle structure." };
    }
    return { ok: true, bundle: parsed as SyncBundle };
  } catch {
    return { ok: false, error: "Failed to decode — not a valid setup code." };
  }
}

// ── Validation ─────────────────────────────────────────────────────────────────

export type ValidateResult =
  | { ok: true; bundle: SyncBundle }
  | { ok: false; error: string; reason: "malformed" | "unknown-version" };

/**
 * Validate a decoded bundle:
 *  - app must be "utm-grid"
 *  - version must be exactly BUNDLE_VERSION (1); > 1 → unknown/newer version error
 *  - missing fields are tolerated (older bundles merge gracefully)
 * NEVER mutates state on rejection.
 */
export function validateBundle(raw: unknown): ValidateResult {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "That doesn’t look like a UTM Grid setup code. Your saved data is unchanged.", reason: "malformed" };
  }
  const obj = raw as Record<string, unknown>;

  if (obj.app !== BUNDLE_APP) {
    return { ok: false, error: "That doesn’t look like a UTM Grid setup code. Your saved data is unchanged.", reason: "malformed" };
  }

  const version = obj.version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    return { ok: false, error: "That doesn’t look like a UTM Grid setup code. Your saved data is unchanged.", reason: "malformed" };
  }
  if (version > BUNDLE_VERSION) {
    return {
      ok: false,
      error: "This setup was exported from a newer version of UTM Grid. Update, then import again. Nothing was changed here.",
      reason: "unknown-version",
    };
  }

  return { ok: true, bundle: obj as unknown as SyncBundle };
}

// ── Merge plan ────────────────────────────────────────────────────────────────

export interface MergeBucket<T> {
  /** Items with new ids — to be added. */
  added: T[];
  /** Items with matching ids but different content — to be updated. */
  updated: T[];
  /** Items that already exist and are identical (by id + content hash) — skipped. */
  skipped: T[];
}

export interface SettingsMergePlan {
  /** true when local spec has non-default content and the bundle also has spec. */
  specWouldOverwrite: boolean;
  /** true when local namingTemplate has segments and the bundle also has namingTemplate. */
  templateWouldOverwrite: boolean;
  /** true when local lintSettings is non-default and the bundle has lintSettings. */
  lintWouldOverwrite: boolean;
  /** true when local editorName is non-empty and the bundle has editorName. */
  editorNameWouldOverwrite: boolean;
  /** true when local reviewerName is non-empty and the bundle has reviewerName. */
  reviewerNameWouldOverwrite: boolean;
}

export interface MergePlan {
  campaigns: MergeBucket<Campaign>;
  presets: MergeBucket<Preset>;
  myWorkspaces: MergeBucket<MyWorkspaceEntry>;
  settings: SettingsMergePlan;
  /** Incoming bundle — used by applyMergePlan. */
  _bundle: SyncBundle;
  /** Current local state — used by applyMergePlan. */
  _existing: ExistingState;
}

export interface ExistingState {
  campaigns: Campaign[];
  presets: Preset[];
  myWorkspaces: MyWorkspaceEntry[];
  spec: UtmSpec;
  namingTemplate: NamingTemplate;
  lintSettings: LintSettings;
  editorName: string;
  reviewerName: string;
}

/**
 * Compute a merge plan from existing local state and an incoming bundle.
 * This is the SINGLE source of truth for both the pre-apply summary and applyMergePlan.
 * Merge semantics for arrays (campaigns, presets, myWorkspaces):
 *  - same id → "updated" if content differs, "skipped" if identical
 *  - new id → "added"
 *  - name collision on a DIFFERENT id → "added" with name "<name> (imported)"
 */
export function computeMergePlan(
  existing: ExistingState,
  bundle: SyncBundle
): MergePlan {
  return {
    campaigns: mergeBucketById<Campaign>(
      existing.campaigns,
      bundle.campaigns ?? [],
      campaignContentKey
    ),
    presets: mergeBucketById<Preset>(
      existing.presets,
      bundle.presets ?? [],
      presetContentKey
    ),
    myWorkspaces: mergeBucketById<MyWorkspaceEntry>(
      existing.myWorkspaces,
      bundle.myWorkspaces ?? [],
      workspaceContentKey
    ),
    settings: computeSettingsMergePlan(existing, bundle),
    _bundle: bundle,
    _existing: existing,
  };
}

function getItemDisplayName(item: { id: string; name?: string; label?: string }): string {
  return item.name ?? item.label ?? item.id;
}

function mergeBucketById<T extends { id: string; name?: string; label?: string }>(
  existing: T[],
  incoming: T[],
  contentKey: (item: T) => string
): MergeBucket<T> {
  const added: T[] = [];
  const updated: T[] = [];
  const skipped: T[] = [];

  const existingById = new Map(existing.map((e) => [e.id, e]));
  const existingByDisplayName = new Map(
    existing.map((e) => [getItemDisplayName(e).toLowerCase(), e])
  );

  for (const item of incoming) {
    if (existingById.has(item.id)) {
      // Same id — compare content
      const local = existingById.get(item.id)!;
      if (contentKey(local) === contentKey(item)) {
        skipped.push(item);
      } else {
        updated.push(item);
      }
    } else {
      // New id — check for name collision on display name
      const displayName = getItemDisplayName(item);
      const nameLower = displayName.toLowerCase();
      if (existingByDisplayName.has(nameLower)) {
        // Name collision on different id: add as "<name> (imported)"
        // For items with name (campaigns, presets): set name field
        // For workspace entries: set label field (name is user override, label is system label)
        if (typeof item.name === "string") {
          const renamed = { ...item, name: `${item.name} (imported)` };
          added.push(renamed as T);
        } else if (typeof item.label === "string") {
          const renamed = { ...item, label: `${item.label} (imported)` };
          added.push(renamed as T);
        } else {
          added.push(item);
        }
      } else {
        added.push(item);
        existingByDisplayName.set(nameLower, item); // track intra-bundle collisions
      }
    }
  }

  return { added, updated, skipped };
}

function campaignContentKey(c: Campaign): string {
  // Compare by name + savedAt + row count as a quick structural diff
  return `${c.name}|${c.savedAt}|${c.rows.length}`;
}

function presetContentKey(p: Preset): string {
  return `${p.name}|${JSON.stringify(p.values)}`;
}

function workspaceContentKey(w: MyWorkspaceEntry): string {
  return `${w.label}|${w.link}|${w.role}`;
}

function computeSettingsMergePlan(
  existing: ExistingState,
  bundle: SyncBundle
): SettingsMergePlan {
  const hasSpec = Boolean(bundle.spec);
  const hasTemplate = Boolean(bundle.namingTemplate);
  const hasLint = Boolean(bundle.lintSettings);
  const hasEditorName = typeof bundle.editorName === "string";
  const hasReviewerName = typeof bundle.reviewerName === "string";

  // Spec: local is non-default if any field has allowed values OR enforceSpec is on
  const localSpecNonDefault =
    existing.spec.enforceSpec ||
    Object.values(existing.spec.allowedValues).some((arr) => arr.length > 0);

  // Template: local is non-default if it has segments
  const localTemplateNonDefault = existing.namingTemplate.segments.length > 0;

  // Lint: non-default if any toggle differs from DEFAULT
  const localLintNonDefault =
    !existing.lintSettings.requiredParams ||
    !existing.lintSettings.lowercaseOnly ||
    !existing.lintSettings.noSpaces;

  return {
    specWouldOverwrite: hasSpec && localSpecNonDefault,
    templateWouldOverwrite: hasTemplate && localTemplateNonDefault,
    lintWouldOverwrite: hasLint && localLintNonDefault,
    editorNameWouldOverwrite: hasEditorName && existing.editorName.trim().length > 0,
    reviewerNameWouldOverwrite: hasReviewerName && existing.reviewerName.trim().length > 0,
  };
}

// ── Apply the plan ────────────────────────────────────────────────────────────

export interface ApplyOptions {
  /** When true, overwrite singleton settings (spec/template/lint/names) even when local is non-default. */
  overwriteSettings: boolean;
}

export interface ApplyResult {
  campaigns: Campaign[];
  presets: Preset[];
  myWorkspaces: MyWorkspaceEntry[];
  spec?: UtmSpec;
  namingTemplate?: NamingTemplate;
  lintSettings?: LintSettings;
  editorName?: string;
  reviewerName?: string;
}

/**
 * Apply a MergePlan and produce the new merged state.
 * EXACTLY what computeMergePlan described — preview and apply share this function.
 * NEVER throws. Returns undefined for settings fields that should remain unchanged.
 */
export function applyMergePlan(
  plan: MergePlan,
  options: ApplyOptions
): ApplyResult {
  const { _existing: existing, _bundle: bundle } = plan;

  // Merge campaigns: existing + (added) + (updated replaces in-place)
  const updatedIds = new Set(plan.campaigns.updated.map((c) => c.id));
  const updatedMap = new Map(plan.campaigns.updated.map((c) => [c.id, c]));
  const mergedCampaigns: Campaign[] = [
    ...existing.campaigns.map((c) => (updatedIds.has(c.id) ? updatedMap.get(c.id)! : c)),
    ...plan.campaigns.added,
  ];

  // Merge presets: same pattern
  const updatedPresetIds = new Set(plan.presets.updated.map((p) => p.id));
  const updatedPresetMap = new Map(plan.presets.updated.map((p) => [p.id, p]));
  const mergedPresets: Preset[] = [
    ...existing.presets.map((p) => (updatedPresetIds.has(p.id) ? updatedPresetMap.get(p.id)! : p)),
    ...plan.presets.added,
  ];

  // Merge myWorkspaces: same pattern
  const updatedWsIds = new Set(plan.myWorkspaces.updated.map((w) => w.id));
  const updatedWsMap = new Map(plan.myWorkspaces.updated.map((w) => [w.id, w]));
  const mergedWorkspaces: MyWorkspaceEntry[] = [
    ...existing.myWorkspaces.map((w) => (updatedWsIds.has(w.id) ? updatedWsMap.get(w.id)! : w)),
    ...plan.myWorkspaces.added,
  ];

  const result: ApplyResult = {
    campaigns: mergedCampaigns,
    presets: mergedPresets,
    myWorkspaces: mergedWorkspaces,
  };

  // Singleton settings: apply only when overwriteSettings OR local is default/empty
  const s = plan.settings;

  if (bundle.spec) {
    if (!s.specWouldOverwrite || options.overwriteSettings) {
      result.spec = bundle.spec;
    }
  }
  if (bundle.namingTemplate) {
    if (!s.templateWouldOverwrite || options.overwriteSettings) {
      result.namingTemplate = bundle.namingTemplate;
    }
  }
  if (bundle.lintSettings) {
    if (!s.lintWouldOverwrite || options.overwriteSettings) {
      result.lintSettings = bundle.lintSettings;
    }
  }
  if (typeof bundle.editorName === "string") {
    if (!s.editorNameWouldOverwrite || options.overwriteSettings) {
      result.editorName = bundle.editorName;
    }
  }
  if (typeof bundle.reviewerName === "string") {
    if (!s.reviewerNameWouldOverwrite || options.overwriteSettings) {
      result.reviewerName = bundle.reviewerName;
    }
  }

  return result;
}

// ── Serialize bundle from inputs ──────────────────────────────────────────────

/**
 * Build a versioned SyncBundle from caller-supplied values.
 * Filters out seeded presets (seeded: true) — those are app-level defaults, not user data.
 */
export function serializeBundle(inputs: BundleInputs): SyncBundle {
  // Strip seeded presets — they're app defaults, not user accumulation.
  const userPresets = inputs.presets.filter((p) => !p.seeded);

  return {
    app: BUNDLE_APP,
    version: BUNDLE_VERSION,
    exportedAt: Date.now(),
    campaigns: inputs.campaigns.length > 0 ? inputs.campaigns : undefined,
    presets: userPresets.length > 0 ? userPresets : undefined,
    spec: inputs.spec,
    namingTemplate: inputs.namingTemplate,
    lintSettings: inputs.lintSettings,
    editorName: inputs.editorName || undefined,
    reviewerName: inputs.reviewerName || undefined,
    myWorkspaces: inputs.myWorkspaces.length > 0 ? inputs.myWorkspaces : undefined,
  };
}

/**
 * Returns true when the bundle has at least some non-trivial content worth exporting.
 * Used to decide whether to disable the export actions.
 */
export function bundleHasContent(inputs: BundleInputs): boolean {
  if (inputs.campaigns.length > 0) return true;
  if (inputs.presets.filter((p) => !p.seeded).length > 0) return true;
  if (inputs.myWorkspaces.length > 0) return true;
  if (inputs.spec.enforceSpec || Object.values(inputs.spec.allowedValues).some((a) => a.length > 0)) return true;
  if (inputs.namingTemplate.segments.length > 0) return true;
  if (inputs.editorName.trim() || inputs.reviewerName.trim()) return true;
  return false;
}

/**
 * Build a human-readable summary line: "4 campaigns · 3 presets · UTM Spec · 2 saved workspaces"
 */
export function buildContentSummary(inputs: BundleInputs): string {
  const parts: string[] = [];
  if (inputs.campaigns.length > 0) {
    parts.push(`${inputs.campaigns.length} campaign${inputs.campaigns.length === 1 ? "" : "s"}`);
  }
  const userPresets = inputs.presets.filter((p) => !p.seeded);
  if (userPresets.length > 0) {
    parts.push(`${userPresets.length} preset${userPresets.length === 1 ? "" : "s"}`);
  }
  const hasSpec =
    inputs.spec.enforceSpec ||
    Object.values(inputs.spec.allowedValues).some((a) => a.length > 0);
  if (hasSpec) parts.push("UTM Spec");
  if (inputs.namingTemplate.segments.length > 0) parts.push("Naming Template");
  if (inputs.myWorkspaces.length > 0) {
    parts.push(`${inputs.myWorkspaces.length} saved workspace${inputs.myWorkspaces.length === 1 ? "" : "s"}`);
  }
  return parts.join(" · ") || "Nothing saved yet";
}
