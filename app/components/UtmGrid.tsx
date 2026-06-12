"use client";

import { useMemo, useRef, useState } from "react";
import {
  autoMapHeaders,
  csvToRows,
  parseCsv,
  rowsToCsv,
  type MappableField,
} from "../../lib/csv";
import { groupWarnings, lintRows, warningKey } from "../../lib/lint";
import {
  DEFAULT_LINT_SETTINGS,
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
import { ImportDialog, type PendingImport } from "./ImportDialog";
import { PresetsBar } from "./PresetsBar";

type EditableField = "baseUrl" | UtmField;
const COLUMNS: EditableField[] = ["baseUrl", ...UTM_FIELDS];

export function UtmGrid() {
  const idCounter = useRef(1);
  const newId = () => `row-${++idCounter.current}`;

  const [rows, setRows] = useState<UtmRow[]>(() => [emptyRow("row-1")]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [settings, setSettings] = useLocalStorage<LintSettings>(
    "utm-grid:lint-settings",
    DEFAULT_LINT_SETTINGS
  );
  const [presets, setPresets] = useLocalStorage<Preset[]>("utm-grid:presets", []);
  const [newRowPresetId, setNewRowPresetId] = useLocalStorage<string | null>(
    "utm-grid:new-row-preset",
    null
  );

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

  const updateCell = (rowId: string, field: EditableField, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  };

  const addRow = () => {
    const row = emptyRow(newId());
    const preset = presets.find((p) => p.id === newRowPresetId);
    if (preset) Object.assign(row, preset.values);
    setRows((prev) => [...prev, row]);
    setSelectedId(row.id);
  };

  const duplicateRow = (rowId: string) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === rowId);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: newId() };
      return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
    });
  };

  const deleteRow = (rowId: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== rowId);
      return next.length > 0 ? next : [emptyRow(newId())];
    });
    if (selectedId === rowId) setSelectedId(null);
  };

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flashCopied(key);
    } catch {
      // Clipboard unavailable (permissions); nothing else to do client-side.
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
    e.target.value = ""; // allow re-importing the same file
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsv(text);
    if (parsed.length === 0) return;
    const [headers, ...dataRows] = parsed;
    setPendingImport({
      fileName: file.name,
      headers,
      dataRows,
      initialMapping: autoMapHeaders(headers),
    });
  };

  const confirmImport = (mapping: Record<MappableField, number | null>) => {
    if (!pendingImport) return;
    const imported = csvToRows(pendingImport.dataRows, mapping, newId);
    setRows(imported.length > 0 ? imported : [emptyRow(newId())]);
    setSelectedId(null);
    setPendingImport(null);
  };

  const applyPresetToSelected = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset || !selectedId) return;
    setRows((prev) =>
      prev.map((r) => (r.id === selectedId ? { ...r, ...preset.values } : r))
    );
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

      <PresetsBar
        presets={presets}
        selectedRow={selectedRow}
        newRowPresetId={newRowPresetId}
        onSave={savePreset}
        onDelete={(id) => setPresets((prev) => prev.filter((p) => p.id !== id))}
        onApplyToSelected={applyPresetToSelected}
        onNewRowPresetChange={setNewRowPresetId}
      />

      {/* Grid */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
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
              <th className="w-72 px-2 py-2.5">Generated URL</th>
              <th className="w-36 px-2 py-2.5">Actions</th>
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
                    const cellWarnings = warnings.get(warningKey(row.id, field));
                    return (
                      <td key={field} className="px-2 py-2">
                        <input
                          value={row[field]}
                          onChange={(e) => updateCell(row.id, field, e.target.value)}
                          onFocus={() => setSelectedId(row.id)}
                          aria-label={`${FIELD_LABELS[field]} row ${i + 1}`}
                          aria-invalid={!!cellWarnings}
                          placeholder={field === "baseUrl" ? "https://…" : ""}
                          title={cellWarnings?.map((w) => w.message).join("\n")}
                          spellCheck={false}
                          className={`w-full min-w-28 rounded-md border px-2 py-1.5 font-mono text-xs focus:outline-none ${
                            cellWarnings
                              ? "border-red-400 bg-red-50 focus:border-red-500"
                              : "border-gray-200 bg-white focus:border-blue-500"
                          }`}
                        />
                        {cellWarnings && (
                          <div className="mt-1 space-y-0.5">
                            {cellWarnings.map((w, j) => (
                              <p
                                key={j}
                                role="alert"
                                className="max-w-52 text-[11px] leading-tight text-red-600"
                              >
                                ⚠ {w.message}
                              </p>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2">
                    <output
                      aria-label={`Generated URL row ${i + 1}`}
                      title={generated}
                      className={`block max-w-72 truncate rounded-md bg-gray-50 px-2 py-1.5 font-mono text-xs ${
                        generated ? "text-gray-800" : "text-gray-400"
                      }`}
                    >
                      {generated || "—"}
                    </output>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
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

      <p className="text-xs text-gray-400">
        Everything runs in your browser — no account, no server, no network
        requests after page load. Presets and lint toggles are saved in
        localStorage.
      </p>

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
