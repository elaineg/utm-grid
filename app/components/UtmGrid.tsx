"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { buildUtmUrl } from "../../lib/utm";
import { useLocalStorage } from "../../lib/useLocalStorage";
import { ImportDialog, type ImportMode, type PendingImport } from "./ImportDialog";
import { PresetsBar } from "./PresetsBar";
import { CampaignsSidebar } from "./CampaignsSidebar";
import { BulkEditBar, type BulkColumn } from "./BulkEditBar";
import { UtmSpecPanel } from "./UtmSpecPanel";
import {
  deserializeCampaigns,
  extractSpecFromCampaign,
  serializeCampaigns,
  findCampaign,
  type Campaign,
} from "../../lib/campaigns";

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

export function UtmGrid() {
  const [storedRows, setStoredRows] = useLocalStorage<UtmRow[]>("utm-grid:rows", INITIAL_ROWS, {
    debounceMs: 400,
  });
  const storedRowsNormalized =
    Array.isArray(storedRows) && storedRows.length > 0 ? storedRows : INITIAL_ROWS;

  const idCounter = useRef(1);
  // newId is defined after rows is resolved below.

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    pendingSharedState.current = { rows: payload.rows, settings: payload.settings };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSharedRows(payload.rows);
    setSharedSettings(payload.settings);
    setSharedSpec(payloadSpec);
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
    "utm-grid:lint-settings",
    DEFAULT_LINT_SETTINGS
  );

  // ── UTM Spec state ─────────────────────────────────────────────────────────
  const [storedSpec, setStoredSpec] = useLocalStorage<UtmSpec>(
    "utm-grid:utm-spec",
    DEFAULT_SPEC
  );

  const [userPresets, setPresets] = useLocalStorage<Preset[]>("utm-grid:presets", []);
  const [newRowPresetId, setNewRowPresetId] = useLocalStorage<string | null>(
    "utm-grid:new-row-preset",
    null
  );

  // ── Campaigns library state ────────────────────────────────────────────────
  // Stored as JSON string in localStorage (reuses the same store pattern).
  const [rawCampaigns, setRawCampaigns] = useLocalStorage<string>(
    "utm-grid:campaigns",
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
    "utm-grid:open-campaign-id",
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

    const rawId = window.localStorage.getItem("utm-grid:open-campaign-id");
    if (!rawId) return;
    const parsedId = robustParse<string>(rawId);
    if (!parsedId || typeof parsedId !== "string") return;

    // Validate against existing saved campaigns (read directly too, for the same reason).
    const rawCampaignsStored = window.localStorage.getItem("utm-grid:campaigns");
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
      window.localStorage.removeItem("utm-grid:open-campaign-id");
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

  // ── Effective rows / settings / spec (shared or stored) ──────────────────
  const rows: UtmRow[] = isUsingSharedState && sharedRows ? sharedRows : storedRowsNormalized;
  const settings: LintSettings = isUsingSharedState && sharedSettings ? sharedSettings : storedSettings;
  const spec: UtmSpec = isUsingSharedState && sharedSpec ? sharedSpec : storedSpec;

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
    pendingSharedState.current = null;
    setSharedRows(null);
    setSharedSettings(null);
    setSharedSpec(null);
    setIsUsingSharedState(false);
    setSharedBanner(null);
  }, [isUsingSharedState, setStoredRows, setStoredSettings, sharedSpec, setStoredSpec]);

  const setRows = useCallback(
    (next: UtmRow[] | ((prev: UtmRow[]) => UtmRow[])) => {
      if (isUsingSharedState) {
        const sRows = pendingSharedState.current?.rows ?? storedRowsNormalized;
        const sSettings = pendingSharedState.current?.settings ?? storedSettings;
        const nextRows = typeof next === "function" ? next(sRows) : next;
        setStoredRows(nextRows);
        setStoredSettings(sSettings);
        if (sharedSpec) setStoredSpec(sharedSpec);
        pendingSharedState.current = null;
        setSharedRows(null);
        setSharedSettings(null);
        setSharedSpec(null);
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
    [isUsingSharedState, storedRowsNormalized, storedSettings, sharedSpec, setStoredSpec, setStoredRows, setStoredSettings, clearSavedFlash]
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
    () => groupWarnings(lintRows(rows, settings, spec)),
    [rows, settings, spec]
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
    const url = buildShareUrl({ rows, settings, spec });
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

  const exportCsv = () => {
    const blob = new Blob([rowsToCsv(rows)], { type: "text/csv" });
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

  const toggle = (key: keyof LintSettings, label: string) => (
    <label className="flex items-center gap-1.5 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={settings[key]}
        onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.checked }))}
      />
      {label}
    </label>
  );

  const canUndo = undoCount > 0;

  return (
    <div className="space-y-4">
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
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Export CSV
        </button>
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
                <span>✓</span>{" "}
                <span>Link copied!</span>
              </span>
            ) : (
              "Copy share link"
            )}
          </button>
          {/* Fix B (bundled): aria-live region ensures "Link copied!" is announced on mobile
              even when the button text swap itself might not be detected by screen readers */}
          <span role="status" aria-live="polite" className="text-xs font-medium text-green-600 min-h-[1em]">
            {shareLinkCopied ? "Link copied!" : ""}
          </span>
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
          </div>
          {/* P0-2: functional link always visible — opens/turns on Enforce + scrolls to UTM Spec */}
          <button
            type="button"
            data-testid="enforce-taxonomy-link"
            onClick={() => {
              if (!spec.enforceSpec) setSpec({ ...spec, enforceSpec: true });
              setLintRulesExpanded(true);
              const panel = document.querySelector("[data-testid='utm-spec-panel']");
              if (panel) {
                panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
                panel.dispatchEvent(new CustomEvent("utm-spec-open"));
              }
            }}
            className="mt-0.5 text-[10px] text-violet-600 hover:text-violet-800 underline underline-offset-2 text-left cursor-pointer block"
          >
            Enforce allowed values
          </button>
          {/* Collapsible: the remaining three toggles + legend */}
          {lintRulesExpanded && (
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {toggle("requiredParams", "Require source/medium/campaign")}
              {toggle("lowercaseOnly", "Lowercase only")}
              {toggle("noSpaces", "No spaces")}
              {/* Fix A: enforcing legend */}
              {spec.enforceSpec && (
                <span className="text-[10px] text-gray-400">
                  <span className="inline-block w-2 h-2 rounded-sm bg-violet-300 align-middle mr-0.5" aria-hidden="true" />{" "}
                  violet = off-spec
                  <span className="mx-1.5 text-gray-300">|</span>
                  <span className="inline-block w-2 h-2 rounded-sm bg-amber-300 align-middle mr-0.5" aria-hidden="true" />{" "}
                  amber = casing/spaces
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Privacy reassurance for share link */}
      <p className="text-xs text-gray-400 -mt-2">
        Shareable link is built in your browser — nothing is sent to any server.
      </p>

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

      {/* Mobile campaigns + UTM Spec disclosures — above grid, below toolbar */}
      <div className="min-[900px]:hidden flex flex-col gap-1">
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
          savedFlash={savedFlash}
          mobileOnly
        />
        {/* UTM Spec mobile disclosure — collapsed by default */}
        <UtmSpecPanel
          spec={spec}
          onChange={setSpec}
          onLoadSample={handleLoadSample}
          onShareSpec={() => void copyShareLink()}
          specLinkCopied={shareLinkCopied}
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

      {/* Main layout: grid + desktop sidebar side by side */}
      <div className="flex gap-4 items-start">
        {/* Grid container — holds BOTH table (≥640px) and card list (<640px).
            Both are always in the DOM; visibility is controlled by pure CSS only
            (no JS viewport detection — avoids SSR/hydration mismatch). */}
        <div className="min-w-0 flex-1">

          {/* ── TABLE VIEW (sm and up) ──────────────────────────────────────── */}
          {/* P0-1: overflow-x-auto on THIS wrapper ensures the table scrolls horizontally
              INSIDE its container — the page never scrolls sideways.
              min-w-[1200px] on the table guarantees all UTM column headers (utm_campaign,
              utm_term, utm_content) stay fully readable with the sidebar open at 1280–1440px.
              whitespace-nowrap on header cells prevents any mid-word truncation. */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[1200px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {/* Bulk-selection checkbox header
                    Fix 1: relative + z-20 so this column sits above the sticky-right
                    Generated-URL / Actions columns (z-10) on narrow/375px viewports. */}
                <th className="relative z-20 w-8 px-2 py-2.5 text-center bg-gray-50">
                  <SelectAllCheckbox
                    rows={rows}
                    selectedRowIds={selectedRowIds}
                    onToggleAll={toggleSelectAll}
                  />
                </th>
                <th className="w-8 px-2 py-2.5" aria-label="Row number" />
                {COLUMNS.map((c) => (
                  <th key={c} className="px-2 py-2.5 whitespace-nowrap">
                    {FIELD_LABELS[c]}
                    {settings.requiredParams &&
                      ["utm_source", "utm_medium", "utm_campaign"].includes(c) && (
                        <span className="ml-0.5 text-red-500" title="Required">
                          *
                        </span>
                      )}
                  </th>
                ))}
                <th className="sticky right-[108px] z-10 min-w-[280px] bg-gray-50 px-2 py-2.5 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] whitespace-nowrap">
                  Generated URL
                </th>
                <th className="sticky right-0 z-10 w-[108px] bg-gray-50 px-2 py-2.5 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const generated = buildUtmUrl(row);
                const isSelected = row.id === selectedId;
                const isBulkChecked = selectedRowIds.has(row.id);
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
                        Fix 1: relative + z-20 so checkbox stays above the sticky-right
                        Generated-URL / Actions columns (z-10) on 375px viewports. */}
                    <td className="relative z-20 px-2 py-2 text-center bg-inherit" onClick={(e) => e.stopPropagation()}>
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
                      return (
                        /* relative z-[11]: creates stacking context above sticky right
                           columns (z-10) so warning popovers and "Fix to" chips are
                           tappable on mobile at every horizontal scroll position. */
                        <td key={field} className="relative z-[11] px-2 py-2">
                          {/* pr-7 + min-w-[8.5rem] ensures the native datalist caret and a 10–12 char
                              allowed value (e.g. "newsletter") display whole without clipping.
                              UTM fields get a wider min-width than baseUrl which benefits from more free space. */}
                          <input
                            value={row[field]}
                            onChange={(e) => updateCell(row.id, field, e.target.value)}
                            onFocus={() => setSelectedId(row.id)}
                            aria-label={`${FIELD_LABELS[field]} row ${i + 1}`}
                            aria-invalid={!!cellWarnings && !isPresetFreshRequired}
                            placeholder={isPresetFreshRequired ? "Add a campaign name" : field === "baseUrl" ? "https://…" : ""}
                            spellCheck={false}
                            list={datalistId}
                            className={`w-full rounded-md border pl-2 pr-7 py-1.5 font-mono text-xs focus:outline-none transition-colors duration-300 ${field === "baseUrl" ? "min-w-36" : "min-w-[8.5rem]"} ${
                              isFlashing
                                ? "border-green-400 bg-green-50"
                                : cellWarnings && hasOffSpec
                                ? "border-violet-400 bg-violet-50 focus:border-violet-500"
                                : cellWarnings
                                ? "border-amber-400 bg-amber-50 focus:border-amber-500"
                                : isPresetFreshRequired
                                ? "border-gray-300 bg-gray-50 focus:border-blue-500"
                                : "border-gray-200 bg-white focus:border-blue-500"
                            }`}
                          />
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
                    {/* Sticky Generated URL — min-w-[280px] keeps it readable; title tooltip
                        shows the full URL on hover so Priya can read the final tagged URL. */}
                    <td className="sticky right-[108px] z-10 px-2 py-2 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] bg-inherit">
                      <output
                        aria-label={`Generated URL row ${i + 1}`}
                        title={generated}
                        className={`block min-w-[260px] max-w-sm truncate rounded-md bg-gray-50 px-2 py-1.5 font-mono text-xs ${
                          generated ? "text-gray-800" : "text-gray-400"
                        }`}
                      >
                        {generated || "—"}
                      </output>
                    </td>
                    {/* Sticky Actions — fixed-width column (Fix A, Fix F) */}
                    <td className="sticky right-0 z-10 w-[116px] px-3 py-2 whitespace-nowrap shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] bg-inherit">
                      <span className="inline-flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void copyText(generated, row.id)}
                            disabled={!generated}
                            aria-label={`Copy URL row ${i + 1}`}
                            className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                          >
                            Copy
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
              return (
                <div
                  key={row.id}
                  className={`rounded-lg border p-4 flex flex-col gap-3 ${
                    isBulkChecked
                      ? "border-blue-300 bg-blue-50/40"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {/* Card top bar: checkbox + row number + Duplicate / Delete */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
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
                      <span className="text-xs font-medium text-gray-400">#{i + 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
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
                  </div>

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
                          onChange={(e) => updateCell(row.id, field, e.target.value)}
                          onFocus={() => setSelectedId(row.id)}
                          aria-label={`${FIELD_LABELS[field]} row ${i + 1}`}
                          aria-invalid={!!cellWarnings && !isPresetFreshRequired}
                          placeholder={isPresetFreshRequired ? "Add a campaign name" : field === "baseUrl" ? "https://…" : ""}
                          spellCheck={false}
                          list={datalistId}
                          className={`w-full rounded-md border px-3 py-3 font-mono text-sm focus:outline-none transition-colors duration-300 min-h-[44px] ${
                            isFlashing
                              ? "border-green-400 bg-green-50"
                              : cellWarnings && hasOffSpec
                              ? "border-violet-400 bg-violet-50 focus:border-violet-500"
                              : cellWarnings
                              ? "border-amber-400 bg-amber-50 focus:border-amber-500"
                              : isPresetFreshRequired
                              ? "border-gray-300 bg-gray-50 focus:border-blue-500"
                              : "border-gray-200 bg-white focus:border-blue-500"
                          }`}
                        />
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
                </div>
              );
            })}
          </div>
          {/* ── END CARD VIEW ──────────────────────────────────────────────── */}

        </div>

        {/* Desktop campaigns + UTM Spec sidebar — hidden on mobile */}
        <div className="hidden min-[900px]:flex flex-col w-64 shrink-0 gap-0">
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
            savedFlash={savedFlash}
            desktopOnly
          />
          {/* UTM Spec panel — disclosure, collapsed by default, under Campaigns */}
          <UtmSpecPanel
            spec={spec}
            onChange={setSpec}
            onLoadSample={handleLoadSample}
            onShareSpec={() => void copyShareLink()}
            specLinkCopied={shareLinkCopied}
            desktopOnly
          />
        </div>
      </div>

      {/* F: Trust note */}
      <p className="text-xs text-gray-400">
        Generated URLs are trimmed of trailing spaces; your source cells are left as typed.
        Everything runs in your browser — no account, no server, no network
        requests after page load. Grid rows, presets, campaigns, and lint toggles are
        saved in localStorage.
      </p>

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
