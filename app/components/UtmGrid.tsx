"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  autoMapHeaders,
  csvToRows,
  parseCsv,
  rowsToCsv,
  type MappableField,
} from "../../lib/csv";
import { groupWarnings, hasCellFix, lintRows, warningKey } from "../../lib/lint";
import { isCellFixable, normalizeAllRows, normalizeValue } from "../../lib/normalize";
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
  const [storedRows, setRows] = useLocalStorage<UtmRow[]>("utm-grid:rows", INITIAL_ROWS, {
    debounceMs: 400,
  });
  const rows =
    Array.isArray(storedRows) && storedRows.length > 0 ? storedRows : INITIAL_ROWS;

  const idCounter = useRef(1);
  const newId = (current: UtmRow[] = rows) => {
    for (const r of current) {
      const m = /^row-(\d+)$/.exec(r.id);
      if (m) idCounter.current = Math.max(idCounter.current, Number(m[1]));
    }
    return `row-${++idCounter.current}`;
  };

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flash state: rowId:field → "green" for brief cell highlight
  const [flashCells, setFlashCells] = useState<Set<string>>(new Set());

  // Undo stack (in-memory only — no localStorage)
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
    setRows(entry.rows);
    showToast(`Undid: ${entry.label}`);
  }, [setRows, showToast]);

  const [settings, setSettings] = useLocalStorage<LintSettings>(
    "utm-grid:lint-settings",
    DEFAULT_LINT_SETTINGS
  );
  const [userPresets, setPresets] = useLocalStorage<Preset[]>("utm-grid:presets", []);
  const [newRowPresetId, setNewRowPresetId] = useLocalStorage<string | null>(
    "utm-grid:new-row-preset",
    null
  );

  // All presets = seeded + user (mirroring PresetsBar)
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

  // Flash cells green briefly
  const flashCellKeys = useCallback((keys: string[]) => {
    setFlashCells(new Set(keys));
    setTimeout(() => setFlashCells(new Set()), 1200);
  }, []);

  const updateCell = (rowId: string, field: EditableField, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  };

  // Fix a single cell
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

  // Clean all fixable cells
  const cleanAll = () => {
    const { rows: cleaned, count } = normalizeAllRows(rows, settings);
    if (count === 0) { showToast("No cells needed fixing"); return; }
    pushUndo("Clean all", rows);
    setRows(cleaned);
    // Flash all changed rows
    const keys: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      if (cleaned[i] !== rows[i]) {
        for (const f of UTM_FIELDS) {
          if (cleaned[i][f] !== rows[i][f]) keys.push(`${rows[i].id}:${f}`);
        }
      }
    }
    flashCellKeys(keys);
    showToast(`Cleaned ${count} cell${count === 1 ? "" : "s"}`);
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
    // If no row is selected, apply to the last row
    const targetId = selectedId ?? rows[rows.length - 1]?.id;
    if (!targetId) return;
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
          className="rounded-md border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          Clean all
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

      {/* Grid — mobile: scrollable container, sticky Generated URL + Actions columns */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
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
              <th className="sticky right-16 z-10 w-64 bg-gray-50 px-2 py-2.5 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                Generated URL
              </th>
              <th className="sticky right-0 z-10 w-20 bg-gray-50 px-2 py-2.5 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
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
                  {/* Sticky Generated URL */}
                  <td className="sticky right-16 z-10 px-2 py-2 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] bg-inherit">
                    <output
                      aria-label={`Generated URL row ${i + 1}`}
                      title={generated}
                      className={`block max-w-60 truncate rounded-md bg-gray-50 px-2 py-1.5 font-mono text-xs ${
                        generated ? "text-gray-800" : "text-gray-400"
                      }`}
                    >
                      {generated || "—"}
                    </output>
                  </td>
                  {/* Sticky Actions */}
                  <td className="sticky right-0 z-10 px-2 py-2 whitespace-nowrap shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] bg-inherit">
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
                        <button
                          type="button"
                          onClick={() => duplicateRow(row.id)}
                          aria-label={`Duplicate row ${i + 1}`}
                          className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                        >
                          Dup
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRow(row.id)}
                          aria-label={`Delete row ${i + 1}`}
                          className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Del
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

      {/* F: Trust note */}
      <p className="text-xs text-gray-400">
        Generated URLs are trimmed of trailing spaces; your source cells are left as typed.
        Everything runs in your browser — no account, no server, no network
        requests after page load. Grid rows, presets, and lint toggles are
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

// ── CellWarnings: collapsed icon + expand on hover/focus ─────────────────────

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

  // If only one warning, show it inline (no collapse needed)
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
      {expanded && (
        <div className="absolute left-0 top-5 z-20 w-64 rounded-md border border-amber-200 bg-amber-50 p-2 shadow-lg">
          {warnings.map((w, j) => (
            <p key={j} role="alert" className="text-[11px] leading-tight text-amber-800 mb-1 last:mb-0">
              ⚠ {w.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
