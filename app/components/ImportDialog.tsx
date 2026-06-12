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

export function ImportDialog({
  pending,
  onConfirm,
  onCancel,
}: {
  pending: PendingImport;
  onConfirm: (mapping: Record<MappableField, number | null>) => void;
  onCancel: () => void;
}) {
  const [mapping, setMapping] = useState(pending.initialMapping);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-gray-900">Map CSV columns</h2>
        <p className="mt-1 text-sm text-gray-500">
          {pending.fileName} — {pending.dataRows.length} data row
          {pending.dataRows.length === 1 ? "" : "s"}. Matching headers were
          pre-mapped; adjust below. Importing replaces the current grid.
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
            onClick={() => onConfirm(mapping)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Import {pending.dataRows.length} row
            {pending.dataRows.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}
