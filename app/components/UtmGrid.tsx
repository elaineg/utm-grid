"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  autoMapHeaders,
  csvToRows,
  parseCsv,
  rowsToCsv,
  type MappableField,
} from "../../lib/csv";
import { groupWarnings, hasCellFix, lintRows, warningKey } from "../../lib/lint";
import { isCellFixable, normalizeAllRows, normalizeValue } from "../../lib/normalize";
import { buildShareUrl, parseShareHash, storedGridHasContent, writeClipboard } from "../../lib/share";
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
import { buildUtmUrl } from "../../lib/utm";
import { useLocalStorage } from "../../lib/useLocalStorage";
import { ImportDialog, type ImportMode, type PendingImport } from "./ImportDialog";
import { PresetsBar } from "./PresetsBar";
import { CampaignsSidebar } from "./CampaignsSidebar";
import {
  deserializeCampaigns,
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

  const [sharedBanner, setSharedBanner] = useState<{ rowCount: number } | null>(null);

  const pendingSharedState = useRef<{ rows: UtmRow[]; settings: LintSettings } | null>(null);

  const [isUsingSharedState, setIsUsingSharedState] = useState(false);

  const [sharedRows, setSharedRows] = useState<UtmRow[] | null>(null);
  const [sharedSettings, setSharedSettings] = useState<LintSettings | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const payload = parseShareHash(hash);
    if (!payload) return;
    history.replaceState(null, "", window.location.pathname + window.location.search);

    // Guard: if the stored grid already has content, confirm before clobbering it.
    // Read localStorage DIRECTLY (not from the React-state closure) because
    // useSyncExternalStore returns the SSR-safe initial value on the first
    // client render — the closure value is stale until after hydration.
    if (storedGridHasContent()) {
      // Parse the stored rows to get the current link count for the prompt.
      let storedLinkCount = 1;
      try {
        const raw = window.localStorage.getItem("utm-grid:rows");
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed) && parsed.length > 0) storedLinkCount = parsed.length;
        }
      } catch { /* keep default */ }
      const confirmed = window.confirm(
        `Open shared grid (${payload.rows.length} link${payload.rows.length === 1 ? "" : "s"})? Your current unsaved grid (${storedLinkCount} link${storedLinkCount === 1 ? "" : "s"}) will be replaced. This can't be undone.`
      );
      if (!confirmed) return;
    }

    pendingSharedState.current = { rows: payload.rows, settings: payload.settings };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSharedRows(payload.rows);
    setSharedSettings(payload.settings);
    setIsUsingSharedState(true);
    setSharedBanner({ rowCount: payload.rows.length });
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

  // ── Effective rows / settings (shared or stored) ──────────────────────────
  const rows: UtmRow[] = isUsingSharedState && sharedRows ? sharedRows : storedRowsNormalized;
  const settings: LintSettings = isUsingSharedState && sharedSettings ? sharedSettings : storedSettings;

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
    pendingSharedState.current = null;
    setSharedRows(null);
    setSharedSettings(null);
    setIsUsingSharedState(false);
    setSharedBanner(null);
  }, [isUsingSharedState, setStoredRows, setStoredSettings]);

  const setRows = useCallback(
    (next: UtmRow[] | ((prev: UtmRow[]) => UtmRow[])) => {
      if (isUsingSharedState) {
        const sRows = pendingSharedState.current?.rows ?? storedRowsNormalized;
        const sSettings = pendingSharedState.current?.settings ?? storedSettings;
        const nextRows = typeof next === "function" ? next(sRows) : next;
        setStoredRows(nextRows);
        setStoredSettings(sSettings);
        pendingSharedState.current = null;
        setSharedRows(null);
        setSharedSettings(null);
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
    [isUsingSharedState, storedRowsNormalized, storedSettings, setStoredRows, setStoredSettings, clearSavedFlash]
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
    () => groupWarnings(lintRows(rows, settings)),
    [rows, settings]
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
    const url = buildShareUrl({ rows, settings });
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

  const copyAll = () => {
    const urls = rows.map((r) => buildUtmUrl(r)).filter(Boolean);
    if (urls.length > 0) void copyText(urls.join("\n"), "all");
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
    let targetId = selectedId ?? rows[rows.length - 1]?.id;
    if (!targetId) {
      // Grid is empty: create a new row and apply to it.
      const newRow = emptyRow(newId());
      setRows([newRow]);
      setSelectedId(newRow.id);
      setRows((prev) =>
        prev.map((r) => (r.id === newRow.id ? { ...r, ...preset.values } : r))
      );
      return;
    }
    setRows((prev) =>
      prev.map((r) => (r.id === targetId ? { ...r, ...preset.values } : r))
    );
    setSelectedId(targetId);
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
        setIsUsingSharedState(false);
        setSharedBanner(null);
      }
      setStoredRows(campaign.rows);
      setStoredSettings(campaign.settings);
      setOpenCampaignId(campaign.id);
      setStoredOpenId(campaign.id); // Fix E: persist across reload
      setIsDirty(false);
    },
    [
      confirmReplaceIfDirty,
      isUsingSharedState,
      setStoredRows,
      setStoredSettings,
      setStoredOpenId,
    ]
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
            aria-live="polite"
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
          {shareEmptyWarning && (
            <span role="status" className="text-xs text-amber-700">
              Nothing to share yet
            </span>
          )}
        </span>
        <span className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={copyAll}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Copy all URLs
          </button>
          {copied === "all" && (
            <span aria-live="polite" className="text-sm font-medium text-green-600">
              Copied
            </span>
          )}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-4 border-l border-gray-200 pl-4">
          <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Lint rules
          </span>
          {toggle("requiredParams", "Require source/medium/campaign")}
          {toggle("lowercaseOnly", "Lowercase only")}
          {toggle("noSpaces", "No spaces")}
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

      {/* Mobile campaigns disclosure — appears ABOVE grid (below toolbar), collapsed by default */}
      <div className="min-[900px]:hidden">
        <CampaignsSidebar
          campaigns={campaigns}
          openCampaignId={openCampaignId}
          isDirty={isDirty}
          onSave={handleCampaignSaved}
          onOpen={openCampaign}
          onChange={handleCampaignsChanged}
          rows={rows}
          settings={settings}
          savedFlash={savedFlash}
          mobileOnly
        />
      </div>

      {/* Loaded shared grid banner */}
      {sharedBanner && (
        <div
          role="status"
          aria-live="polite"
          data-testid="shared-grid-banner"
          className="flex items-start justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-900">
              Loaded shared grid ({sharedBanner.rowCount}{" "}
              {sharedBanner.rowCount === 1 ? "link" : "links"})
            </p>
            <p className="mt-0.5 text-xs text-blue-700">
              These are someone&apos;s links — edit any cell to make them yours.{" "}
              Shareable link is built in your browser — nothing is sent to any server.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSharedBanner(null)}
            aria-label="Dismiss shared grid banner"
            className="shrink-0 text-blue-500 hover:text-blue-700 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Main layout: grid + desktop sidebar side by side */}
      <div className="flex gap-4 items-start">
        {/* Grid — mobile: scrollable container, sticky Generated URL + Actions columns */}
        <div className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                <th className="w-8 px-2 py-2.5" aria-label="Row number" />
                {COLUMNS.map((c) => (
                  <th key={c} className="px-2 py-2.5">
                    {FIELD_LABELS[c]}
                    {settings.requiredParams &&
                      ["utm_source", "utm_medium", "utm_campaign"].includes(c) && (
                        <span className="ml-0.5 text-red-500" title="Required">
                          *
                        </span>
                      )}
                  </th>
                ))}
                <th className="sticky right-[108px] z-10 w-60 bg-gray-50 px-2 py-2.5 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                  Generated URL
                </th>
                <th className="sticky right-0 z-10 w-[108px] bg-gray-50 px-2 py-2.5 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const generated = buildUtmUrl(row);
                const isSelected = row.id === selectedId;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                    className={`border-b border-gray-100 align-top ${
                      isSelected ? "bg-blue-50/70" : "hover:bg-gray-50/50"
                    }`}
                  >
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
                      const cellWarnings = warnings.get(cellKey);
                      const flashKey = `${row.id}:${field}`;
                      const isFlashing = flashCells.has(flashKey);
                      const isUtmField = field !== "baseUrl";
                      const canFix =
                        isUtmField &&
                        cellWarnings &&
                        hasCellFix(cellWarnings) &&
                        isCellFixable(row[field], settings);
                      return (
                        <td key={field} className="px-2 py-2">
                          <input
                            value={row[field]}
                            onChange={(e) => updateCell(row.id, field, e.target.value)}
                            onFocus={() => setSelectedId(row.id)}
                            aria-label={`${FIELD_LABELS[field]} row ${i + 1}`}
                            aria-invalid={!!cellWarnings}
                            placeholder={field === "baseUrl" ? "https://…" : ""}
                            spellCheck={false}
                            className={`w-full min-w-24 rounded-md border px-2 py-1.5 font-mono text-xs focus:outline-none transition-colors duration-300 ${
                              isFlashing
                                ? "border-green-400 bg-green-50"
                                : cellWarnings
                                ? "border-amber-400 bg-amber-50 focus:border-amber-500"
                                : "border-gray-200 bg-white focus:border-blue-500"
                            }`}
                          />
                          {cellWarnings && (
                            <CellWarnings
                              warnings={cellWarnings}
                              canFix={!!canFix}
                              onFix={
                                canFix
                                  ? () => fixCell(row.id, field as UtmField, row[field])
                                  : undefined
                              }
                            />
                          )}
                        </td>
                      );
                    })}
                    {/* Sticky Generated URL — truncates so row actions never overlap */}
                    <td className="sticky right-[108px] z-10 px-2 py-2 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] bg-inherit">
                      <output
                        aria-label={`Generated URL row ${i + 1}`}
                        title={generated}
                        className={`block w-56 truncate rounded-md bg-gray-50 px-2 py-1.5 font-mono text-xs ${
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

        {/* Desktop campaigns sidebar — hidden on mobile */}
        <div className="hidden min-[900px]:block w-64 shrink-0">
          <CampaignsSidebar
            campaigns={campaigns}
            openCampaignId={openCampaignId}
            isDirty={isDirty}
            onSave={handleCampaignSaved}
            onOpen={openCampaign}
            onChange={handleCampaignsChanged}
            rows={rows}
            settings={settings}
            savedFlash={savedFlash}
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

// ── CellWarnings ──────────────────────────────────────────────────────────────

function CellWarnings({
  warnings,
  canFix,
  onFix,
}: {
  warnings: { message: string; rule: string }[];
  canFix: boolean;
  onFix?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const count = warnings.length;

  if (count === 1) {
    return (
      <div className="mt-1">
        <p role="alert" className="max-w-52 text-[11px] leading-tight text-amber-700">
          ⚠ {warnings[0].message}
          {canFix && onFix && (
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
        className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-900"
        aria-expanded={expanded}
      >
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold">
          {count}
        </span>
        <span>warning{count === 1 ? "" : "s"}</span>
        {canFix && onFix && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFix?.(); }}
            className="ml-1 text-blue-600 hover:underline font-medium"
          >
            Fix
          </button>
        )}
      </button>
      <div className={expanded ? "absolute left-0 top-5 z-20 w-64 rounded-md border border-amber-200 bg-amber-50 p-2 shadow-lg" : "sr-only"}>
        {warnings.map((w, j) => (
          <p key={j} role="alert" className="text-[11px] leading-tight text-amber-800 mb-1 last:mb-0">
            ⚠ {w.message}
          </p>
        ))}
      </div>
    </div>
  );
}
