"use client";

/**
 * SetupTransferPanel — cross-device "Move to another device" panel.
 *
 * Opens as a full-width stacked strip below the toolbar (D3/D10 in UX_BRIEF).
 * Two halves: EXPORT (top) and IMPORT (bottom).
 *
 * SSR rules:
 * - No window/localStorage in render or useState initializer.
 * - All localStorage reads happen in a mount useEffect (copy-confirmation-survives-tick-rerender).
 *
 * Zero-network invariant: export and import run entirely client-side.
 * The panel makes NO fetch/API calls.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  encodeBundle,
  decodeBundle,
  validateBundle,
  computeMergePlan,
  applyMergePlan,
  serializeBundle,
  bundleHasContent,
  buildContentSummary,
  type MergePlan,
  type ExistingState,
  type ApplyResult,
} from "../../lib/syncBundle";
import { writeClipboard } from "../../lib/share";
import {
  deserializeCampaigns,
  serializeCampaigns,
  type Campaign,
} from "../../lib/campaigns";
import {
  deserializeMyWorkspaces,
  serializeMyWorkspaces,
  MY_WORKSPACES_KEY,
  type MyWorkspaceEntry,
} from "../../lib/myWorkspaces";
import {
  DEFAULT_SPEC,
  deserializeSpec,
  type UtmSpec,
} from "../../lib/spec";
import {
  DEFAULT_NAMING_TEMPLATE,
  deserializeNamingTemplate,
  type NamingTemplate,
} from "../../lib/namingTemplate";
import {
  DEFAULT_LINT_SETTINGS,
  SEEDED_PRESETS,
  type LintSettings,
  type Preset,
} from "../../lib/types";

// ── localStorage key constants ─────────────────────────────────────────────────

const KEYS = {
  campaigns: "utm-grid:campaigns",
  presets: "utm-grid:presets",
  spec: "utm-grid:utm-spec",
  namingTemplate: "utm-grid:naming-template",
  lintSettings: "utm-grid:lint-settings",
  editorName: "utm-grid:editor-name",
  reviewerName: "utm-grid:reviewer-name",
  myWorkspaces: MY_WORKSPACES_KEY,
} as const;

// ── Helpers for direct localStorage reads ─────────────────────────────────────
// useLocalStorage stores values as JSON.stringify(value), so we parse once.
// Strings (e.g. campaigns JSON string) are double-encoded → parse twice.

function readParsed<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const once = JSON.parse(raw) as unknown;
    // If the result is a string (double-encoded by useLocalStorage), parse again
    if (typeof once === "string") {
      try { return JSON.parse(once) as T; } catch { return once as unknown as T; }
    }
    return once as T;
  } catch {
    return fallback;
  }
}

function readString(key: string): string {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return "";
    // May be double-encoded (useLocalStorage JSON.stringify's strings)
    const once = JSON.parse(raw) as unknown;
    if (typeof once === "string") return once;
    return "";
  } catch {
    return "";
  }
}

// ── Read all accumulation from localStorage ───────────────────────────────────

function readExistingState(): ExistingState {
  const campaignsRaw = readParsed<unknown>("utm-grid:campaigns", []);
  const campaigns = deserializeCampaigns(
    typeof campaignsRaw === "string"
      ? campaignsRaw
      : JSON.stringify(campaignsRaw)
  );

  const presetsRaw = readParsed<unknown[]>(KEYS.presets, []);
  const presets = Array.isArray(presetsRaw)
    ? (presetsRaw as Preset[]).filter(
        (p): p is Preset =>
          !!p && typeof p === "object" && typeof p.id === "string" && !p.seeded
      )
    : [];

  const specRaw = readParsed<unknown>(KEYS.spec, null);
  const spec = deserializeSpec(specRaw);

  const templateRaw = readParsed<unknown>(KEYS.namingTemplate, null);
  const namingTemplate = deserializeNamingTemplate(templateRaw);

  const lintRaw = readParsed<unknown>(KEYS.lintSettings, null);
  const lintSettings: LintSettings =
    lintRaw && typeof lintRaw === "object"
      ? ({ ...DEFAULT_LINT_SETTINGS, ...(lintRaw as Partial<LintSettings>) })
      : DEFAULT_LINT_SETTINGS;

  const editorName = readString(KEYS.editorName);
  const reviewerName = readString(KEYS.reviewerName);

  const wsRaw = window.localStorage.getItem(KEYS.myWorkspaces);
  const myWorkspaces = deserializeMyWorkspaces(wsRaw);

  return {
    campaigns,
    presets,
    spec,
    namingTemplate,
    lintSettings,
    editorName,
    reviewerName,
    myWorkspaces,
  };
}

// ── Write merged result back to localStorage ──────────────────────────────────

function writeMergedState(result: ApplyResult): void {
  // campaigns — stored as a double-encoded string by useLocalStorage (campaigns are stored
  // under key "utm-grid:campaigns" as JSON.stringify(JSON.stringify(Campaign[])))
  window.localStorage.setItem(
    KEYS.campaigns,
    JSON.stringify(serializeCampaigns(result.campaigns))
  );

  // presets
  window.localStorage.setItem(
    KEYS.presets,
    JSON.stringify(result.presets)
  );

  // myWorkspaces — stored directly as JSON (not double-encoded)
  window.localStorage.setItem(
    KEYS.myWorkspaces,
    serializeMyWorkspaces(result.myWorkspaces)
  );

  if (result.spec !== undefined) {
    window.localStorage.setItem(KEYS.spec, JSON.stringify(result.spec));
  }
  if (result.namingTemplate !== undefined) {
    window.localStorage.setItem(KEYS.namingTemplate, JSON.stringify(result.namingTemplate));
  }
  if (result.lintSettings !== undefined) {
    window.localStorage.setItem(KEYS.lintSettings, JSON.stringify(result.lintSettings));
  }
  if (result.editorName !== undefined) {
    // editor-name is stored as a JSON-stringified string (useLocalStorage double-encodes strings)
    window.localStorage.setItem(KEYS.editorName, JSON.stringify(result.editorName));
  }
  if (result.reviewerName !== undefined) {
    window.localStorage.setItem(KEYS.reviewerName, JSON.stringify(result.reviewerName));
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface SetupTransferPanelProps {
  onClose: () => void;
  /** Called after a successful import so parent can refresh its state. */
  onImportComplete: (result: ApplyResult) => void;
  /** Current presets from parent's state (includes seeded). */
  presets: Preset[];
  /** Current campaigns from parent's state. */
  campaigns: Campaign[];
  /** Current spec from parent's state. */
  spec: UtmSpec;
  /** Current naming template from parent's state. */
  namingTemplate: NamingTemplate;
  /** Current lint settings from parent's state. */
  lintSettings: LintSettings;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SetupTransferPanel({
  onClose,
  onImportComplete,
  presets,
  campaigns,
  spec,
  namingTemplate,
  lintSettings,
}: SetupTransferPanelProps) {
  // ── Export state ──────────────────────────────────────────────────────────────
  // SSR-safe: start with empty/default values; populate in mount effect
  const [contentSummary, setContentSummary] = useState("Loading…");
  const [hasContent, setHasContent] = useState(false);
  const [copyLabel, setCopyLabel] = useState<"idle" | "copied">("idle");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Import state ──────────────────────────────────────────────────────────────
  const [importCode, setImportCode] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [mergePlan, setMergePlan] = useState<MergePlan | null>(null);
  const [overwriteSettings, setOverwriteSettings] = useState(false);
  const [importDone, setImportDone] = useState(false);

  // Derived summary counts from merge plan
  const totalAdded = mergePlan
    ? mergePlan.campaigns.added.length + mergePlan.presets.added.length + mergePlan.myWorkspaces.added.length
    : 0;
  const totalUpdated = mergePlan
    ? mergePlan.campaigns.updated.length + mergePlan.presets.updated.length + mergePlan.myWorkspaces.updated.length
    : 0;
  const totalSkipped = mergePlan
    ? mergePlan.campaigns.skipped.length + mergePlan.presets.skipped.length + mergePlan.myWorkspaces.skipped.length
    : 0;
  const settingsWouldOverwrite = mergePlan
    ? mergePlan.settings.specWouldOverwrite ||
      mergePlan.settings.templateWouldOverwrite ||
      mergePlan.settings.lintWouldOverwrite ||
      mergePlan.settings.editorNameWouldOverwrite ||
      mergePlan.settings.reviewerNameWouldOverwrite
    : false;

  // Populate export summary on mount (SSR-safe: in useEffect)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const editorName = readString(KEYS.editorName);
    const reviewerName = readString(KEYS.reviewerName);
    const wsRaw = window.localStorage.getItem(KEYS.myWorkspaces);
    const myWorkspaces = deserializeMyWorkspaces(wsRaw);

    const inputs = {
      campaigns,
      presets,
      spec,
      namingTemplate,
      lintSettings,
      editorName,
      reviewerName,
      myWorkspaces,
    };
    setContentSummary(buildContentSummary(inputs));
    setHasContent(bundleHasContent(inputs));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaigns.length, presets.length]);

  // ── Export handlers ───────────────────────────────────────────────────────────

  const buildExportInputs = useCallback(() => {
    if (typeof window === "undefined") return null;
    const editorName = readString(KEYS.editorName);
    const reviewerName = readString(KEYS.reviewerName);
    const wsRaw = window.localStorage.getItem(KEYS.myWorkspaces);
    const myWorkspaces = deserializeMyWorkspaces(wsRaw);
    return { campaigns, presets, spec, namingTemplate, lintSettings, editorName, reviewerName, myWorkspaces };
  }, [campaigns, presets, spec, namingTemplate, lintSettings]);

  const handleDownloadJson = useCallback(() => {
    const inputs = buildExportInputs();
    if (!inputs) return;
    const bundle = serializeBundle(inputs);
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `utm-grid-setup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [buildExportInputs]);

  const handleCopyCode = useCallback(async () => {
    const inputs = buildExportInputs();
    if (!inputs) return;
    const bundle = serializeBundle(inputs);
    const code = encodeBundle(bundle);
    await writeClipboard(code);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setCopyLabel("copied");
    copyTimer.current = setTimeout(() => {
      setCopyLabel("idle");
      copyTimer.current = null;
    }, 1800);
  }, [buildExportInputs]);

  // ── Import handlers ────────────────────────────────────────────────────────────

  const handleParseCode = useCallback((raw: string) => {
    setImportError(null);
    setMergePlan(null);
    setImportDone(false);
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Try decoding as base64url code first, then try raw JSON
    let bundleObj: unknown = null;
    const decoded = decodeBundle(trimmed);
    if (decoded.ok) {
      bundleObj = decoded.bundle;
    } else {
      // Try raw JSON (uploaded .json file content pasted)
      try {
        bundleObj = JSON.parse(trimmed);
      } catch {
        setImportError("That doesn't look like a UTM Grid setup code. Your saved data is unchanged.");
        return;
      }
    }

    const validated = validateBundle(bundleObj);
    if (!validated.ok) {
      setImportError(validated.error);
      return;
    }

    // Compute merge plan against current localStorage state
    if (typeof window === "undefined") return;
    const existing = readExistingState();
    const plan = computeMergePlan(existing, validated.bundle);
    setMergePlan(plan);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === "string") {
        setImportCode(content);
        handleParseCode(content);
      }
    };
    reader.readAsText(file);
    // Reset input so re-uploading the same file works
    e.target.value = "";
  }, [handleParseCode]);

  const handleConfirmImport = useCallback(() => {
    if (!mergePlan) return;
    const result = applyMergePlan(mergePlan, { overwriteSettings });
    writeMergedState(result);
    setImportDone(true);
    setMergePlan(null);
    setImportCode("");
    onImportComplete(result);
  }, [mergePlan, overwriteSettings, onImportComplete]);

  const handleCancelImport = useCallback(() => {
    setMergePlan(null);
    setImportCode("");
    setImportError(null);
    setOverwriteSettings(false);
  }, []);

  // ── Named items for merge summary display ─────────────────────────────────────

  function displayName(item: {name?: string; label?: string; id: string}): string {
    return item.name ?? item.label ?? item.id;
  }

  function summarizeBucket(label: string, added: {name?: string; label?: string; id: string}[], updated: {name?: string; label?: string; id: string}[], skipped: {name?: string; label?: string; id: string}[]): React.ReactNode {
    const parts: React.ReactNode[] = [];
    if (added.length > 0) {
      parts.push(
        <span key="added" className="text-green-700">
          <span className="font-semibold">{added.length} added</span>
          {added.length <= 3 && (
            <span className="text-gray-500">{" — "}{added.map(i => `"${displayName(i)}"`).join(", ")}</span>
          )}
        </span>
      );
    }
    if (updated.length > 0) {
      parts.push(
        <span key="updated" className="text-blue-700">
          <span className="font-semibold">{updated.length} updated</span>
          {updated.length <= 3 && (
            <span className="text-gray-500">{" — "}{updated.map(i => `"${displayName(i)}"`).join(", ")}</span>
          )}
        </span>
      );
    }
    if (skipped.length > 0) {
      parts.push(
        <span key="skipped" className="text-gray-500">
          <span className="font-semibold">{skipped.length} skipped</span>
        </span>
      );
    }
    if (parts.length === 0) return null;
    return (
      <div className="text-xs mt-0.5">
        <span className="font-medium text-gray-700">{label}: </span>
        {parts.map((p, i) => (
          <span key={i}>{i > 0 && " · "}{p}</span>
        ))}
      </div>
    );
  }

  return (
    <div
      data-testid="setup-transfer-panel"
      className="rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Move to another device</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Export your setup as a file or code, then import it on your other device.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Move to another device panel"
          className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">

        {/* ── EXPORT half ──────────────────────────────────────────────────────── */}
        <div className="p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Export — move this device&apos;s setup
          </h3>

          {/* Privacy reassurance */}
          <p className="text-xs text-gray-500 leading-relaxed">
            This is your own local data — nothing is uploaded.
            Your shared workspaces already live online; this bundle just carries the secret links back.
          </p>

          {/* Content summary */}
          <div className="text-xs text-gray-600 bg-gray-50 rounded-md px-3 py-2">
            {contentSummary === "Nothing saved yet" ? (
              <span className="text-gray-400 italic">Nothing saved yet</span>
            ) : contentSummary}
          </div>

          {hasContent ? (
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Download .json */}
              <button
                type="button"
                data-testid="setup-transfer-download-btn"
                onClick={handleDownloadJson}
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Download .json
              </button>

              {/* Copy code — confirmation green-fill-in-place (D5 / copy-confirmation-survives-tick-rerender) */}
              <button
                type="button"
                data-testid="setup-transfer-copy-btn"
                aria-label="Copy setup code"
                onClick={handleCopyCode}
                aria-live="polite"
                className={`flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors duration-200 ${
                  copyLabel === "copied"
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                {copyLabel === "copied" ? "✓ Code copied!" : "Copy code"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-400 cursor-not-allowed"
                >
                  Download .json
                </button>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-400 cursor-not-allowed"
                >
                  Copy code
                </button>
              </div>
              <p
                role="status"
                className="text-xs text-gray-500 italic"
              >
                Nothing saved yet — create a campaign, preset, or workspace first, then come back to move it.
              </p>
            </div>
          )}
        </div>

        {/* ── IMPORT half ──────────────────────────────────────────────────────── */}
        <div className="p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Import — bring a setup onto this device
          </h3>

          <p className="text-xs text-gray-500 leading-relaxed">
            We merge into what&apos;s already here — we never overwrite your saved campaigns.
          </p>

          {importDone ? (
            <div role="status" aria-live="polite" className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700 font-medium">
              ✓ Import complete! Your setup has been merged.
              <button
                type="button"
                onClick={() => { setImportDone(false); setImportCode(""); }}
                className="ml-2 text-green-600 underline hover:no-underline"
              >
                Import another
              </button>
            </div>
          ) : mergePlan ? (
            /* Pre-apply merge summary */
            <div className="space-y-3">
              <div
                data-testid="merge-summary"
                className="rounded-md bg-blue-50 border border-blue-100 px-3 py-3 space-y-1"
              >
                <p className="text-xs font-semibold text-blue-800 mb-1.5">
                  What will be merged:
                </p>

                {/* Top-level summary line */}
                <p className="text-xs text-gray-700">
                  <span
                    data-testid="merge-summary-added"
                    className="font-semibold text-green-700"
                  >
                    {totalAdded} added
                  </span>
                  {" · "}
                  <span
                    data-testid="merge-summary-updated"
                    className="font-semibold text-blue-700"
                  >
                    {totalUpdated} updated
                  </span>
                  {" · "}
                  <span
                    data-testid="merge-summary-skipped"
                    className="font-semibold text-gray-500"
                  >
                    {totalSkipped} skipped
                  </span>
                </p>

                {/* Per-bucket breakdown */}
                {summarizeBucket("Campaigns", mergePlan.campaigns.added, mergePlan.campaigns.updated, mergePlan.campaigns.skipped)}
                {summarizeBucket("Presets", mergePlan.presets.added, mergePlan.presets.updated, mergePlan.presets.skipped)}
                {summarizeBucket("Workspaces", mergePlan.myWorkspaces.added, mergePlan.myWorkspaces.updated, mergePlan.myWorkspaces.skipped)}

                {/* Settings overwrite opt-in */}
                {settingsWouldOverwrite && (
                  <label className="flex items-start gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      data-testid="overwrite-settings-checkbox"
                      checked={overwriteSettings}
                      onChange={(e) => setOverwriteSettings(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span className="text-xs text-gray-700">
                      Also overwrite my current UTM Spec, Naming Template, and lint settings with the imported ones.
                      <span className="text-amber-600"> (your current settings will be replaced)</span>
                    </span>
                  </label>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  data-testid="confirm-import-btn"
                  onClick={handleConfirmImport}
                  className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Confirm import
                </button>
                <button
                  type="button"
                  data-testid="cancel-import-btn"
                  onClick={handleCancelImport}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Paste/upload input */
            <div className="space-y-3">
              <textarea
                data-testid="import-code-textarea"
                value={importCode}
                onChange={(e) => {
                  setImportCode(e.target.value);
                  setImportError(null);
                  if (!e.target.value.trim()) {
                    setMergePlan(null);
                  }
                }}
                placeholder="Paste your setup code here…"
                rows={4}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-mono text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />

              {/* Error message */}
              {importError && (
                <p
                  role="alert"
                  data-testid="import-error"
                  className="text-xs text-red-600 leading-relaxed"
                >
                  {importError}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  data-testid="parse-code-btn"
                  onClick={() => handleParseCode(importCode)}
                  disabled={!importCode.trim()}
                  className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Preview import
                </button>

                {/* Upload .json */}
                <label
                  className="flex-1 flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Upload .json
                  <input
                    type="file"
                    accept=".json,application/json"
                    data-testid="import-file-input"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Roadmap tease — informational only, not a CTA */}
      <div className="border-t border-gray-100 px-4 py-2.5">
        <p className="text-xs text-gray-400 text-center">
          Coming soon: optional accounts sync your setup automatically — no export step. This manual move is free and always will be.
        </p>
      </div>
    </div>
  );
}
