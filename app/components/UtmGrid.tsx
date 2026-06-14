"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  autoMapHeaders,
  csvToRows,
  parseCsv,
  rowsToCsv,
  type MappableField,
} from "../../lib/csv";
import { groupWarnings, hasCellFix, lintRows, warningKey, type LintWarning } from "../../lib/lint";
import { isCellFixable, normalizeAllRows, normalizeValue } from "../../lib/normalize";
import { buildShareUrl, extractSpecFromPayload, parseShareHash, writeClipboard } from "../../lib/share";
import {
  DEFAULT_LINT_SETTINGS,
  SEEDED_PRESETS,
  emptyRow,
  FIELD_LABELS,
  UTM_FIELDS,
  type LintSettings,
  type Preset,
  type UtmField,
  type UtmRow,
} from "../../lib/types";
import { DEFAULT_SPEC, SAMPLE_SPEC, nearestAllowedValue, type UtmSpec } from "../../lib/spec";
import {
  DEFAULT_NAMING_TEMPLATE,
  deserializeNamingTemplate,
  type NamingTemplate,
} from "../../lib/namingTemplate";
import { buildUtmUrl } from "../../lib/utm";
import { useLocalStorage } from "../../lib/useLocalStorage";
import { ImportDialog, type ImportMode, type PendingImport } from "./ImportDialog";
import { AuditDialog, type AuditMode } from "./AuditDialog";
import { AuditSummaryPanel } from "./AuditSummaryPanel";
import { ComplianceReportPanel } from "./ComplianceReportPanel";
import {
  computeLaunchCheckSummary,
  type LaunchCheckSummary,
} from "../../lib/launchCheck";
import { NamingTemplatePanel } from "./NamingTemplatePanel";
import { BuildNameComposer } from "./BuildNameComposer";
import { parseUtmUrls, type ParsedLine } from "../../lib/utm";
import { PresetsBar } from "./PresetsBar";
import { CampaignsSidebar } from "./CampaignsSidebar";
import { BulkEditBar, type BulkColumn } from "./BulkEditBar";
import { UtmSpecPanel } from "./UtmSpecPanel";
import {
  deserializeCampaigns,
  extractSpecFromCampaign,
  extractNamingTemplateFromCampaign,
  serializeCampaigns,
  findCampaign,
  type Campaign,
} from "../../lib/campaigns";
import { extractNamingTemplateFromPayload } from "../../lib/share";
import type { WorkspacePayload } from "../../lib/workspace";
import type { ReviewMap } from "../../lib/review";
import {
  computeReviewRollup,
  getRowReviewState,
  getRowReviewEntry,
  setRowReview,
  clearRowReview,
} from "../../lib/review";
import { ReviewBadge } from "./ReviewBadge";
import { QrPopover } from "./QrPopover";
import {
  filterValidQrRows,
  buildQrResultMessage,
  stableQrFilename,
  contactSheetLabel,
  BLOCKING_QR_LINT_RULES,
} from "../../lib/qr";

type EditableField = "baseUrl" | UtmField;
const COLUMNS: EditableField[] = ["baseUrl", ...UTM_FIELDS];

const INITIAL_ROWS: UtmRow[] = [emptyRow("row-1")];

// ── Undo stack ────────────────────────────────────────────────────────────────
interface UndoEntry {
  rows: UtmRow[];
  label: string;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
interface Toast {
  id: number;
  message: string;
  undoLabel?: string;
}

export interface UtmGridProps {
  /**
   * Optional prefix for all localStorage keys.
   * Default "" preserves the existing keys byte-for-byte (no regression).
   * Workspace mode passes e.g. "ws:<id>:" so workspace state is isolated.
   */
  storageKeyPrefix?: string;
  /**
   * When set, UtmGrid calls this callback (debounced in the page) whenever
   * rows/settings/spec change. Used by the workspace page for autosave.
   */
  onStateChange?: (payload: WorkspacePayload) => void;
  /**
   * Seed data from server on mount. When provided, UtmGrid uses this data
   * as the initial value (server wins over any stale prefixed localStorage).
   * The workspace page writes this into prefixed localStorage before mounting
   * so useLocalStorage picks it up on first snapshot.
   */
  initialWorkspace?: WorkspacePayload;
  /**
   * P0-1: When true, the grid is in Preview read-only mode.
   * All cell inputs are disabled/readOnly with locked visual treatment.
   * Zero PUT/autosave fires while previewing (handled by the parent).
   */
  isPreview?: boolean;
  /**
   * P0-3: Sync status for the UTM Spec panel in workspace mode.
   * "saving" → amber "Saving…" in panel header.
   * "saved" → green "Synced · saved just now" (or relative time).
   * "error" → red "Couldn't save".
   * undefined → no status rendered (default / non-workspace mode).
   */
  specSyncStatus?: "saving" | "saved" | "error" | null;
  /** Timestamp of last successful spec sync (for relative time display). */
  specSavedAt?: number | null;
  /**
   * When provided (workspace mode only): the current review map from server payload.
   * Enables per-row Review badges. Absent on main builder / Rung 1 share links.
   */
  reviewMap?: ReviewMap;
  /**
   * Called when the reviewer changes a row's review state.
   * Parent updates the workspace payload and triggers autosave.
   */
  onReviewChange?: (newReviewMap: ReviewMap) => void;
  /** The reviewer's display name from localStorage (for the ReviewBadge popover). */
  reviewerName?: string;
  /**
   * FIX A: Called when reviewer sets/changes their name inside the review popover.
   * Parent persists to the unified editor-name localStorage key.
   */
  onReviewerNameChange?: (name: string) => void;
}

export function UtmGrid({
  storageKeyPrefix = "",
  onStateChange,
  initialWorkspace: _initialWorkspace,
  isPreview = false,
  specSyncStatus,
  specSavedAt,
  reviewMap,
  onReviewChange,
  reviewerName = "",
  onReviewerNameChange,
}: UtmGridProps = {}) {
  const router = useRouter();

  // Key helper — prepend the prefix to isolate workspace keys from default keys.
  const key = (k: string) => `${storageKeyPrefix}${k}`;

  const [storedRows, setStoredRows] = useLocalStorage<UtmRow[]>(key("utm-grid:rows"), INITIAL_ROWS, {
    debounceMs: 400,
  });
  const storedRowsNormalized =
    Array.isArray(storedRows) && storedRows.length > 0 ? storedRows : INITIAL_ROWS;

  const idCounter = useRef(1);
  // newId is defined after rows is resolved below.

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [auditStatus, setAuditStatus] = useState<string | null>(null);
  const auditStatusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Fix 1/2/3/4: persistent post-audit summary (grouped warnings + skipped lines)
  const [auditSummaryInfo, setAuditSummaryInfo] = useState<{
    parsedCount: number;
    auditedRowIds: Set<string>;
    skipped: ParsedLine[];
  } | null>(null);
  // Ref for the table container — used to auto-scroll to the first utm_* column after audit
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  // ── Launch Check / Compliance Report state ────────────────────────────────
  // Initialized null (no report on cold open). Set ONLY in the button's event handler
  // so there is no SSR/hydration mismatch (no browser read in render or useState lazy init).
  const [complianceReport, setComplianceReport] = useState<LaunchCheckSummary | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build-name composer: rowId of the open popover (null = closed).
  const [composerOpenRowId, setComposerOpenRowId] = useState<string | null>(null);
  // Fix 5: anchor rect for portal-based popover positioning (never clipped by overflow).
  const [composerAnchorRect, setComposerAnchorRect] = useState<DOMRect | null>(null);

  // ── Share link state ───────────────────────────────────────────────────────
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const shareCopyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // P1-2b: "Copy all URLs" green cue — ref-stable, same pattern as shareLinkCopied.
  const [copyAllCopied, setCopyAllCopied] = useState(false);
  const copyAllTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sharedBanner, setSharedBanner] = useState<{ rowCount: number; specRuleCount: number } | null>(null);

  const pendingSharedState = useRef<{ rows: UtmRow[]; settings: LintSettings } | null>(null);

  const [isUsingSharedState, setIsUsingSharedState] = useState(false);

  const [sharedRows, setSharedRows] = useState<UtmRow[] | null>(null);
  const [sharedSettings, setSharedSettings] = useState<LintSettings | null>(null);
  // Shared-state overlay for spec (analogous to sharedRows / sharedSettings)
  // Declared here (before the useEffect below) to avoid "accessed before declared" lint error.
  const [sharedSpec, setSharedSpec] = useState<UtmSpec | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const payload = parseShareHash(hash);
    if (!payload) return;
    history.replaceState(null, "", window.location.pathname + window.location.search);

    // P0-1: When the URL has a #g= fragment, the shared grid takes DISPLAY precedence
    // over any existing localStorage grid — no confirm, no overwrite.
    // The shared state is shown in-memory only; localStorage is not touched until the
    // visitor edits a cell (commitSharedToStorage / setRows does that).

    const payloadSpec = extractSpecFromPayload(payload);
    const payloadNamingTemplate = extractNamingTemplateFromPayload(payload);
    pendingSharedState.current = { rows: payload.rows, settings: payload.settings };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSharedRows(payload.rows);
    setSharedSettings(payload.settings);
    setSharedSpec(payloadSpec);
    setSharedNamingTemplate(payloadNamingTemplate);
    setIsUsingSharedState(true);
    // P0-3a: count actual allowed-value rules (sum of allowed values per field), independent of enforceSpec flag.
    const specRuleCount = Object.values(payloadSpec.allowedValues).reduce((sum, arr) => sum + arr.length, 0);
    setSharedBanner({ rowCount: payload.rows.length, specRuleCount });

    // P0-2: collapse the marketing hero to a muted one-liner on shared-link landing.
    const heroEl = document.getElementById("utm-hero");
    if (heroEl) {
      heroEl.setAttribute("data-shared-landing", "true");
    }

    // P0-2: scroll the first grid row/card into view after the shared grid renders.
    // We defer to the next paint so the DOM has updated with the shared rows.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const firstCard = document.querySelector("[data-testid^='copy-url-row-1']") ??
          document.querySelector("tbody tr:first-child") ??
          document.getElementById("utm-grid-first-row");
        if (firstCard) firstCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flash state: rowId:field → "green" for brief cell highlight
  const [flashCells, setFlashCells] = useState<Set<string>>(new Set());

  // Undo stack (in-memory only)
  const undoStack = useRef<UndoEntry[]>([]);
  const [undoCount, setUndoCount] = useState(0);
  const pushUndo = useCallback((label: string, beforeRows: UtmRow[]) => {
    undoStack.current = [...undoStack.current.slice(-19), { rows: beforeRows, label }];
    setUndoCount(undoStack.current.length);
  }, []);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const toastTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback((message: string, opts?: { undoLabel?: string; durationMs?: number }) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, undoLabel: opts?.undoLabel }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      toastTimers.current.delete(id);
    }, opts?.durationMs ?? 3000);
    toastTimers.current.set(id, timer);
    return id;
  }, []);

  const dismissToast = useCallback((id: number) => {
    const t = toastTimers.current.get(id);
    if (t) { clearTimeout(t); toastTimers.current.delete(id); }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const undo = useCallback(() => {
    const entry = undoStack.current.pop();
    if (!entry) return;
    setUndoCount(undoStack.current.length);
    setStoredRows(entry.rows);
    showToast(`Undid: ${entry.label}`);
  }, [setStoredRows, showToast]);

  const [storedSettings, setStoredSettings] = useLocalStorage<LintSettings>(
    key("utm-grid:lint-settings"),
    DEFAULT_LINT_SETTINGS
  );

  // ── UTM Spec state ─────────────────────────────────────────────────────────
  const [storedSpec, setStoredSpec] = useLocalStorage<UtmSpec>(
    key("utm-grid:utm-spec"),
    DEFAULT_SPEC
  );

  // ── Naming Template state ──────────────────────────────────────────────────
  const [storedNamingTemplate, setStoredNamingTemplate] = useLocalStorage<NamingTemplate>(
    key("utm-grid:naming-template"),
    DEFAULT_NAMING_TEMPLATE
  );
  // Shared-state overlay for namingTemplate (analogous to sharedSpec).
  const [sharedNamingTemplate, setSharedNamingTemplate] = useState<NamingTemplate | null>(null);

  // P1 hydration-guard: on mount, read naming template directly from localStorage to ensure
  // segments + enforceTemplate hydrate correctly on a cold page load with existing stored data.
  // This mirrors the exact pattern used for openCampaignId (didRehydrateOpenId).
  // Root cause: useSyncExternalStore returns DEFAULT_NAMING_TEMPLATE on the server snapshot;
  // if the first client render doesn't trigger a synchronous state update (e.g. due to
  // effect scheduling), the NamingTemplatePanel may miss the stored segments.
  // Reading directly from window.localStorage inside useEffect bypasses the closure staleness.
  const didRehydrateNamingTemplate = useRef(false);
  useEffect(() => {
    if (didRehydrateNamingTemplate.current) return;
    didRehydrateNamingTemplate.current = true;
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(key("utm-grid:naming-template"));
    if (!raw) return;
    try {
      // useLocalStorage stores JSON.stringify(value) → parse once to get the object.
      const parsed = JSON.parse(raw) as unknown;
      const recovered = deserializeNamingTemplate(parsed);
      // Only update if the recovered template has segments or enforceTemplate is on —
      // i.e., it differs meaningfully from the SSR default (empty, enforce off).
      if (recovered.segments.length > 0 || recovered.enforceTemplate) {
        setStoredNamingTemplate(recovered);
      }
    } catch {
      // Corrupt JSON — keep current value.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Campaigns + presets stay LOCAL-only. In workspace mode, skip them (not part of workspace payload).
  // storageKeyPrefix === "" means default mode; non-empty means workspace mode.
  const isWorkspaceMode = storageKeyPrefix !== "";

  const [userPresets, setPresets] = useLocalStorage<Preset[]>(key("utm-grid:presets"), []);
  const [newRowPresetId, setNewRowPresetId] = useLocalStorage<string | null>(
    key("utm-grid:new-row-preset"),
    null
  );

  // ── Campaigns library state ────────────────────────────────────────────────
  // Stored as JSON string in localStorage (reuses the same store pattern).
  // In workspace mode we still call useLocalStorage (hooks can't be conditional)
  // but we don't render or surface the campaigns UI.
  const [rawCampaigns, setRawCampaigns] = useLocalStorage<string>(
    key("utm-grid:campaigns"),
    "[]"
  );
  // Parse the JSON on each render — cheap enough (typically <20 items).
  const campaigns = useMemo(
    () => deserializeCampaigns(typeof rawCampaigns === "string" ? rawCampaigns : "[]"),
    [rawCampaigns]
  );
  const setCampaigns = useCallback(
    (next: Campaign[]) => setRawCampaigns(serializeCampaigns(next)),
    [setRawCampaigns]
  );

  // Which campaign is currently "open" (null = scratch grid).
  // SSR-safe: initialize to null; rehydrate from localStorage in a useEffect.
  const [openCampaignId, setOpenCampaignId] = useState<string | null>(null);

  // Fix E: persist openCampaignId across reload — rehydrate AFTER mount (client-only).
  const [storedOpenId, setStoredOpenId] = useLocalStorage<string | null>(
    key("utm-grid:open-campaign-id"),
    null
  );
  // One-time rehydration on mount (client-only, SSR-safe).
  // Read directly from window.localStorage inside the effect — the useSyncExternalStore
  // client snapshot from useLocalStorage is still null at mount time (React #418 pattern),
  // so the closure value `storedOpenId` would always be null here. Same fix applied
  // previously to the share-link rehydration.
  const didRehydrateOpenId = useRef(false);
  useEffect(() => {
    if (didRehydrateOpenId.current) return;
    didRehydrateOpenId.current = true;
    if (typeof window === "undefined") return;

    // useLocalStorage persists via JSON.stringify(value). When value is already a
    // string (e.g. the campaign id or the serialized campaigns array), the stored
    // representation is double-encoded: JSON.stringify(JSON.stringify(x)). A single
    // JSON.parse yields a string, not the desired typed value. This helper decodes
    // once, and if the result is still a JSON-looking string, decodes again.
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

    const rawId = window.localStorage.getItem(key("utm-grid:open-campaign-id"));
    if (!rawId) return;
    const parsedId = robustParse<string>(rawId);
    if (!parsedId || typeof parsedId !== "string") return;

    // Validate against existing saved campaigns (read directly too, for the same reason).
    const rawCampaignsStored = window.localStorage.getItem(key("utm-grid:campaigns"));
    let existingIds: Set<string> = new Set();
    if (rawCampaignsStored) {
      const parsedCampaigns = robustParse<unknown>(rawCampaignsStored);
      if (Array.isArray(parsedCampaigns)) {
        existingIds = new Set(parsedCampaigns.map((c: { id?: string }) => c.id).filter((id): id is string => Boolean(id)));
      }
    }
    if (existingIds.has(parsedId)) {
      setOpenCampaignId(parsedId);
    } else {
      // Campaign was deleted — clear the stale persisted id.
      window.localStorage.removeItem(key("utm-grid:open-campaign-id"));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whether the working grid differs from the open campaign's saved state
  const [isDirty, setIsDirty] = useState(false);

  // savedFlash: green pill/button for ~2s after a successful save (ref-stable timer)
  const [savedFlash, setSavedFlash] = useState(false);
  const savedFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FIX 3: Helper — clear the "Saved!" flash immediately (called when grid becomes dirty).
  // Using a ref+callback avoids a useEffect dependency loop.
  const clearSavedFlash = useCallback(() => {
    if (savedFlashTimer.current) {
      clearTimeout(savedFlashTimer.current);
      savedFlashTimer.current = null;
    }
    setSavedFlash(false);
  }, []);

  // ── Effective rows / settings / spec / namingTemplate (shared or stored) ──
  const rows: UtmRow[] = isUsingSharedState && sharedRows ? sharedRows : storedRowsNormalized;
  const settings: LintSettings = isUsingSharedState && sharedSettings ? sharedSettings : storedSettings;
  const spec: UtmSpec = isUsingSharedState && sharedSpec ? sharedSpec : storedSpec;
  // SSR-safe: storedNamingTemplate from useLocalStorage starts as DEFAULT_NAMING_TEMPLATE
  // until the client snapshot fires; this is fine (same pattern as storedSpec).
  const namingTemplate: NamingTemplate =
    isUsingSharedState && sharedNamingTemplate
      ? sharedNamingTemplate
      : (storedNamingTemplate ?? DEFAULT_NAMING_TEMPLATE);

  const newId = (current: UtmRow[] = rows) => {
    for (const r of current) {
      const m = /^row-(\d+)$/.exec(r.id);
      if (m) idCounter.current = Math.max(idCounter.current, Number(m[1]));
    }
    return `row-${++idCounter.current}`;
  };

  const commitSharedToStorage = useCallback(() => {
    if (!isUsingSharedState || !pendingSharedState.current) return;
    const { rows: sRows, settings: sSettings } = pendingSharedState.current;
    setStoredRows(sRows);
    setStoredSettings(sSettings);
    if (sharedSpec) setStoredSpec(sharedSpec);
    if (sharedNamingTemplate) setStoredNamingTemplate(sharedNamingTemplate);
    pendingSharedState.current = null;
    setSharedRows(null);
    setSharedSettings(null);
    setSharedSpec(null);
    setSharedNamingTemplate(null);
    setIsUsingSharedState(false);
    setSharedBanner(null);
  }, [isUsingSharedState, setStoredRows, setStoredSettings, sharedSpec, setStoredSpec, sharedNamingTemplate, setStoredNamingTemplate]);

  const setRows = useCallback(
    (next: UtmRow[] | ((prev: UtmRow[]) => UtmRow[])) => {
      if (isUsingSharedState) {
        const sRows = pendingSharedState.current?.rows ?? storedRowsNormalized;
        const sSettings = pendingSharedState.current?.settings ?? storedSettings;
        const nextRows = typeof next === "function" ? next(sRows) : next;
        setStoredRows(nextRows);
        setStoredSettings(sSettings);
        if (sharedSpec) setStoredSpec(sharedSpec);
        if (sharedNamingTemplate) setStoredNamingTemplate(sharedNamingTemplate);
        pendingSharedState.current = null;
        setSharedRows(null);
        setSharedSettings(null);
        setSharedSpec(null);
        setSharedNamingTemplate(null);
        setIsUsingSharedState(false);
        setSharedBanner(null);
      } else {
        setStoredRows(next);
      }
      // Mark dirty when working grid changes while a campaign is open.
      // FIX 3: also clear any "Saved!" flash so the pill shows amber "unsaved changes".
      setIsDirty(true);
      clearSavedFlash();
    },
    [isUsingSharedState, storedRowsNormalized, storedSettings, sharedSpec, setStoredSpec, sharedNamingTemplate, setStoredNamingTemplate, setStoredRows, setStoredSettings, clearSavedFlash]
  );

  const setSettings = useCallback(
    (next: LintSettings | ((prev: LintSettings) => LintSettings)) => {
      if (isUsingSharedState) {
        commitSharedToStorage();
      }
      setStoredSettings(next);
      // FIX 3: also clear any "Saved!" flash so the pill shows amber "unsaved changes".
      setIsDirty(true);
      clearSavedFlash();
    },
    [isUsingSharedState, commitSharedToStorage, setStoredSettings, clearSavedFlash]
  );

  const allPresets = useMemo(() => [...SEEDED_PRESETS, ...userPresets], [userPresets]);

  const warnings = useMemo(
    () => groupWarnings(lintRows(rows, settings, spec, namingTemplate)),
    [rows, settings, spec, namingTemplate]
  );

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;

  const flashCopied = (key: string) => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setCopied(key);
    copyTimer.current = setTimeout(() => setCopied(null), 1500);
  };

  const flashCellKeys = useCallback((keys: string[]) => {
    setFlashCells(new Set(keys));
    setTimeout(() => setFlashCells(new Set()), 1200);
  }, []);

  const updateCell = (rowId: string, field: EditableField, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
    // P2: touching any cell removes the "fresh preset row" status so real validation resumes
    if (presetFreshRows.has(rowId)) {
      setPresetFreshRows((prev) => { const n = new Set(prev); n.delete(rowId); return n; });
    }
  };

  const fixCell = (rowId: string, field: UtmField, currentValue: string) => {
    const fixed = normalizeValue(currentValue, settings);
    if (fixed === currentValue) return;
    pushUndo("Fix cell", rows);
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: fixed } : r))
    );
    flashCellKeys([`${rowId}:${field}`]);
    showToast("Fixed 1 cell");
  };

  // P2b backlog: when the grid carries an allowed-value spec, "Fix all naming" should
  // prefer the spec's allowed value (e.g. `paid-social`) over the generic underscore rule
  // (`paid_social`). Skipped — requires matching each cell to nearest allowed value during
  // normalizeAllRows, which requires spec context not currently threaded into normalize.ts.
  const cleanAll = () => {
    const { rows: cleaned, count } = normalizeAllRows(rows, settings);
    if (count === 0) { showToast("Nothing to fix — all cells are clean."); return; }
    pushUndo("Auto-fix naming", rows);
    setRows(cleaned);
    const keys: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      if (cleaned[i] !== rows[i]) {
        for (const f of UTM_FIELDS) {
          if (cleaned[i][f] !== rows[i][f]) keys.push(`${rows[i].id}:${f}`);
        }
      }
    }
    flashCellKeys(keys);
    showToast(`Auto-fixed ${count} cell${count === 1 ? "" : "s"} — Undo`, { undoLabel: "Undo", durationMs: 5000 });
  };

  const addRow = () => {
    const row = emptyRow(newId());
    const preset = allPresets.find((p) => p.id === newRowPresetId);
    if (preset) Object.assign(row, preset.values);
    setRows((prev) => [...prev, row]);
    setSelectedId(row.id);
  };

  const duplicateRow = (rowId: string) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === rowId);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: newId(prev) };
      return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
    });
  };

  const deleteRow = (rowId: string) => {
    pushUndo("Delete row", rows);
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== rowId);
      return next.length > 0 ? next : [emptyRow(newId(prev))];
    });
    if (selectedId === rowId) setSelectedId(null);
    showToast("Row deleted", { undoLabel: "Undo", durationMs: 5000 });
  };

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flashCopied(key);
    } catch {
      // Clipboard unavailable.
    }
  };

  const gridIsEmpty = rows.every(
    (r) => !r.baseUrl.trim() && UTM_FIELDS.every((f) => !r[f].trim())
  );

  // ── P2: Preset fresh rows — rows that just had a preset applied but not yet touched.
  // On a fresh preset row, empty required fields show a muted hint instead of a red error.
  const [presetFreshRows, setPresetFreshRows] = useState<Set<string>>(new Set());

  // ── Bulk edit state ────────────────────────────────────────────────────────
  // Selection is purely transient — not persisted to localStorage.
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [bulkResultMessage, setBulkResultMessage] = useState<string | null>(null);
  const [bulkNoMatchMessage, setBulkNoMatchMessage] = useState<string | null>(null);
  const bulkResultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bulkNoMatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBulkResult = useCallback((message: string) => {
    if (bulkResultTimer.current) clearTimeout(bulkResultTimer.current);
    setBulkResultMessage(message);
    bulkResultTimer.current = setTimeout(() => {
      setBulkResultMessage(null);
      bulkResultTimer.current = null;
    }, 5000);
  }, []);

  const showBulkNoMatch = useCallback((message: string) => {
    if (bulkNoMatchTimer.current) clearTimeout(bulkNoMatchTimer.current);
    setBulkNoMatchMessage(message);
    bulkNoMatchTimer.current = setTimeout(() => {
      setBulkNoMatchMessage(null);
      bulkNoMatchTimer.current = null;
    }, 4000);
  }, []);

  // ── QR state ──────────────────────────────────────────────────────────────
  // openQrRowId: which row's QR popover is open (null = none). One at a time.
  // Initialized null (cold open shows no popover — SSR safe, no browser reads in render).
  const [openQrRowId, setOpenQrRowId] = useState<string | null>(null);
  // Fix 4: the trigger button's DOMRect for desktop popover anchoring.
  // Null = no popover open. Measured in the onClick handler (client-side only).
  const [qrTriggerRect, setQrTriggerRect] = useState<DOMRect | null>(null);
  // qrResultMessage: green-fill-in-place result message after bulk QR download.
  // ref-stable timer so it survives re-render (same pattern as shareLinkCopied).
  const [qrResultMessage, setQrResultMessage] = useState<string | null>(null);
  const qrResultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showQrResult = useCallback((message: string) => {
    if (qrResultTimer.current) clearTimeout(qrResultTimer.current);
    setQrResultMessage(message);
    qrResultTimer.current = setTimeout(() => {
      setQrResultMessage(null);
      qrResultTimer.current = null;
    }, 3000);
  }, []);

  /** Bulk download QR codes as a ZIP — called from BulkEditBar's QR export button.
   *  READ-ONLY: never mutates rows, never fires any POST/PUT.
   *  Uses the same row-selection model as other bulk ops.
   *  Fix 1: QR eligibility = no blocking lint (required/invalid-url).
   *  Eligibility is derived from `warnings` (the same useMemo the grid renders),
   *  guaranteeing button-disabled state, visible lint warning, and bulk-skip are
   *  all derived from ONE source of truth and can never disagree. */
  const handleBulkDownloadQr = useCallback(async () => {
    // Build eligibility map directly from the `warnings` useMemo — same source
    // the per-row button uses, so button state and bulk skip are always in sync.
    const eligibilityMap = new Map<string, boolean>();
    for (const row of rows) {
      const rowIsBlocked = [...UTM_FIELDS, "baseUrl" as const].some(
        (f) => (warnings.get(warningKey(row.id, f)) ?? []).some(
          (w) => BLOCKING_QR_LINT_RULES.has(w.rule)
        )
      );
      eligibilityMap.set(row.id, !rowIsBlocked);
    }
    const { valid, skippedCount } = filterValidQrRows(
      rows,
      eligibilityMap,
      selectedRowIds.size > 0 ? selectedRowIds : undefined
    );

    if (valid.length === 0) {
      showQrResult(buildQrResultMessage(0, skippedCount));
      return;
    }

    try {
      // Dynamic imports — client-side only, never during SSR render.
      const [QRCode, JSZip] = await Promise.all([
        import("qrcode").then((m) => m.default),
        import("jszip").then((m) => m.default),
      ]);

      const zip = new JSZip();

      // Build one PNG per valid row (named by stable, channel-aware scheme).
      // We need a row-index that matches the 1-based position in the FULL rows array.
      const rowIndexMap = new Map(rows.map((r, i) => [r.id, i + 1]));

      const qrEntries: {
        filename: string;
        url: string;
        rowIndex: number;
        campaign: string;
        source: string;
        medium: string;
        pngDataUrl: string;
      }[] = [];

      for (const row of valid) {
        const url = buildUtmUrl(row);
        const rowIndex = rowIndexMap.get(row.id) ?? 0;
        // Fix 3: channel-aware filename (campaign + source + medium)
        const filename = stableQrFilename(rowIndex, row.utm_campaign, row.utm_source, row.utm_medium);
        const pngDataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 1,
          color: { dark: "#111827", light: "#ffffff" },
        });
        // Convert data URL to binary for ZIP
        const base64 = pngDataUrl.split(",")[1] ?? "";
        zip.file(filename, base64, { base64: true });
        qrEntries.push({
          filename,
          url,
          rowIndex,
          campaign: row.utm_campaign,
          source: row.utm_source,
          medium: row.utm_medium,
          pngDataUrl,
        });
      }

      // Build contact-sheet PNG using canvas
      if (qrEntries.length > 0) {
        const canvas = document.createElement("canvas");
        const cols = Math.min(4, qrEntries.length);
        const rows_count = Math.ceil(qrEntries.length / cols);
        const cellSize = 220; // QR 200px + label area
        const labelHeight = 32;
        const padding = 12;
        canvas.width = cols * (cellSize + padding) + padding;
        canvas.height = rows_count * (cellSize + labelHeight + padding) + padding;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = "11px monospace";
          ctx.fillStyle = "#374151";

          for (let idx = 0; idx < qrEntries.length; idx++) {
            const entry = qrEntries[idx];
            const col = idx % cols;
            const row_n = Math.floor(idx / cols);
            const x = padding + col * (cellSize + padding);
            const y = padding + row_n * (cellSize + labelHeight + padding);

            // Draw QR image
            const img = new Image();
            await new Promise<void>((resolve) => {
              img.onload = () => {
                ctx.drawImage(img, x, y, 200, 200);
                resolve();
              };
              img.src = entry.pngDataUrl;
            });

            // Fix 3: channel-aware contact-sheet label: "01 · campaign · source/medium"
            const label = contactSheetLabel(
              entry.rowIndex,
              entry.campaign,
              entry.source,
              entry.medium,
              entry.url
            );
            ctx.fillStyle = "#374151";
            ctx.fillText(label, x, y + 200 + 18, cellSize);
          }
        }
        const sheetDataUrl = canvas.toDataURL("image/png");
        const sheetBase64 = sheetDataUrl.split(",")[1] ?? "";
        zip.file("contact-sheet.png", sheetBase64, { base64: true });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = "utm-qr-codes.zip";
      a.click();
      URL.revokeObjectURL(objectUrl);

      showQrResult(buildQrResultMessage(valid.length, skippedCount));
    } catch (err) {
      console.error("Bulk QR download failed:", err);
      showQrResult("QR download failed — please try again.");
    }
  }, [rows, warnings, selectedRowIds, showQrResult]);

  /** Toggle a single row checkbox. */
  const toggleRowSelection = useCallback((rowId: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }, []);

  /** Select-all / clear-all header checkbox. */
  const toggleSelectAll = useCallback((allRowIds: string[], allSelected: boolean) => {
    setSelectedRowIds(allSelected ? new Set() : new Set(allRowIds));
  }, []);

  /** Bulk: set a column to a value on targeted rows. Empty value clears.
   *  Fix 5: field is BulkColumn (includes "baseUrl").
   *  Fix 3: when value is empty, toast says "Cleared … on N rows". */
  const handleBulkSetColumn = useCallback(
    (field: BulkColumn, value: string) => {
      const targetIds =
        selectedRowIds.size > 0 ? selectedRowIds : new Set(rows.map((r) => r.id));
      const targetCount = targetIds.size;
      // Pre-compute flash keys from the current rows snapshot before calling setRows.
      const flashKeys = rows
        .filter((r) => targetIds.has(r.id))
        .map((r) => `${r.id}:${field}`);
      pushUndo(`Set column ${field}`, rows);
      setRows(rows.map((r) => (targetIds.has(r.id) ? { ...r, [field]: value } : r)));
      flashCellKeys(flashKeys);
      // Fix 3: empty value → "Cleared …", non-empty → "Set …"
      const verb = value === "" ? "Cleared" : "Set";
      const fieldLabel = field === "baseUrl" ? "Base URL" : field;
      showBulkResult(
        `${verb} ${fieldLabel} on ${targetCount} row${targetCount === 1 ? "" : "s"} — Undo`
      );
      setBulkNoMatchMessage(null);
    },
    [selectedRowIds, rows, pushUndo, setRows, flashCellKeys, showBulkResult]
  );

  /** Bulk: find & replace a substring in a column across targeted rows.
   *  Fix 2a: always shows a result message (success / no-match / empty-find).
   *  Fix 2b: matchCase parameter controls case sensitivity (default OFF = insensitive).
   *  Fix 5: field is BulkColumn (includes "baseUrl"). */
  const handleBulkFindReplace = useCallback(
    (field: BulkColumn, find: string, replace: string, matchCase: boolean) => {
      // Fix 2a: empty find → clear validation message, never silent no-op.
      if (!find) {
        showBulkNoMatch("Enter a value to find.");
        setBulkResultMessage(null);
        return;
      }
      const targetIds =
        selectedRowIds.size > 0 ? selectedRowIds : new Set(rows.map((r) => r.id));
      let matchCount = 0;
      const flashKeys: string[] = [];
      const fieldLabel = field === "baseUrl" ? "Base URL" : field;
      const nextRows = rows.map((r) => {
        if (!targetIds.has(r.id)) return r;
        const current = r[field] as string;
        // Fix 2b: case-insensitive by default (matchCase=false).
        const haystack = matchCase ? current : current.toLowerCase();
        const needle = matchCase ? find : find.toLowerCase();
        if (!haystack.includes(needle)) return r;
        matchCount++;
        flashKeys.push(`${r.id}:${field}`);
        // Replace all occurrences: split on case-insensitive needle.
        const replaced = matchCase
          ? current.split(find).join(replace)
          : current.replace(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), replace);
        return { ...r, [field]: replaced };
      });
      // Fix 2a: always show a result (no silent no-op).
      if (matchCount === 0) {
        showBulkNoMatch(`No matches in ${fieldLabel}.`);
        setBulkResultMessage(null);
        return;
      }
      pushUndo(`Find & replace in ${field}`, rows);
      setRows(nextRows);
      flashCellKeys(flashKeys);
      showBulkResult(
        `Replaced in ${matchCount} row${matchCount === 1 ? "" : "s"} — Undo`
      );
      setBulkNoMatchMessage(null);
    },
    [selectedRowIds, rows, pushUndo, setRows, flashCellKeys, showBulkResult, showBulkNoMatch]
  );

  const [shareEmptyWarning, setShareEmptyWarning] = useState(false);
  const shareEmptyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyShareLink = async () => {
    if (gridIsEmpty) {
      if (shareEmptyTimer.current) clearTimeout(shareEmptyTimer.current);
      setShareEmptyWarning(true);
      shareEmptyTimer.current = setTimeout(() => {
        setShareEmptyWarning(false);
        shareEmptyTimer.current = null;
      }, 2500);
      return;
    }
    const url = buildShareUrl({ rows, settings, spec, namingTemplate });
    try {
      await writeClipboard(url);
    } catch {
      // Even execCommand failed — still show green cue
    }
    if (shareCopyTimer.current) clearTimeout(shareCopyTimer.current);
    setShareLinkCopied(true);
    shareCopyTimer.current = setTimeout(() => {
      setShareLinkCopied(false);
      shareCopyTimer.current = null;
    }, 1800);
  };

  const copyAll = async () => {
    const urls = rows.map((r) => buildUtmUrl(r)).filter(Boolean);
    if (urls.length === 0) return;
    try {
      await writeClipboard(urls.join("\n"));
    } catch {
      // execCommand/textarea fallback already tried inside writeClipboard
    }
    // P1-2b: ref-stable green cue same as share link — survives re-render
    if (copyAllTimer.current) clearTimeout(copyAllTimer.current);
    setCopyAllCopied(true);
    copyAllTimer.current = setTimeout(() => {
      setCopyAllCopied(false);
      copyAllTimer.current = null;
    }, 1800);
  };

  // ── Launch Check handler ──────────────────────────────────────────────────
  // Runs the full existing lint suite over ALL current rows, then renders the
  // Compliance Report. READ-ONLY: never mutates rows, never triggers autosave or
  // any network request (no setRows / setStoredRows call here).
  const runLaunchCheck = () => {
    const allWarnings = Array.from(warnings.values()).flat();
    const summary = computeLaunchCheckSummary(rows, allWarnings);
    setComplianceReport(summary);
  };

  const exportCsv = () => {
    // Fix 5a: UTF-8 BOM prefix so Excel on Windows doesn't mojibake non-ASCII campaign names.
    // Matches the BOM already used by Launch Check CSV (launchCheck.ts).
    const BOM = "﻿";
    const blob = new Blob([BOM + rowsToCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "utm-grid.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFileChosen: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImportError(null);
    const text = await file.text();
    const parsed = parseCsv(text);
    if (parsed.length === 0) {
      setImportError(`No rows found in ${file.name} — the file is empty.`);
      return;
    }
    const [headers, ...dataRows] = parsed;
    setPendingImport({
      fileName: file.name,
      headers,
      dataRows,
      initialMapping: autoMapHeaders(headers),
    });
  };

  const confirmImport = (mapping: Record<MappableField, number | null>, mode: ImportMode) => {
    if (!pendingImport) return;
    const imported = csvToRows(pendingImport.dataRows, mapping, newId);
    pushUndo("Import CSV", rows);
    if (mode === "append") {
      const currentNonEmpty = rows.filter(
        (r) => r.baseUrl.trim() || UTM_FIELDS.some((f) => r[f].trim())
      );
      setRows([...currentNonEmpty, ...(imported.length > 0 ? imported : [emptyRow(newId())])]);
    } else {
      setRows(imported.length > 0 ? imported : [emptyRow(newId())]);
    }
    setSelectedId(null);
    setPendingImport(null);
    showToast(
      `Imported ${imported.length} row${imported.length === 1 ? "" : "s"} (${mode === "append" ? "appended" : "replaced"})`,
      { undoLabel: "Undo", durationMs: 5000 }
    );
  };

  const confirmAudit = (text: string, mode: AuditMode) => {
    const { rows: parsed, skipped } = parseUtmUrls(text, () => newId());
    if (parsed.length === 0) {
      setAuditDialogOpen(false);
      return;
    }

    // Guard: Replace mode with a non-empty grid (dirty campaign OR non-empty scratch grid).
    // workingGridIsDirty() covers open-campaign dirty state; the second clause covers
    // a scratch grid that has content but no campaign open (same guard as handleLoadSample).
    const scratchHasContent = rows.some(
      (r) => r.baseUrl.trim() || UTM_FIELDS.some((f) => r[f].trim())
    );
    if (mode === "replace" && (workingGridIsDirty() || scratchHasContent)) {
      const ok = window.confirm(
        `Replace your current grid (${rows.length} link${rows.length === 1 ? "" : "s"})? This can't be undone (one Undo will restore it).`
      );
      if (!ok) return;
    }

    pushUndo("Audit URLs", rows);
    if (mode === "append") {
      const currentNonEmpty = rows.filter(
        (r) => r.baseUrl.trim() || UTM_FIELDS.some((f) => r[f].trim())
      );
      setRows([...currentNonEmpty, ...parsed]);
    } else {
      setRows(parsed.length > 0 ? parsed : [emptyRow(newId())]);
    }

    setAuditDialogOpen(false);

    // Fix 1/2/3/4: set persistent summary panel data.
    // auditedRowIds drives the live grouped summary + skipped-line list.
    // The live flagged count is derived from current `warnings` on each render (Fix 4).
    const auditedRowIds = new Set(parsed.map((r) => r.id));
    setAuditSummaryInfo({ parsedCount: parsed.length, auditedRowIds, skipped });

    // Brief peripherally-unmissable toolbar status (auto-clears after 5s).
    // Flagged count is now shown live in the summary panel, so this just confirms the action.
    const skippedNote = skipped.length > 0
      ? ` · ${skipped.length} line${skipped.length === 1 ? "" : "s"} skipped`
      : "";
    const msg = `Audited ${parsed.length} URL${parsed.length === 1 ? "" : "s"}${skippedNote} — see summary above. Undo`;

    if (auditStatusTimer.current) clearTimeout(auditStatusTimer.current);
    setAuditStatus(msg);
    auditStatusTimer.current = setTimeout(() => {
      setAuditStatus(null);
      auditStatusTimer.current = null;
    }, 5000);

    // Fix 1: auto-scroll the table container so the first utm_* column (utm_source) is visible.
    // Deferred to next paint so the DOM reflects the new rows first.
    requestAnimationFrame(() => {
      const container = tableContainerRef.current;
      if (!container) return;
      // Base URL col (160px) + checkbox col (32px) + row-num col (32px) = ~224px from left.
      // Scrolling to 0 shows Base URL; scrolling to ~164px puts utm_source into view cleanly.
      // We scroll just past the base URL column so utm_source is the first visible UTM column.
      container.scrollLeft = 200;
    });
  };

  const applyPresetToSelected = (presetId: string) => {
    const preset = allPresets.find((p) => p.id === presetId);
    if (!preset) return;
    // Fix G: never a no-op. Use: selected row → last row → new row (if empty grid).
    const targetId = selectedId ?? rows[rows.length - 1]?.id;
    if (!targetId) {
      // Grid is empty: create a new row and apply to it.
      const newRow = emptyRow(newId());
      setRows([newRow]);
      setSelectedId(newRow.id);
      setRows((prev) =>
        prev.map((r) => (r.id === newRow.id ? { ...r, ...preset.values } : r))
      );
      // P2: mark new row as fresh so empty required fields show a hint, not red error
      setPresetFreshRows((prev) => { const n = new Set(prev); n.add(newRow.id); return n; });
      return;
    }
    setRows((prev) =>
      prev.map((r) => (r.id === targetId ? { ...r, ...preset.values } : r))
    );
    setSelectedId(targetId);
    // P2: mark the target row as fresh so empty required fields show a hint, not red error
    setPresetFreshRows((prev) => { const n = new Set(prev); n.add(targetId); return n; });
  };

  const savePreset = (name: string, values: Partial<Record<UtmField, string>>) => {
    setPresets((prev) => [
      ...prev.filter((p) => p.name !== name),
      { id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, values },
    ]);
  };

  // ── Campaigns integration ──────────────────────────────────────────────────

  /** Check if the working grid has unsaved edits vs the open campaign. */
  const workingGridIsDirty = useCallback((): boolean => {
    if (!openCampaignId) return false;
    return isDirty;
  }, [openCampaignId, isDirty]);

  /**
   * Guard: if opening a campaign or share-link would clobber unsaved edits,
   * show a native confirm().  Returns true if the caller should proceed.
   */
  const confirmReplaceIfDirty = useCallback(
    (targetName: string, targetLinkCount: number): boolean => {
      if (!workingGridIsDirty()) return true;
      return window.confirm(
        `Open "${targetName}"? Your current unsaved grid (${rows.length} link${rows.length === 1 ? "" : "s"}) will be replaced. This can't be undone.`
      );
    },
    [workingGridIsDirty, rows.length]
  );

  /** Open a saved campaign as the working grid. */
  const openCampaign = useCallback(
    (campaign: Campaign) => {
      if (!confirmReplaceIfDirty(campaign.name, campaign.rows.length)) return;
      // Clear any shared-state overlay
      if (isUsingSharedState) {
        pendingSharedState.current = null;
        setSharedRows(null);
        setSharedSettings(null);
        setSharedSpec(null);
        setIsUsingSharedState(false);
        setSharedBanner(null);
      }
      setStoredRows(campaign.rows);
      setStoredSettings(campaign.settings);
      // Restore the campaign's UTM Spec (backward compat: absent → empty/unenforced)
      setStoredSpec(extractSpecFromCampaign(campaign));
      // Restore the campaign's NamingTemplate (backward compat: absent → DEFAULT_NAMING_TEMPLATE)
      setStoredNamingTemplate(extractNamingTemplateFromCampaign(campaign));
      setOpenCampaignId(campaign.id);
      setStoredOpenId(campaign.id); // Fix E: persist across reload
      setIsDirty(false);
    },
    [
      confirmReplaceIfDirty,
      isUsingSharedState,
      setStoredRows,
      setStoredSettings,
      setStoredSpec,
      setStoredNamingTemplate,
      setStoredOpenId,
    ]
  );

  /** Setter for the UTM Spec (marks working grid dirty). */
  const setSpec = useCallback(
    (next: UtmSpec) => {
      if (isUsingSharedState) {
        commitSharedToStorage();
      }
      setStoredSpec(next);
      setIsDirty(true);
      clearSavedFlash();
    },
    [isUsingSharedState, commitSharedToStorage, setStoredSpec, clearSavedFlash]
  );

  /** Setter for the NamingTemplate (marks working grid dirty). */
  const setNamingTemplate = useCallback(
    (next: NamingTemplate) => {
      if (isUsingSharedState) {
        commitSharedToStorage();
      }
      setStoredNamingTemplate(next);
      setIsDirty(true);
      clearSavedFlash();
    },
    [isUsingSharedState, commitSharedToStorage, setStoredNamingTemplate, clearSavedFlash]
  );

  /** Called by CampaignsSidebar when a save completes. */
  const handleCampaignSaved = useCallback(
    (nextCampaigns: Campaign[], savedCampaign: Campaign) => {
      setCampaigns(nextCampaigns);
      setOpenCampaignId(savedCampaign.id);
      setStoredOpenId(savedCampaign.id); // Fix E: persist across reload
      setIsDirty(false);
      // Flash the pill green for ~2s (ref-stable timer)
      if (savedFlashTimer.current) clearTimeout(savedFlashTimer.current);
      setSavedFlash(true);
      savedFlashTimer.current = setTimeout(() => {
        setSavedFlash(false);
        savedFlashTimer.current = null;
      }, 2000);
    },
    [setCampaigns, setStoredOpenId]
  );

  // Fix E: wrap setCampaigns so that if the open campaign is removed, clear the stored id.
  const handleCampaignsChanged = useCallback(
    (next: Campaign[]) => {
      setCampaigns(next);
      // If the open campaign was deleted, clear the persisted pointer.
      if (openCampaignId && !next.find((c) => c.id === openCampaignId)) {
        setOpenCampaignId(null);
        setStoredOpenId(null);
        setIsDirty(false);
      }
    },
    [setCampaigns, openCampaignId, setStoredOpenId]
  );

  /**
   * Rob Fix 3a: Load sample spec (explicit/opt-in only — never auto-loads).
   * Respects the existing unsaved-edits guard; also pre-populates two demo rows
   * so the off-spec→Fix magic is visible in ~5 seconds.
   * Declared after setSpec to avoid TS "used before declaration" error.
   */
  const handleLoadSample = useCallback(() => {
    // Guard: if the working grid has content, confirm before replacing.
    const hasContent = rows.some(
      (r) => r.baseUrl.trim() || UTM_FIELDS.some((f) => r[f].trim())
    );
    if (hasContent) {
      const confirmed = window.confirm(
        `Load example spec? Your current grid (${rows.length} link${rows.length === 1 ? "" : "s"}) will be replaced. This can't be undone.`
      );
      if (!confirmed) return;
    }
    // Load the sample spec with enforcement on
    setSpec(SAMPLE_SPEC);
    // Pre-populate demo rows showing clean + off-spec values
    const demoRows = [
      {
        ...emptyRow("row-sample-1"),
        baseUrl: "https://example.com/landing",
        utm_source: "newsletter",
        utm_medium: "email",
        utm_campaign: "spring_sale",
      },
      {
        ...emptyRow("row-sample-2"),
        baseUrl: "https://example.com/landing",
        utm_source: "email_blast",
        utm_medium: "email",
        utm_campaign: "spring_sale",
      },
    ];
    setRows(demoRows);
    showToast("Loaded example spec — tap Fix on the off-spec cell to see the taxonomy magic");
  }, [rows, setSpec, setRows, showToast]);

  // ── onStateChange callback — fires when rows/settings/spec change in workspace mode ──
  // We watch rows/settings/spec via a non-mount effect. The callback is stabilized via ref
  // to avoid re-attaching the effect on every render.
  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  // Skip the first fire on mount (initialWorkspace already seeded by the page).
  const didMountOnStateChange = useRef(false);

  useEffect(() => {
    if (!onStateChangeRef.current) return;
    if (!didMountOnStateChange.current) {
      didMountOnStateChange.current = true;
      return;
    }
    onStateChangeRef.current({ rows, settings, spec, namingTemplate });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, settings, spec, namingTemplate]);

  // ── Review map callbacks (workspace mode only) ──────────────────────────
  // Stabilize via ref to avoid re-creating on every render.
  const onReviewChangeRef = useRef(onReviewChange);
  onReviewChangeRef.current = onReviewChange;

  const handleSetReview = useCallback(
    (rowId: string, state: "approved" | "needs-changes", note: string) => {
      if (!onReviewChangeRef.current) return;
      // FIX A: use reviewerName directly (empty string = no name set, stored as "").
      // The ReviewBadge popover calls onNameChange before calling onSetReview so the
      // parent has already updated reviewerName in the unified identity before this fires.
      const next = setRowReview(reviewMap, rowId, state, reviewerName, note);
      onReviewChangeRef.current(next);
    },
    // reviewMap and reviewerName are stable enough — called only in event handlers
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reviewMap, reviewerName]
  );

  const handleClearReview = useCallback(
    (rowId: string) => {
      if (!onReviewChangeRef.current) return;
      const next = clearRowReview(reviewMap, rowId);
      onReviewChangeRef.current(next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reviewMap]
  );

  // ── "Create shared workspace" state ──────────────────────────────────────
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [createWorkspaceError, setCreateWorkspaceError] = useState<string | null>(null);

  const createSharedWorkspace = useCallback(async () => {
    if (creatingWorkspace) return;
    setCreatingWorkspace(true);
    setCreateWorkspaceError(null);
    try {
      const payload: WorkspacePayload = { rows, settings, spec, namingTemplate };
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setCreateWorkspaceError("Couldn't create workspace — try again.");
        setCreatingWorkspace(false);
        return;
      }
      const { id } = (await res.json()) as { id: string };
      // Signal the /w/[id] page to show green "Workspace link copied!" on mount
      try {
        sessionStorage.setItem(`ws-copy-on-load:${id}`, "1");
      } catch {
        // sessionStorage unavailable — clipboard will still work
      }
      // Navigate to /w/<id>
      router.push(`/w/${id}`);
    } catch {
      setCreateWorkspaceError("Couldn't create workspace — check your connection.");
      setCreatingWorkspace(false);
    }
  }, [creatingWorkspace, rows, settings, spec, router]);

  // ── Toolbar pill ──────────────────────────────────────────────────────────
  const openCampaignRecord = openCampaignId
    ? findCampaign(campaigns, openCampaignId)
    : null;

  const pillLabel = openCampaignRecord
    ? isDirty
      ? `In: ${openCampaignRecord.name} · unsaved changes`
      : `In: ${openCampaignRecord.name}`
    : "Unsaved grid";

  const pillClass = savedFlash
    ? "rounded-full border border-green-500 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
    : openCampaignRecord && isDirty
    ? "rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
    : "rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500";

  // P1: collapsible panel state — collapsed by default on cold open
  const [lintRulesExpanded, setLintRulesExpanded] = useState(false);


  const toggle = (settingKey: keyof LintSettings, label: string) => (
    <label className="flex items-center gap-1.5 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={settings[settingKey]}
        onChange={(e) => setSettings((s) => ({ ...s, [settingKey]: e.target.checked }))}
      />
      {label}
    </label>
  );

  const canUndo = undoCount > 0;

  return (
    <div className="flex flex-col gap-4 overflow-x-hidden">
      {/* P0-2: CSS rule — when the hero has data-shared-landing, collapse it to a quiet one-liner.
          This is pure CSS, set by the share-hash useEffect on the hero DOM element.
          SSR-safe: the data attribute is absent on first render, so SSR and client match. */}
      {sharedBanner && (
        <style>{`
          #utm-hero[data-shared-landing="true"] h1,
          #utm-hero[data-shared-landing="true"] p {
            display: none;
          }
          #utm-hero[data-shared-landing="true"]::after {
            content: "UTM Grid — shared link loaded";
            display: block;
            font-size: 0.75rem;
            color: #9ca3af;
            padding-bottom: 0.25rem;
          }
        `}</style>
      )}

      {/* P0-2: Loaded shared grid banner — pinned at VERY TOP, full-width, in-flow (never overlay).
          aria-live="polite" announces it on load. Hero collapses to muted one-liner via CSS
          [data-shared-landing] selector set on the hero element by the share-hash useEffect. */}
      {sharedBanner && (
        <div
          role="status"
          aria-live="polite"
          data-testid="shared-grid-banner"
          className="flex items-start justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 w-full"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-blue-900">
              Loaded shared grid ({sharedBanner.rowCount}{" "}
              {sharedBanner.rowCount === 1 ? "link" : "links"})
              {sharedBanner.specRuleCount >= 1 && (
                <span className="ml-1 text-xs font-normal text-violet-700">
                  {" "}· enforces a UTM spec — {sharedBanner.specRuleCount} allowed-value rule{sharedBanner.specRuleCount === 1 ? "" : "s"}
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-blue-700">
              These are someone&apos;s links — edit any cell to make them yours.
            </p>
            {/* P0-3b: "Fix all naming" — one-tap Auto-fix over the shared grid, never silent on load. ≥44px. */}
            <button
              type="button"
              data-testid="shared-fix-all-naming"
              onClick={() => cleanAll()}
              className="mt-2 min-h-[44px] rounded-md border border-blue-400 bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 active:bg-blue-100"
            >
              Fix all naming
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setSharedBanner(null);
              const heroEl = document.getElementById("utm-hero");
              if (heroEl) heroEl.removeAttribute("data-shared-landing");
            }}
            aria-label="Dismiss shared grid banner"
            className="shrink-0 text-blue-500 hover:text-blue-700 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        {/* Open-campaign indicator pill */}
        <span
          className={pillClass}
          aria-live="polite"
          data-testid="campaign-pill"
          role="status"
        >
          {savedFlash ? `In: ${openCampaignRecord?.name ?? "campaign"} · Saved!` : pillLabel}
          {openCampaignRecord && isDirty && !savedFlash && (
            <span
              className="ml-1.5 inline-block h-2 w-2 rounded-full bg-amber-400 align-middle"
              aria-label="unsaved changes"
            />
          )}
        </span>

        <button
          type="button"
          onClick={addRow}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add row
        </button>
        <button
          type="button"
          onClick={cleanAll}
          title="Lowercase + normalize all flagged cells"
          data-testid="auto-fix-naming-btn"
          className="rounded-md border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          Auto-fix naming
        </button>
        {canUndo && (
          <button
            type="button"
            onClick={undo}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Undo
          </button>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Import CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          aria-label="CSV file"
          className="hidden"
          onChange={onFileChosen}
        />

        {/* "Paste & Audit URLs" — distinct verb/icon/gap from Import CSV (UX brief §1).
            Inspection glyph (magnifying glass), violet accent, one logical group gap. */}
        <span className="inline-flex flex-col items-start gap-0.5">
          <button
            type="button"
            data-testid="audit-urls-btn"
            onClick={() => setAuditDialogOpen(true)}
            className="min-h-[44px] rounded-md border border-violet-400 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-100 flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="w-4 h-4 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            Paste &amp; Audit URLs
          </button>
          {/* Sub-caption — discoverable value tag for cold skimmers */}
          {!auditStatus && (
            <span className="text-[11px] text-gray-400 leading-tight max-w-[14rem]">
              Already have tagged links? Paste them to find every inconsistency at once.
            </span>
          )}
          {/* Audit status — peripherally unmissable (ref-stable timer) */}
          {auditStatus && (
            <span role="status" aria-live="polite" className="text-xs font-medium text-violet-700">
              {auditStatus}
            </span>
          )}
        </span>

        <button
          type="button"
          onClick={exportCsv}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Export CSV
        </button>

        {/* P2-1: Top-level always-visible "Download QR codes" — primary QR bulk-export entry point.
            Same handler + selection semantics as the BulkEditBar's QR section.
            QR-square (⊞) + download (⬇) glyph; teal accent; green-fill result adjacent (P3-1).
            Verb "Download QR codes" is distinct from all other toolbar controls.
            READ-ONLY: no POST/PUT, safe on /w/<id>. */}
        <span className="inline-flex flex-col items-start gap-0.5">
          <button
            type="button"
            data-testid="download-qr-codes-btn"
            aria-label="Download QR codes"
            onClick={() => void handleBulkDownloadQr()}
            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md border border-teal-500 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-100 active:bg-teal-200 shadow-sm whitespace-nowrap"
          >
            {/* QR-square + download icon glyphs */}
            <span aria-hidden="true" className="text-base leading-none">⊞⬇</span>
            Download QR codes
          </button>
          {/* Scope indicator — same "Apply to:" model as BulkEditBar */}
          <span
            className={`text-[10px] rounded-full px-2 py-0.5 ${
              selectedRowIds.size > 0
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-400"
            }`}
            aria-live="polite"
            role="status"
          >
            {selectedRowIds.size > 0
              ? `Apply to: ${selectedRowIds.size} selected row${selectedRowIds.size === 1 ? "" : "s"}`
              : `Apply to: all ${rows.length} row${rows.length === 1 ? "" : "s"}`}
          </span>
          {/* P3-1: green-fill result message adjacent to where user clicked — ref-stable ~3s timer */}
          {qrResultMessage && (
            <span
              role="status"
              aria-live="polite"
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                qrResultMessage.startsWith("No QR")
                  ? "text-amber-700 bg-amber-50"
                  : "text-green-700 bg-green-50"
              }`}
            >
              {qrResultMessage}
            </span>
          )}
        </span>

        {/* Fix 1 + Fix 3: "Copy share link" — sublabel disambiguates from "Create shared workspace".
            Green fill + "Copied ✓" for 1.8s; ref-stable timer (shareCopyTimer); dedicated aria-live. */}
        <span className="inline-flex flex-col items-start gap-0.5">
          <button
            type="button"
            data-testid="copy-share-link"
            onClick={() => void copyShareLink()}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              shareLinkCopied
                ? "border-green-500 bg-green-500 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {shareLinkCopied ? (
              <span className="inline-flex items-center gap-1">
                <span aria-hidden="true">✓</span>{" "}
                <span>Copied ✓</span>
              </span>
            ) : (
              "Copy share link"
            )}
          </button>
          {/* Dedicated aria-live — announces the copy even if button text change is missed */}
          <span role="status" aria-live="polite" className="sr-only">
            {shareLinkCopied ? "Share link copied!" : ""}
          </span>
          {/* Fix 3: sublabel distinguishes snapshot vs. live workspace */}
          {!shareLinkCopied && (
            <span className="text-[10px] text-gray-400 leading-tight max-w-[10rem]">
              {isWorkspaceMode ? "frozen snapshot of current grid" : "snapshot, in the link"}
            </span>
          )}
          {shareEmptyWarning && (
            <span role="alert" className="text-xs text-amber-700">
              Nothing to share yet
            </span>
          )}
        </span>
        {/* P1-2b: Copy all URLs — same peripherally-unmissable green cue as share link */}
        <span className="inline-flex flex-col items-start gap-0.5">
          <button
            type="button"
            data-testid="copy-all-urls"
            onClick={() => void copyAll()}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              copyAllCopied
                ? "border-green-500 bg-green-500 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {copyAllCopied ? (
              <span className="inline-flex items-center gap-1">
                <span>✓</span>{" "}
                <span>Copied!</span>
              </span>
            ) : (
              "Copy all URLs"
            )}
          </button>
          <span role="status" aria-live="polite" className="text-xs font-medium text-green-600 min-h-[1em]">
            {copyAllCopied ? "Copied!" : ""}
          </span>
        </span>

        {/* P1: Naming rules — collapsible disclosure, collapsed on cold open, payoff label always visible.
            The Enforce toggle + off-spec indicator are ALWAYS rendered (never gated by collapse)
            so e2e tests can click them without first expanding the section. */}
        <div className="ml-auto border-l border-gray-200 pl-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setLintRulesExpanded((v) => !v)}
              aria-expanded={lintRulesExpanded}
              className="flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700"
            >
              <span>Naming rules</span>
              <span className="text-gray-400 text-[10px]">{lintRulesExpanded ? "▲" : "▼"}</span>
            </button>
            {/* Fix D: canonical Enforce UTM Spec toggle — ALWAYS visible, never gated by collapse */}
            <label className="flex items-center gap-1.5 text-sm text-violet-700">
              <input
                type="checkbox"
                data-testid="enforce-spec-toggle"
                checked={!!spec.enforceSpec}
                onChange={(e) => setSpec({ ...spec, enforceSpec: e.target.checked })}
              />
              Enforce allowed values
            </label>
            {/* Canonical "Enforce naming template" toggle — independent of Enforce UTM Spec */}
            <span className="flex flex-col gap-0.5">
              <label className="flex items-center gap-1.5 text-sm text-teal-700 cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="enforce-template-toggle"
                  checked={!!namingTemplate.enforceTemplate}
                  onChange={(e) =>
                    setNamingTemplate({ ...namingTemplate, enforceTemplate: e.target.checked })
                  }
                />
                Enforce naming template
              </label>
              {/* Fix 1: "Define structure →" pointer from enforce toggle into the panel */}
              <button
                type="button"
                data-testid="define-structure-link"
                onClick={() => {
                  const panel = document.querySelector("[data-testid='naming-template-panel']");
                  if (panel) {
                    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    panel.dispatchEvent(new CustomEvent("naming-template-open"));
                  }
                }}
                className="text-[10px] text-teal-600 hover:text-teal-800 hover:underline text-left"
              >
                Define structure →
              </button>
            </span>
            {/* Fix C: "N cells off-spec" indicator — always visible when relevant */}
            {spec.enforceSpec && (() => {
              const offSpecCount = Array.from(warnings.values()).flat().filter((w) => w.rule === "off-spec").length;
              return offSpecCount > 0 ? (
                <button
                  type="button"
                  data-testid="off-spec-indicator"
                  aria-label={`${offSpecCount} cell${offSpecCount === 1 ? "" : "s"} off-spec — click to open UTM Spec panel`}
                  onClick={() => {
                    const panel = document.querySelector("[data-testid='utm-spec-panel']");
                    if (panel) {
                      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
                      panel.dispatchEvent(new CustomEvent("utm-spec-open"));
                    }
                  }}
                  className="rounded-full border border-violet-300 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                >
                  {offSpecCount} cell{offSpecCount === 1 ? "" : "s"} off-spec
                </button>
              ) : null;
            })()}
            {/* "N off-template" indicator — always visible when relevant */}
            {namingTemplate.enforceTemplate && (() => {
              const offTemplateCount = Array.from(warnings.values()).flat().filter((w) => w.rule === "off-template").length;
              return offTemplateCount > 0 ? (
                <button
                  type="button"
                  data-testid="off-template-indicator"
                  aria-label={`${offTemplateCount} cell${offTemplateCount === 1 ? "" : "s"} off-template — click to open Naming Template panel`}
                  onClick={() => {
                    const panel = document.querySelector("[data-testid='naming-template-panel']");
                    if (panel) {
                      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
                      panel.dispatchEvent(new CustomEvent("naming-template-open"));
                    }
                  }}
                  className="rounded-full border border-teal-300 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                >
                  {offTemplateCount} cell{offTemplateCount === 1 ? "" : "s"} off-template
                </button>
              ) : null;
            })()}
          </div>
          {/* Collapsible: the remaining three toggles + legend */}
          {lintRulesExpanded && (
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {toggle("requiredParams", "Require source/medium/campaign")}
              {toggle("lowercaseOnly", "Lowercase only")}
              {toggle("noSpaces", "No spaces")}
              {/* Fix A: enforcing legend — extended with teal for off-template */}
              {(spec.enforceSpec || namingTemplate.enforceTemplate) && (
                <span className="text-[10px] text-gray-400">
                  <span className="inline-block w-2 h-2 rounded-sm bg-amber-300 align-middle mr-0.5" aria-hidden="true" />{" "}
                  amber = casing/spaces
                  {spec.enforceSpec && (
                    <>
                      <span className="mx-1.5 text-gray-300">|</span>
                      <span className="inline-block w-2 h-2 rounded-sm bg-violet-300 align-middle mr-0.5" aria-hidden="true" />{" "}
                      violet = off-spec
                    </>
                  )}
                  {namingTemplate.enforceTemplate && (
                    <>
                      <span className="mx-1.5 text-gray-300">|</span>
                      <span className="inline-block w-2 h-2 rounded-sm bg-teal-300 align-middle mr-0.5" aria-hidden="true" />{" "}
                      teal = off-template
                    </>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Privacy reassurance — mode-aware (Fix 1). */}
      {isWorkspaceMode ? (
        <p className="text-xs text-gray-400 -mt-2">
          Synced to a private server workspace — anyone with the secret link can view and edit. Changes save automatically.
        </p>
      ) : (
        <p className="text-xs text-gray-400 -mt-2">
          Shareable link is built in your browser — nothing is sent to any server.
        </p>
      )}

      {/* ── Pre-launch QA group ─────────────────────────────────────────────────
          F4: holds ONLY "Run Launch Check". "Audit URLs" lives exclusively in the
          toolbar above as "Paste & Audit URLs" — the single audit entry point.
          R2-3: placed in DOM BEFORE create-workspace-strip so on mobile (≤640px)
          "Run Launch Check" appears HIGH on the page — reachable without scrolling
          past the 209px create-workspace panel. Desktop order is also fine here
          (Pre-launch QA naturally precedes team workspace creation). */}
      <div
        data-testid="prelaunch-qa-strip"
        className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-teal-100 bg-teal-50/60 px-4 py-3"
      >
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold text-teal-900 uppercase tracking-wide">
            Pre-launch QA
          </span>
          <p className="mt-0.5 text-xs text-teal-700">
            <strong>Launch Check</strong> — Check every link in this batch against your naming rules before you launch.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {/* "Run Launch Check" — the sole action in this band (F4: Audit URLs removed) */}
          <button
            type="button"
            data-testid="run-launch-check-btn"
            onClick={runLaunchCheck}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 active:bg-teal-800"
          >
            {/* Shield/checklist icon — distinct from magnifying-glass (Audit URLs) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="w-4 h-4 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            Run Launch Check
          </button>
        </div>
      </div>

      {/* "Create shared workspace" accent strip — always visible in flow above the grid.
          Shown only in default (non-workspace) mode per UX brief §1.
          Placement: its own labeled strip, NOT adjacent to "Copy share link" toolbar button,
          so the two share rungs never read as duplicate controls.
          Mobile: stacks as full-label accent button. */}
      {!isWorkspaceMode && (
        <div
          data-testid="create-workspace-strip"
          className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
              Live team workspace
            </span>
            <p className="mt-0.5 text-xs text-blue-700">
              A live workspace your team edits together — changes save to a private link and sync across devices.{" "}
              <span className="text-gray-400">(Different from &ldquo;Copy share link&rdquo;, which sends a frozen snapshot.)</span>
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
            <button
              type="button"
              data-testid="create-shared-workspace-btn"
              onClick={() => void createSharedWorkspace()}
              disabled={creatingWorkspace || gridIsEmpty}
              aria-label="Create shared workspace"
              className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 min-h-[44px]"
            >
              {creatingWorkspace ? "Creating…" : "Create shared workspace"}
            </button>
            {/* Fix 3: sublabel clarifies this is live/synced, distinct from "Copy share link" (snapshot) */}
            <span className="text-[10px] text-blue-600 leading-tight">
              live, synced for the team
            </span>
            {createWorkspaceError && (
              <span role="alert" className="text-xs text-red-600">
                {createWorkspaceError}
              </span>
            )}
            {gridIsEmpty && (
              <span className="text-xs text-gray-400">Add at least one row to create a workspace.</span>
            )}
          </div>
        </div>
      )}

      {importError && (
        <p role="alert" className="text-sm font-medium text-red-600">
          ⚠ {importError}
        </p>
      )}

      <PresetsBar
        presets={userPresets}
        selectedRow={selectedRow}
        newRowPresetId={newRowPresetId}
        onSave={savePreset}
        onDelete={(id) => setPresets((prev) => prev.filter((p) => p.id !== id))}
        onApplyToSelected={applyPresetToSelected}
        onNewRowPresetChange={setNewRowPresetId}
      />

      {/* Mobile disclosures — above grid, below Pre-launch QA (R2-3: QA strip is higher in DOM).
          ORDER (per brief): NamingTemplate FIRST (most setup-critical), then Campaigns, then UTM Spec.
          Campaigns hidden in workspace mode (local-only). UTM Spec shown in all modes. */}
      <div className="min-[900px]:hidden flex flex-col gap-1">
        {/* Campaign Naming Template mobile disclosure — FIRST, always shown (promote to top per Fix 1) */}
        <NamingTemplatePanel
          template={namingTemplate}
          onChange={setNamingTemplate}
          enforceTemplate={!!namingTemplate.enforceTemplate}
          onEnforceTemplateChange={(v) =>
            setNamingTemplate({ ...namingTemplate, enforceTemplate: v })
          }
          mobileOnly
        />
        {!isWorkspaceMode && (
          <CampaignsSidebar
            campaigns={campaigns}
            openCampaignId={openCampaignId}
            isDirty={isDirty}
            onSave={handleCampaignSaved}
            onOpen={openCampaign}
            onChange={handleCampaignsChanged}
            rows={rows}
            settings={settings}
            spec={spec}
            namingTemplate={namingTemplate}
            savedFlash={savedFlash}
            mobileOnly
          />
        )}
        {/* UTM Spec mobile disclosure — shown in all modes; workspace-labeled when in workspace mode */}
        <UtmSpecPanel
          spec={spec}
          onChange={setSpec}
          onLoadSample={isWorkspaceMode ? undefined : handleLoadSample}
          onShareSpec={isWorkspaceMode ? undefined : () => void copyShareLink()}
          specLinkCopied={isWorkspaceMode ? undefined : shareLinkCopied}
          workspaceMode={isWorkspaceMode}
          syncStatus={isWorkspaceMode ? specSyncStatus : undefined}
          syncSavedAt={isWorkspaceMode ? specSavedAt : undefined}
          mobileOnly
        />
      </div>

      {/* Bulk edit bar — directly above grid header, below toolbar (per UX brief §Round 6 §2) */}
      <BulkEditBar
        rows={rows}
        selectedRowIds={selectedRowIds}
        onSetColumn={handleBulkSetColumn}
        onFindReplace={handleBulkFindReplace}
        resultMessage={bulkResultMessage}
        noMatchMessage={bulkNoMatchMessage}
        onDownloadQr={handleBulkDownloadQr}
        qrResultMessage={qrResultMessage}
      />
      {/* Undo affordance note: undo is in the toolbar above; bulk ops always append
          "— Undo" to the result message so Dana's Undo request is unmissable. */}

      {/* Native datalists for UTM Spec autocomplete — one per field, outside both layouts so they
          are not duplicated; datalist elements don't affect layout and work across DOM locations. */}
      {spec.enforceSpec && UTM_FIELDS.map((field) =>
        spec.allowedValues[field].length > 0 ? (
          <datalist key={field} id={`datalist-${field}`}>
            {spec.allowedValues[field].map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        ) : null
      )}

      {/* ── Compliance Report — above grid, full-width, in normal page flow.
          Visually DISTINCT from AuditSummaryPanel (violet) — slate/teal palette.
          READ-ONLY: complianceReport is set only in runLaunchCheck() (event handler);
          it is never set via setRows / setStoredRows so no autosave fires. */}
      {complianceReport && (
        <ComplianceReportPanel
          summary={complianceReport}
          isWorkspaceMode={isWorkspaceMode}
          onDismiss={() => setComplianceReport(null)}
        />
      )}

      {/* Fix 1/2/3/4: Post-audit grouped summary — above grid, full-width, in normal flow.
          NOT a side panel (side panels steal grid width per the lesson). The summary
          is persistent (not auto-clearing) so the payoff is legible without horizontal
          scroll. Live flagged count is derived from current `warnings` on each render
          so it updates after Auto-fix naming (Fix 4). */}
      {auditSummaryInfo && (
        <AuditSummaryPanel
          parsedCount={auditSummaryInfo.parsedCount}
          liveWarnings={Array.from(warnings.values()).flat()}
          auditedRowIds={auditSummaryInfo.auditedRowIds}
          skipped={auditSummaryInfo.skipped}
          onDismiss={() => setAuditSummaryInfo(null)}
        />
      )}

      {/* Main layout: grid full-width (panels rendered BELOW the grid, not beside it).
          Fix 2(a): at ≥1280px the right-rail sidebar was permanently squeezing the editable
          grid to ~958px, causing sticky Generated-URL/Actions columns to overlap utm_term/
          utm_content cells. Moving panels below gives the grid the full page width, so the
          table's internal scroll has ~1232px available at 1280px (vs ~958px before) and
          sticky columns no longer occlude editable cells. Same pattern workspace mode uses. */}
      {/* Grid container — holds BOTH table (≥640px) and card list (<640px).
          Both are always in the DOM; visibility is controlled by pure CSS only
          (no JS viewport detection — avoids SSR/hydration mismatch). */}
      <div className="w-full">

          {/* ── TABLE VIEW (sm and up) ──────────────────────────────────────── */}
          {/* Bounded-internal-scroll design (Fix 2a update):
              Panels moved below the grid, so the overflow-x-auto container is bounded by the
              FULL PAGE width (~1232px at 1280px minus padding). Table min-width 1212px fits
              within the container at 1280px — all 6 editable columns visible with no scroll.
              table-fixed prevents warning badges/chips from stretching td widths beyond header.
              Generated URL (sticky right-[148px]) and Actions (sticky right-0) are
              pinned to THIS container's right edge with a solid opaque background and
              z-index above the scrolling middle columns — they no longer overlap editable cells
              because the container is now ~274px wider than before the fix. */}
          <div ref={tableContainerRef} className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
          {/* Table min-width: when reviewMap present: 1212px (32+32+80+160+5×120+160+148).
              When reviewMap absent: 1212px (32+32+160+5×120+240+148).
              Both budgets fit within ≈1217px at 1280px — no horizontal page overflow.
              table-fixed: column widths set by headers; cell content clipped, not expanded.
              When Review column is active, genUrl shrinks from 240→160px (still truncated+tooltip). */}
          <table className="w-full border-collapse text-sm table-fixed" style={{ minWidth: "1212px" }}>
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {/* Bulk-selection checkbox header
                    Fix 1: relative + z-20 so this column sits above the sticky-right
                    Generated-URL / Actions columns (z-10) on narrow/375px viewports.
                    With new layout sticky body cells are z-20, header sticky cells z-30 —
                    z-20 here is fine since this is in the thead (separate stacking layer). */}
                <th className="relative z-20 w-8 px-2 py-2.5 text-center bg-gray-50" style={{ width: "32px" }}>
                  <SelectAllCheckbox
                    rows={rows}
                    selectedRowIds={selectedRowIds}
                    onToggleAll={toggleSelectAll}
                  />
                </th>
                <th className="w-8 px-2 py-2.5" style={{ width: "32px" }} aria-label="Row number" />
                {/* Review column — only when onReviewChange prop is provided (workspace /w/<id> mode).
                    Gating on onReviewChange (not reviewMap) means the column renders even when
                    reviewMap is {} (empty/legacy workspace) — all rows show "Unreviewed" badges.
                    80px. When present, genUrl shrinks from 240→160px, keeping total budget = 1212px.
                    Guard #1: w-[80px] with overflow hidden — cannot escape parent resize. */}
                {onReviewChange !== undefined && (
                  <th
                    className="px-2 py-2.5 text-indigo-600"
                    style={{ width: "80px" }}
                    aria-label="Review status"
                  >
                    Review
                  </th>
                )}
                {COLUMNS.map((c) => (
                  <th
                    key={c}
                    className="px-2 py-2.5 whitespace-nowrap"
                    style={{ width: c === "baseUrl" ? "160px" : "120px" }}
                  >
                    {FIELD_LABELS[c]}
                    {settings.requiredParams &&
                      ["utm_source", "utm_medium", "utm_campaign"].includes(c) && (
                        <span className="ml-0.5 text-red-500" title="Required">
                          *
                        </span>
                      )}
                  </th>
                ))}
                {/* Generated URL: sticky, right-offset = Actions width.
                    When review active (onReviewChange set): 160px (shrunk from 240 to balance +80 review col).
                    When review absent: 240px (existing). Both keep total budget at 1212px. */}
                <th className="sticky right-[148px] z-30 bg-gray-50 px-2 py-2.5 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] whitespace-nowrap" style={{ width: onReviewChange !== undefined ? "160px" : "240px" }}>
                  Generated URL
                </th>
                {/* Actions: sticky right-0, 148px wide (widened from 116px for QR button). z-30 same as Generated URL header. */}
                <th className="sticky right-0 z-30 bg-gray-50 px-2 py-2.5 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] whitespace-nowrap" style={{ width: "148px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const generated = buildUtmUrl(row);
                const isSelected = row.id === selectedId;
                const isBulkChecked = selectedRowIds.has(row.id);
                // Fix 1: compute QR eligibility DIRECTLY from the same warnings map the grid
                // renders (not from qrEligibilityMap, which can be stale due to closure timing).
                // This guarantees button-disabled state and visible lint warning are derived from
                // one source of truth and can never disagree.
                const rowHasBlockingLintTable = (
                  [...UTM_FIELDS, "baseUrl" as const].some(
                    (f) => (warnings.get(warningKey(row.id, f)) ?? []).some(
                      (w) => BLOCKING_QR_LINT_RULES.has(w.rule)
                    )
                  )
                );
                const isQrEligible = !!(generated) && !rowHasBlockingLintTable;
                const qrBtnTitle = !generated
                  ? "Add a valid URL to make a QR."
                  : !isQrEligible
                  ? "Fix required fields to make a QR."
                  : `QR code for row ${i + 1}`;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                    className={`border-b border-gray-100 align-top ${
                      isBulkChecked
                        ? "bg-blue-50/40"
                        : isSelected
                        ? "bg-blue-50/70"
                        : "hover:bg-gray-50/50"
                    }`}
                  >
                    {/* Per-row bulk-selection checkbox
                        z-30: above sticky body cells (z-20) so checkbox is tappable
                        even when the sticky columns are at the same horizontal position. */}
                    <td className="relative z-30 px-2 py-2 text-center bg-white" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isBulkChecked}
                        onChange={() => toggleRowSelection(row.id)}
                        aria-label={`Select row ${i + 1} for bulk edit`}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-400 cursor-pointer"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        aria-label={`Select row ${i + 1}`}
                        className={`h-6 w-6 rounded text-xs font-medium ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {i + 1}
                      </button>
                    </td>
                    {/* Review badge cell — only when onReviewChange is provided (workspace mode).
                        Gating on onReviewChange (not reviewMap) ensures the column renders even
                        for workspaces with no prior review data (empty/legacy reviewMap = all Unreviewed).
                        Guard #1: overflow-hidden keeps badge within the 80px column.
                        Guard #5: z-[50] on the popover itself (in ReviewBadge).
                        Guard #11: testidSuffix="table" for dual-render safety. */}
                    {onReviewChange !== undefined && !isPreview && (
                      <td
                        className="px-1 py-2 align-middle overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: "80px" }}
                      >
                        <ReviewBadge
                          rowId={row.id}
                          rowIndex={i}
                          reviewState={getRowReviewState(reviewMap, row.id)}
                          reviewEntry={getRowReviewEntry(reviewMap, row.id)}
                          reviewerName={reviewerName}
                          onSetReview={handleSetReview}
                          onClearReview={handleClearReview}
                          onNameChange={onReviewerNameChange}
                          testidSuffix="table"
                        />
                      </td>
                    )}
                    {onReviewChange !== undefined && isPreview && (
                      <td className="px-1 py-2 align-middle" style={{ width: "80px" }}>
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${
                          getRowReviewState(reviewMap, row.id) === "approved"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : getRowReviewState(reviewMap, row.id) === "needs-changes"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-indigo-50 text-indigo-600 border border-indigo-200"
                        }`}>
                          {getRowReviewState(reviewMap, row.id) === "approved" ? "✓" :
                           getRowReviewState(reviewMap, row.id) === "needs-changes" ? "⚠" : "—"}
                        </span>
                      </td>
                    )}
                    {COLUMNS.map((field) => {
                      const cellKey = warningKey(row.id, field);
                      const rawCellWarnings = warnings.get(cellKey);
                      // P2: on a fresh preset row, suppress "required" warnings until the user touches the row
                      const cellWarnings = (presetFreshRows.has(row.id) && rawCellWarnings)
                        ? rawCellWarnings.filter((w) => w.rule !== "required")
                        : rawCellWarnings;
                      // P2: when a fresh preset row's required field is empty, show a muted placeholder
                      const isPresetFreshRequired = presetFreshRows.has(row.id) &&
                        settings.requiredParams &&
                        ["utm_source", "utm_medium", "utm_campaign"].includes(field) &&
                        !row[field].trim();
                      const flashKey = `${row.id}:${field}`;
                      const isFlashing = flashCells.has(flashKey);
                      const isUtmField = field !== "baseUrl";
                      const canFix =
                        isUtmField &&
                        cellWarnings &&
                        hasCellFix(cellWarnings) &&
                        isCellFixable(row[field], settings);
                      // Datalist: native autocomplete for allowed values when enforce is on
                      const datalistId =
                        isUtmField && spec.enforceSpec && spec.allowedValues[field as UtmField].length > 0
                          ? `datalist-${field}`
                          : undefined;
                      // Off-spec warning for "Fix to <nearest>"
                      const offSpecWarning = cellWarnings?.find((w) => w.rule === "off-spec");
                      const offSpecNearest = offSpecWarning
                        ? nearestAllowedValue(row[field as UtmField] ?? "", spec.allowedValues[field as UtmField])
                        : null;
                      // Fix A: violet border/bg whenever ANY warning is off-spec (not just when it's the only one)
                      const hasOffSpec = !!offSpecWarning;
                      const hasOffTemplate = cellWarnings?.some((w) => w.rule === "off-template") ?? false;
                      // Show composer button on utm_campaign cell when template has segments
                      const showComposer = field === "utm_campaign" && namingTemplate.segments.length > 0 && !isPreview;
                      return (
                        /* relative z-[11]: creates stacking context above sticky right
                           columns (z-10) so warning popovers and "Fix to" chips are
                           tappable on mobile at every horizontal scroll position.
                           Fix 6: overflow-visible (not overflow-hidden) so warning badges
                           and "Build name" buttons aren't clipped when enforce is on. */
                        <td key={field} className="relative z-[11] px-2 py-2" style={{ width: field === "baseUrl" ? "160px" : "120px" }}>
                          {/* Column width is set by the th minWidth above.
                              Inputs use w-full to fill the cell for readable display.
                              title attr shows full value on hover — cheap scan aid for Dana. */}
                          <input
                            value={row[field]}
                            onChange={(e) => !isPreview && updateCell(row.id, field, e.target.value)}
                            onFocus={() => !isPreview && setSelectedId(row.id)}
                            aria-label={`${FIELD_LABELS[field]} row ${i + 1}`}
                            aria-invalid={!!cellWarnings && !isPresetFreshRequired}
                            aria-disabled={isPreview || undefined}
                            placeholder={isPresetFreshRequired ? "Add a campaign name" : field === "baseUrl" ? "https://…" : ""}
                            title={row[field] || undefined}
                            spellCheck={false}
                            list={!isPreview ? datalistId : undefined}
                            readOnly={isPreview}
                            disabled={isPreview}
                            className={`w-full rounded-md border pl-2 pr-7 py-1.5 font-mono text-xs transition-colors duration-300 ${
                              isPreview
                                ? "border-gray-200 bg-slate-100 text-gray-400 cursor-not-allowed focus:outline-none"
                                : isFlashing
                                ? "border-green-400 bg-green-50 focus:outline-none"
                                : cellWarnings && hasOffTemplate
                                ? "border-teal-400 bg-teal-50 focus:outline-none focus:border-teal-500"
                                : cellWarnings && hasOffSpec
                                ? "border-violet-400 bg-violet-50 focus:outline-none focus:border-violet-500"
                                : cellWarnings
                                ? "border-amber-400 bg-amber-50 focus:outline-none focus:border-amber-500"
                                : isPresetFreshRequired
                                ? "border-gray-300 bg-gray-50 focus:outline-none focus:border-blue-500"
                                : "border-gray-200 bg-white focus:outline-none focus:border-blue-500"
                            }`}
                          />
                          {/* "Build name" composer button — on utm_campaign cell when template has segments.
                              NOT adjacent to Dup/Delete row controls (those are in the Actions column).
                              Fix 2: ≥44px touch target, solid teal fill, clearly labeled, distinct from Dup/Del.
                              Fix 5: passes anchorRect so the portal-rendered popover is never clipped. */}
                          {showComposer && (
                            <div className="relative">
                              <button
                                type="button"
                                data-testid={`build-name-btn-${row.id}-table`}
                                aria-label={`Build campaign name for row ${i + 1}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                  setComposerAnchorRect(composerOpenRowId === row.id ? null : rect);
                                  setComposerOpenRowId((prev) =>
                                    prev === row.id ? null : row.id
                                  );
                                }}
                                className="mt-1 inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-teal-400 bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 active:bg-teal-800 shadow-sm"
                              >
                                <span aria-hidden="true">⊞</span>
                                <span>Build name</span>
                              </button>
                              {composerOpenRowId === row.id && (
                                <BuildNameComposer
                                  template={namingTemplate}
                                  currentValue={row.utm_campaign}
                                  onApply={(value) => {
                                    pushUndo("Build campaign name", rows);
                                    setRows((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id ? { ...r, utm_campaign: value } : r
                                      )
                                    );
                                    flashCellKeys([`${row.id}:utm_campaign`]);
                                  }}
                                  onClose={() => { setComposerOpenRowId(null); setComposerAnchorRect(null); }}
                                  testIdSuffix={`${row.id}-table`}
                                  anchorRect={composerAnchorRect}
                                />
                              )}
                            </div>
                          )}
                          {/* Off-template "Build name…" link — opens composer (Fix 5: pass anchorRect) */}
                          {hasOffTemplate && field === "utm_campaign" && !isPreview && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                setComposerAnchorRect(rect);
                                setComposerOpenRowId(row.id);
                              }}
                              className="mt-0.5 inline-flex min-h-[44px] items-center rounded-full border border-teal-300 bg-teal-100 px-2.5 py-1 text-[11px] font-medium text-teal-800 hover:bg-teal-200"
                              aria-label={`Build campaign name to fix off-template value in row ${i + 1}`}
                            >
                              Build name…
                            </button>
                          )}
                          {/* Fix B: inline "Fix to <value>" chip — auto-revealed, ≥44px tap target,
                              NOT gated behind the warnings pill, rendered above sticky columns (z-[11] from td).
                              Named to target value so it never reads as Dup/Delete/Set column. */}
                          {offSpecNearest && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                pushUndo("Fix to allowed value", rows);
                                setRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, [field]: offSpecNearest } : r
                                  )
                                );
                                flashCellKeys([`${row.id}:${field}`]);
                              }}
                              aria-label={`Fix to ${offSpecNearest}`}
                              data-testid={`fix-to-${offSpecNearest}`}
                              className="mt-0.5 inline-flex min-h-[44px] items-center rounded-full border border-violet-300 bg-violet-100 px-2.5 py-1 text-[11px] font-medium text-violet-800 hover:bg-violet-200 active:bg-violet-300"
                            >
                              Fix to {offSpecNearest}
                            </button>
                          )}
                          {cellWarnings && (
                            <CellWarnings
                              warnings={cellWarnings}
                              canFix={!!canFix}
                              onFix={
                                canFix
                                  ? () => fixCell(row.id, field as UtmField, row[field])
                                  : undefined
                              }
                              offSpecNearest={offSpecNearest ?? undefined}
                              onFixOffSpec={
                                offSpecNearest
                                  ? () => {
                                      pushUndo("Fix to allowed value", rows);
                                      setRows((prev) =>
                                        prev.map((r) =>
                                          r.id === row.id ? { ...r, [field]: offSpecNearest } : r
                                        )
                                      );
                                      flashCellKeys([`${row.id}:${field}`]);
                                    }
                                  : undefined
                              }
                            />
                          )}
                        </td>
                      );
                    })}
                    {/* Sticky Generated URL — truncated with title tooltip.
                        Width: 160px when Review column active (to keep 1212px budget), 240px otherwise.
                        Copy button (in Actions) copies the FULL untruncated URL (title has full value). */}
                    <td className="sticky right-[148px] z-20 px-2 py-2 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] overflow-hidden bg-white" style={{ width: onReviewChange !== undefined ? "160px" : "240px" }}>
                      <output
                        aria-label={`Generated URL row ${i + 1}`}
                        title={generated}
                        className={`block w-full truncate rounded-md bg-gray-50 px-2 py-1.5 font-mono text-xs ${
                          generated ? "text-gray-800" : "text-gray-400"
                        }`}
                      >
                        {generated || "—"}
                      </output>
                    </td>
                    {/* Sticky Actions — widened to 148px to fit QR button beside Copy.
                        z-20 ensures it floats above scrolling cells.
                        relative: anchor for the absolute-positioned QR popover (z-50, above z-20/z-30 sticky cols).
                        The QR popover is rendered with z-50 so it appears above this column. */}
                    <td className="relative sticky right-0 z-20 px-3 py-2 whitespace-nowrap shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] bg-white" style={{ width: "148px" }}>
                      <span className="inline-flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => void copyText(generated, row.id)}
                            disabled={!generated}
                            aria-label={`Copy URL row ${i + 1}`}
                            className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                          >
                            Copy
                          </button>
                          {/* QR button — icon + "QR" label, disabled with tooltip when URL empty or blocking lint.
                              Fix 1: disabled when row has missing required params or invalid URL.
                              Fix 4: captures the trigger's DOMRect so the popover can anchor beside it. */}
                          <button
                            type="button"
                            onClick={(e) => {
                              const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                              if (openQrRowId === row.id) {
                                setOpenQrRowId(null);
                                setQrTriggerRect(null);
                              } else {
                                setOpenQrRowId(row.id);
                                setQrTriggerRect(rect);
                              }
                            }}
                            disabled={!isQrEligible}
                            aria-label={`QR code for row ${i + 1}`}
                            title={qrBtnTitle}
                            aria-expanded={openQrRowId === row.id}
                            className="inline-flex items-center gap-0.5 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                          >
                            <span aria-hidden="true">⊞</span> QR
                          </button>
                          {/* Icon-only with tooltips — Fix A: never reads "Dup"/"Del" */}
                          <button
                            type="button"
                            onClick={() => duplicateRow(row.id)}
                            aria-label={`Duplicate row ${i + 1}`}
                            title="Duplicate row"
                            className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                          >
                            ⧉
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRow(row.id)}
                            aria-label={`Delete row ${i + 1}`}
                            title="Delete row"
                            className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            🗑
                          </button>
                        </span>
                        {copied === row.id && (
                          <span aria-live="polite" className="text-xs font-medium text-green-600">
                            Copied
                          </span>
                        )}
                      </span>
                      {/* QR popover — Fix 4: rendered via portal anchored to trigger, clamped in viewport.
                          Passes triggerRect so QrPopover can position itself beside (not below) the trigger.
                          On click-out / Esc the popover closes. One open at a time. */}
                      {openQrRowId === row.id && isQrEligible && generated && (
                        <QrPopover
                          url={generated}
                          rowIndex={i + 1}
                          onClose={() => { setOpenQrRowId(null); setQrTriggerRect(null); }}
                          triggerRect={qrTriggerRect}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          {/* ── END TABLE VIEW ──────────────────────────────────────────────── */}

          {/* ── CARD VIEW (below sm / ≤639px) ──────────────────────────────── */}
          {/* sm:hidden = visible only on narrow (phone) viewports.
              No JS, no useEffect, no matchMedia — pure Tailwind breakpoint.
              All testids suffixed with -card to avoid dual-mount getByTestId collision. */}
          <div className="sm:hidden flex flex-col gap-3">
            {/* Card-view select-all bar */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <label className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 cursor-pointer">
                <SelectAllCheckbox
                  rows={rows}
                  selectedRowIds={selectedRowIds}
                  onToggleAll={toggleSelectAll}
                />
                <span className="text-xs font-medium text-gray-500">
                  {selectedRowIds.size > 0 ? `${selectedRowIds.size} selected` : "Select all"}
                </span>
              </label>
            </div>

            {rows.map((row, i) => {
              const generated = buildUtmUrl(row);
              const isBulkChecked = selectedRowIds.has(row.id);
              // Fix 1: compute QR eligibility DIRECTLY from the same warnings map the grid
              // renders — same fix as table view, ensures button state matches visible warning.
              const rowHasBlockingLintCard = (
                [...UTM_FIELDS, "baseUrl" as const].some(
                  (f) => (warnings.get(warningKey(row.id, f)) ?? []).some(
                    (w) => BLOCKING_QR_LINT_RULES.has(w.rule)
                  )
                )
              );
              const isQrEligibleCard = !!(generated) && !rowHasBlockingLintCard;
              const qrBtnTitleCard = !generated
                ? "Add a valid URL to make a QR."
                : !isQrEligibleCard
                ? "Fix required fields to make a QR."
                : `QR code for row ${i + 1}`;
              return (
                <div
                  key={row.id}
                  className={`rounded-lg border p-4 flex flex-col gap-3 ${
                    isPreview
                      ? "border-slate-200 bg-slate-50"
                      : isBulkChecked
                      ? "border-blue-300 bg-blue-50/40"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {/* Card top bar: checkbox + row number + Duplicate / Delete (or lock icon in preview) */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!isPreview && (
                        <label className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isBulkChecked}
                            onChange={() => toggleRowSelection(row.id)}
                            aria-label={`Select row ${i + 1} for bulk edit`}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-400 cursor-pointer"
                          />
                          <span className="text-xs font-medium text-gray-500" aria-hidden="true">Select</span>
                        </label>
                      )}
                      <span className="text-xs font-medium text-gray-400">#{i + 1}</span>
                      {isPreview && (
                        <span aria-hidden="true" className="text-sm text-gray-400" title="Read-only preview">🔒</span>
                      )}
                    </div>
                    {!isPreview && (
                      <div className="flex items-center gap-1.5">
                        {/* QR button — icon + "QR" label, ≥44px touch target.
                            Fix 1: disabled when row has blocking lint (required/invalid-url). */}
                        <button
                          type="button"
                          onClick={() => {
                            // Fix 2: prevent scroll-jump by not changing focus to top.
                            setOpenQrRowId(openQrRowId === row.id ? null : row.id);
                          }}
                          disabled={!isQrEligibleCard}
                          aria-label={`QR code for row ${i + 1}`}
                          aria-expanded={openQrRowId === row.id}
                          title={qrBtnTitleCard}
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-0.5 rounded-md border border-gray-200 px-2 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                          <span aria-hidden="true">⊞</span>{" "}QR
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateRow(row.id)}
                          aria-label={`Duplicate row ${i + 1}`}
                          title="Duplicate row"
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-100"
                        >
                          ⧉
                          <span className="sr-only">{" "}Duplicate row</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRow(row.id)}
                          aria-label={`Delete row ${i + 1}`}
                          title="Delete row"
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-gray-200 text-sm text-red-600 hover:bg-red-50"
                        >
                          🗑
                          <span className="sr-only">{" "}Delete row</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Review badge in card view — only when onReviewChange is provided (workspace mode).
                      Gating on onReviewChange ensures empty/legacy workspaces still show badges.
                      Guard #5: popover z-[50] (in ReviewBadge).
                      Guard #6: role="dialog" on popover, single instance per card.
                      Guard #11: testidSuffix="card" for dual-render safety. */}
                  {onReviewChange !== undefined && !isPreview && (
                    <div className="w-full">
                      <ReviewBadge
                        rowId={row.id}
                        rowIndex={i}
                        reviewState={getRowReviewState(reviewMap, row.id)}
                        reviewEntry={getRowReviewEntry(reviewMap, row.id)}
                        reviewerName={reviewerName}
                        onSetReview={handleSetReview}
                        onClearReview={handleClearReview}
                        onNameChange={onReviewerNameChange}
                        testidSuffix="card"
                      />
                    </div>
                  )}

                  {/* Stacked fields: label above each full-width input */}
                  {COLUMNS.map((field) => {
                    const cellKey = warningKey(row.id, field);
                    const rawCellWarnings = warnings.get(cellKey);
                    // P2: on a fresh preset row, suppress "required" warnings until touched
                    const cellWarnings = (presetFreshRows.has(row.id) && rawCellWarnings)
                      ? rawCellWarnings.filter((w) => w.rule !== "required")
                      : rawCellWarnings;
                    const isPresetFreshRequired = presetFreshRows.has(row.id) &&
                      settings.requiredParams &&
                      ["utm_source", "utm_medium", "utm_campaign"].includes(field) &&
                      !row[field].trim();
                    const flashKey = `${row.id}:${field}`;
                    const isFlashing = flashCells.has(flashKey);
                    const isUtmField = field !== "baseUrl";
                    const canFix =
                      isUtmField &&
                      cellWarnings &&
                      hasCellFix(cellWarnings) &&
                      isCellFixable(row[field], settings);
                    const datalistId =
                      isUtmField && spec.enforceSpec && spec.allowedValues[field as UtmField].length > 0
                        ? `datalist-${field}`
                        : undefined;
                    const offSpecWarning = cellWarnings?.find((w) => w.rule === "off-spec");
                    const offSpecNearest = offSpecWarning
                      ? nearestAllowedValue(row[field as UtmField] ?? "", spec.allowedValues[field as UtmField])
                      : null;
                    const hasOffSpec = !!offSpecWarning;
                    const hasOffTemplateCard = cellWarnings?.some((w) => w.rule === "off-template") ?? false;
                    const showComposerCard = field === "utm_campaign" && namingTemplate.segments.length > 0 && !isPreview;
                    return (
                      <div key={field} className="flex flex-col gap-1">
                        <label
                          htmlFor={`card-${row.id}-${field}`}
                          className="text-[11px] font-semibold uppercase tracking-wide text-gray-400"
                        >
                          {FIELD_LABELS[field]}
                          {settings.requiredParams &&
                            ["utm_source", "utm_medium", "utm_campaign"].includes(field) && (
                              <span className="ml-0.5 text-red-500" title="Required">
                                *
                              </span>
                            )}
                        </label>
                        <input
                          id={`card-${row.id}-${field}`}
                          value={row[field]}
                          onChange={(e) => !isPreview && updateCell(row.id, field, e.target.value)}
                          onFocus={() => !isPreview && setSelectedId(row.id)}
                          aria-label={`${FIELD_LABELS[field]} row ${i + 1}`}
                          aria-invalid={!!cellWarnings && !isPresetFreshRequired}
                          aria-disabled={isPreview || undefined}
                          placeholder={isPresetFreshRequired ? "Add a campaign name" : field === "baseUrl" ? "https://…" : ""}
                          spellCheck={false}
                          list={!isPreview ? datalistId : undefined}
                          readOnly={isPreview}
                          disabled={isPreview}
                          className={`w-full rounded-md border px-3 py-3 font-mono text-sm transition-colors duration-300 min-h-[44px] ${
                            isPreview
                              ? "border-gray-200 bg-slate-100 text-gray-400 cursor-not-allowed focus:outline-none"
                              : isFlashing
                              ? "border-green-400 bg-green-50 focus:outline-none"
                              : cellWarnings && hasOffTemplateCard
                              ? "border-teal-400 bg-teal-50 focus:outline-none focus:border-teal-500"
                              : cellWarnings && hasOffSpec
                              ? "border-violet-400 bg-violet-50 focus:outline-none focus:border-violet-500"
                              : cellWarnings
                              ? "border-amber-400 bg-amber-50 focus:outline-none focus:border-amber-500"
                              : isPresetFreshRequired
                              ? "border-gray-300 bg-gray-50 focus:outline-none focus:border-blue-500"
                              : "border-gray-200 bg-white focus:outline-none focus:border-blue-500"
                          }`}
                        />
                        {/* Build name composer button for utm_campaign in card view — Fix 2: ≥44px, solid fill.
                            Fix 5: passes anchorRect for portal-based positioning at 375px. */}
                        {showComposerCard && (
                          <div className="relative">
                            <button
                              type="button"
                              data-testid={`build-name-btn-${row.id}-card`}
                              aria-label={`Build campaign name for row ${i + 1}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                setComposerAnchorRect(composerOpenRowId === `${row.id}-card` ? null : rect);
                                setComposerOpenRowId((prev) =>
                                  prev === `${row.id}-card` ? null : `${row.id}-card`
                                );
                              }}
                              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-teal-400 bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 active:bg-teal-800 shadow-sm"
                            >
                              <span aria-hidden="true">⊞</span>
                              <span>Build name</span>
                            </button>
                            {composerOpenRowId === `${row.id}-card` && (
                              <BuildNameComposer
                                template={namingTemplate}
                                currentValue={row.utm_campaign}
                                onApply={(value) => {
                                  pushUndo("Build campaign name", rows);
                                  setRows((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id ? { ...r, utm_campaign: value } : r
                                    )
                                  );
                                  flashCellKeys([`${row.id}:utm_campaign`]);
                                }}
                                onClose={() => { setComposerOpenRowId(null); setComposerAnchorRect(null); }}
                                testIdSuffix={`${row.id}-card`}
                                anchorRect={composerAnchorRect}
                              />
                            )}
                          </div>
                        )}
                        {/* Off-template "Build name…" link in card view (Fix 5: pass anchorRect) */}
                        {hasOffTemplateCard && field === "utm_campaign" && !isPreview && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                              setComposerAnchorRect(rect);
                              setComposerOpenRowId(`${row.id}-card`);
                            }}
                            className="inline-flex min-h-[44px] items-center self-start rounded-full border border-teal-300 bg-teal-100 px-3 py-2 text-[12px] font-medium text-teal-800 hover:bg-teal-200"
                            aria-label={`Build campaign name to fix off-template value in row ${i + 1}`}
                          >
                            Build name…
                          </button>
                        )}
                        {/* Inline "Fix to <value>" chip — in normal flow, never overlay */}
                        {offSpecNearest && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              pushUndo("Fix to allowed value", rows);
                              setRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id ? { ...r, [field]: offSpecNearest } : r
                                )
                              );
                              flashCellKeys([`${row.id}:${field}`]);
                            }}
                            aria-label={`Fix to ${offSpecNearest}`}
                            data-testid={`fix-to-${offSpecNearest}-card`}
                            className="inline-flex min-h-[44px] items-center self-start rounded-full border border-violet-300 bg-violet-100 px-3 py-2 text-[12px] font-medium text-violet-800 hover:bg-violet-200 active:bg-violet-300"
                          >
                            Fix to{" "}{offSpecNearest}
                          </button>
                        )}
                        {/* Lint warnings inline under field — in normal flow, never overlay */}
                        {cellWarnings && (
                          <CellWarnings
                            warnings={cellWarnings}
                            canFix={!!canFix}
                            onFix={
                              canFix
                                ? () => fixCell(row.id, field as UtmField, row[field])
                                : undefined
                            }
                            offSpecNearest={offSpecNearest ?? undefined}
                            onFixOffSpec={
                              offSpecNearest
                                ? () => {
                                    pushUndo("Fix to allowed value", rows);
                                    setRows((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id ? { ...r, [field]: offSpecNearest } : r
                                      )
                                    );
                                    flashCellKeys([`${row.id}:${field}`]);
                                  }
                                : undefined
                            }
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Generated URL block — full width, no truncation */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Generated URL
                    </span>
                    <output
                      aria-label={`Generated URL row ${i + 1}`}
                      className={`w-full break-all rounded-md bg-gray-50 px-3 py-2 font-mono text-xs select-all ${
                        generated ? "text-gray-800" : "text-gray-400"
                      }`}
                    >
                      {generated || "—"}
                    </output>
                    {/* Full-width Copy button — ≥44px, primary mobile CTA */}
                    <button
                      type="button"
                      data-testid={`copy-url-row-${i + 1}-card`}
                      onClick={() => void copyText(generated, `${row.id}-card`)}
                      disabled={!generated}
                      aria-label={`Copy URL row ${i + 1}`}
                      className="w-full rounded-md border border-blue-600 bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 min-h-[44px]"
                    >
                      {copied === `${row.id}-card` ? "Copied!" : "Copy URL"}
                    </button>
                    {copied === `${row.id}-card` && (
                      <span role="status" aria-live="polite" className="sr-only">
                        URL copied
                      </span>
                    )}
                  </div>

                  {/* QR panel — Fix 2: stacked BELOW the card's fields, in normal card flow.
                      Never overlays a field, checkbox, or button. Full-width at ≤640px.
                      Renders only when QR-eligible (no blocking lint). */}
                  {openQrRowId === row.id && isQrEligibleCard && generated && (
                    <div className="mt-1">
                      <QrPopover
                        url={generated}
                        rowIndex={i + 1}
                        onClose={() => setOpenQrRowId(null)}
                        cardFlow
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* ── END CARD VIEW ──────────────────────────────────────────────── */}

      </div>

      {/* Desktop panels — always BELOW the grid (never beside it) so the grid uses full page width.
          Fix 2(a): removed the right-rail sidebar that was permanently squeezing the editable grid.
          Both default and workspace mode use this below-grid layout.
          Hidden on mobile (<900px) — mobile uses the disclosure sections above the grid. */}
      <div className="hidden min-[900px]:block mt-2">
        {isWorkspaceMode ? (
          /* Workspace mode: NamingTemplate + UtmSpec in a 2-col row */
          <div className="grid grid-cols-2 gap-4">
            <NamingTemplatePanel
              template={namingTemplate}
              onChange={setNamingTemplate}
              enforceTemplate={!!namingTemplate.enforceTemplate}
              onEnforceTemplateChange={(v) =>
                setNamingTemplate({ ...namingTemplate, enforceTemplate: v })
              }
              desktopOnly
            />
            <UtmSpecPanel
              spec={spec}
              onChange={setSpec}
              workspaceMode={true}
              syncStatus={specSyncStatus}
              syncSavedAt={specSavedAt}
              desktopOnly
            />
          </div>
        ) : (
          /* Default mode: NamingTemplate + Campaigns + UtmSpec in a 3-col row */
          <div className="grid grid-cols-3 gap-4">
            <NamingTemplatePanel
              template={namingTemplate}
              onChange={setNamingTemplate}
              enforceTemplate={!!namingTemplate.enforceTemplate}
              onEnforceTemplateChange={(v) =>
                setNamingTemplate({ ...namingTemplate, enforceTemplate: v })
              }
              desktopOnly
            />
            <CampaignsSidebar
              campaigns={campaigns}
              openCampaignId={openCampaignId}
              isDirty={isDirty}
              onSave={handleCampaignSaved}
              onOpen={openCampaign}
              onChange={handleCampaignsChanged}
              rows={rows}
              settings={settings}
              spec={spec}
              namingTemplate={namingTemplate}
              savedFlash={savedFlash}
              desktopOnly
            />
            <UtmSpecPanel
              spec={spec}
              onChange={setSpec}
              onLoadSample={handleLoadSample}
              onShareSpec={() => void copyShareLink()}
              specLinkCopied={shareLinkCopied}
              workspaceMode={false}
              desktopOnly
            />
          </div>
        )}
      </div>

      {/* F: Trust note — mode-aware (Fix 1). */}
      {isWorkspaceMode ? (
        <p className="text-xs text-gray-400">
          Generated URLs are trimmed of trailing spaces; your source cells are left as typed.
          Changes are synced to the server workspace automatically — anyone with the secret link can view and edit.
        </p>
      ) : (
        <p className="text-xs text-gray-400">
          Generated URLs are trimmed of trailing spaces; your source cells are left as typed.
          Everything runs in your browser — no account, no server, no network
          requests after page load. Grid rows, presets, campaigns, and lint toggles are
          saved in localStorage.
        </p>
      )}

      {/* Toast stack */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-lg text-sm text-gray-800"
            >
              <span>{t.message}</span>
              {t.undoLabel && (
                <button
                  type="button"
                  onClick={() => { dismissToast(t.id); undo(); }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  {t.undoLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Dismiss"
                className="ml-1 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {pendingImport && (
        <ImportDialog
          pending={pendingImport}
          onConfirm={confirmImport}
          onCancel={() => setPendingImport(null)}
        />
      )}

      {auditDialogOpen && (
        <AuditDialog
          currentGridCount={rows.length}
          onCommit={confirmAudit}
          onCancel={() => setAuditDialogOpen(false)}
        />
      )}
    </div>
  );
}

// ── SelectAllCheckbox ─────────────────────────────────────────────────────────

function SelectAllCheckbox({
  rows,
  selectedRowIds,
  onToggleAll,
}: {
  rows: UtmRow[];
  selectedRowIds: Set<string>;
  onToggleAll: (allRowIds: string[], allSelected: boolean) => void;
}) {
  const allRowIds = rows.map((r) => r.id);
  const allSelected = allRowIds.length > 0 && allRowIds.every((id) => selectedRowIds.has(id));
  const someSelected = allRowIds.some((id) => selectedRowIds.has(id));
  const indeterminate = someSelected && !allSelected;

  const ref = (el: HTMLInputElement | null) => {
    if (el) el.indeterminate = indeterminate;
  };

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={allSelected}
      onChange={() => onToggleAll(allRowIds, allSelected)}
      aria-label="Select all rows for bulk edit"
      className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-400 cursor-pointer"
    />
  );
}

// ── CellWarnings ──────────────────────────────────────────────────────────────

function CellWarnings({
  warnings,
  canFix,
  onFix,
  offSpecNearest,
  onFixOffSpec,
}: {
  warnings: LintWarning[];
  canFix: boolean;
  onFix?: () => void;
  /** Nearest allowed value for off-spec fix — shown inside popover only. */
  offSpecNearest?: string;
  onFixOffSpec?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const count = warnings.length;
  const hasOffSpec = warnings.some((w) => w.rule === "off-spec");

  // Fix A: violet when ANY warning is off-spec (not just when it's the only warning)
  const badgeColor = hasOffSpec
    ? "bg-violet-200 text-violet-800"
    : "bg-amber-200 text-amber-800";
  const textColor = hasOffSpec ? "text-violet-700" : "text-amber-700";
  const hoverTextColor = hasOffSpec ? "hover:text-violet-900" : "hover:text-amber-900";

  const renderMessage = (w: LintWarning, j: number) => {
    const isOffSpec = w.rule === "off-spec";
    const msgColor = isOffSpec ? "text-violet-800" : "text-amber-800";
    return (
      <p key={j} role="alert" className={`text-[11px] leading-tight ${msgColor} mb-1 last:mb-0`}>
        {isOffSpec ? "◆" : "⚠"}{" "}{w.message}
        {/* Fix B: "Fix to" chip is inline on the cell; in the popover just show the message text */}
      </p>
    );
  };

  if (count === 1) {
    return (
      <div className="mt-1">
        <p role="alert" className={`max-w-52 text-[11px] leading-tight ${textColor}`}>
          {hasOffSpec ? "◆" : "⚠"}{" "}{warnings[0].message}
          {/* Fix B: "Fix to" chip is rendered directly on the cell (inline, auto-revealed),
              so we don't render it again here to avoid duplication */}
          {!hasOffSpec && canFix && onFix && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFix(); }}
              className="ml-1 text-blue-600 hover:underline font-medium"
            >
              Fix
            </button>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-1 relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
        className={`flex items-center gap-1 text-[11px] ${textColor} ${hoverTextColor}`}
        aria-expanded={expanded}
      >
        <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${badgeColor} text-[10px] font-bold`}>
          {count}
        </span>
        <span>warning{count === 1 ? "" : "s"}</span>
        {!hasOffSpec && canFix && onFix && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFix?.(); }}
            className="ml-1 text-blue-600 hover:underline font-medium"
          >
            Fix
          </button>
        )}
      </button>
      {/* Popover: z-30 so it renders above sticky columns (z-10/z-20) on mobile */}
      <div className={expanded ? "absolute left-0 top-5 z-30 w-64 rounded-md border border-gray-200 bg-white p-2 shadow-lg" : "sr-only"}>
        {warnings.map((w, j) => renderMessage(w, j))}
        {hasOffSpec && canFix && onFix && (
          <div className="mt-1 pt-1 border-t border-gray-100">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFix?.(); }}
              className="text-[11px] text-blue-600 hover:underline font-medium"
            >
              Auto-fix naming
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
