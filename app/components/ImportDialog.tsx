"use client";

import { useState } from "react";
import {
  MAPPABLE_FIELDS,
  type MappableField,
} from "../../lib/csv";
import { FIELD_LABELS } from "../../lib/types";

export interface PendingImport {
  fileName: string;
  headers: string[];
  dataRows: string[][];
  initialMapping: Record<MappableField, number | null>;
}

export type ImportMode = "append" | "replace";

export function ImportDialog({
  pending,
  onConfirm,
  onCancel,
}: {
  pending: PendingImport;
  onConfirm: (mapping: Record<MappableField, number | null>, mode: ImportMode) => void;
  onCancel: () => void;
}) {
  const [mapping, setMapping] = useState(pending.initialMapping);
  const [mode, setMode] = useState<ImportMode>("append");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-gray-900">Map CSV columns</h2>
        <p className="mt-1 text-sm text-gray-500">
          {pending.fileName} — {pending.dataRows.length} data row
          {pending.dataRows.length === 1 ? "" : "s"}. Matching headers were
          pre-mapped; adjust below.
        </p>

        <div className="mt-4 space-y-2">
          {MAPPABLE_FIELDS.map((field) => (
            <label
              key={field}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="font-medium text-gray-700">
                {FIELD_LABELS[field]}
              </span>
              <select
                aria-label={`CSV column for ${FIELD_LABELS[field]}`}
                className="w-56 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                value={mapping[field] ?? ""}
                onChange={(e) =>
                  setMapping((m) => ({
                    ...m,
                    [field]: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              >
                <option value="">— not in CSV —</option>
                {pending.headers.map((h, i) => (
                  <option key={i} value={i}>
                    {h || `(column ${i + 1})`}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        {/* Append / Replace */}
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
          <p className="mb-2 text-xs font-semibold text-amber-800 uppercase tracking-wide">
            Add to grid
          </p>
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="import-mode"
                value="append"
                checked={mode === "append"}
                onChange={() => setMode("append")}
                className="accent-blue-600"
              />
              <span className="font-medium text-gray-800">Append</span>
              <span className="text-gray-500">— add rows to current grid</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="import-mode"
                value="replace"
                checked={mode === "replace"}
                onChange={() => setMode("replace")}
                className="accent-blue-600"
              />
              <span className="font-medium text-gray-800">Replace</span>
              <span className="text-gray-500">— wipe current grid</span>
            </label>
          </div>
          <p className="mt-1 text-xs text-amber-700">Either way you can Undo immediately after importing.</p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(mapping, mode)}
            disabled={pending.dataRows.length === 0}
            title={
              pending.dataRows.length === 0
                ? "No data rows to import (headers only)."
                : undefined
            }
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Import {pending.dataRows.length} row
            {pending.dataRows.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}
