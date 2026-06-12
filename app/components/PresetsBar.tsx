"use client";

import { useState } from "react";
import {
  UTM_FIELDS,
  type Preset,
  type UtmField,
  type UtmRow,
} from "../../lib/types";

export function PresetsBar({
  presets,
  selectedRow,
  newRowPresetId,
  onSave,
  onDelete,
  onApplyToSelected,
  onNewRowPresetChange,
}: {
  presets: Preset[];
  selectedRow: UtmRow | null;
  newRowPresetId: string | null;
  onSave: (name: string, values: Partial<Record<UtmField, string>>) => void;
  onDelete: (id: string) => void;
  onApplyToSelected: (id: string) => void;
  onNewRowPresetChange: (id: string | null) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [included, setIncluded] = useState<Record<UtmField, boolean>>({
    utm_source: true,
    utm_medium: true,
    utm_campaign: false,
    utm_term: false,
    utm_content: false,
  });
  const [values, setValues] = useState<Record<UtmField, string>>({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  });

  const openForm = () => {
    // Prefill from the selected row so "save current values" is one click.
    if (selectedRow) {
      setValues({
        utm_source: selectedRow.utm_source,
        utm_medium: selectedRow.utm_medium,
        utm_campaign: selectedRow.utm_campaign,
        utm_term: selectedRow.utm_term,
        utm_content: selectedRow.utm_content,
      });
      setIncluded({
        utm_source: selectedRow.utm_source.trim() !== "",
        utm_medium: selectedRow.utm_medium.trim() !== "",
        utm_campaign: selectedRow.utm_campaign.trim() !== "",
        utm_term: selectedRow.utm_term.trim() !== "",
        utm_content: selectedRow.utm_content.trim() !== "",
      });
    }
    setFormOpen(true);
  };

  const save = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const presetValues: Partial<Record<UtmField, string>> = {};
    for (const f of UTM_FIELDS) {
      if (included[f]) presetValues[f] = values[f];
    }
    onSave(trimmedName, presetValues);
    setName("");
    setFormOpen(false);
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-semibold text-gray-900">Presets</h2>
        {presets.length === 0 && (
          <span className="text-sm text-gray-400">
            none yet — save channel defaults like utm_source=facebook
          </span>
        )}
        {presets.map((p) => (
          <span
            key={p.id}
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 py-1 pr-1 pl-3 text-sm"
            title={Object.entries(p.values)
              .map(([k, v]) => `${k}=${v}`)
              .join(", ")}
          >
            <span className="font-medium text-gray-800">{p.name}</span>
            <button
              type="button"
              onClick={() => onApplyToSelected(p.id)}
              disabled={!selectedRow}
              title={
                selectedRow
                  ? "Fill the selected row with this preset"
                  : "Click a row first to select it"
              }
              className="rounded-full px-2 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => onDelete(p.id)}
              aria-label={`Delete preset ${p.name}`}
              className="rounded-full px-1.5 py-0.5 text-xs text-gray-400 hover:bg-red-100 hover:text-red-700"
            >
              ✕
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => (formOpen ? setFormOpen(false) : openForm())}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {formOpen ? "Close" : "Save preset…"}
        </button>

        <label className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          New rows use
          <select
            aria-label="Preset for new rows"
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
            value={newRowPresetId ?? ""}
            onChange={(e) => onNewRowPresetChange(e.target.value || null)}
          >
            <option value="">no preset</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {formOpen && (
        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Preset name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Paid Social"
                className="w-40 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            {UTM_FIELDS.map((f) => (
              <label
                key={f}
                className="flex flex-col gap-1 text-xs font-medium text-gray-600"
              >
                <span className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    aria-label={`Include ${f} in preset`}
                    checked={included[f]}
                    onChange={(e) =>
                      setIncluded((prev) => ({ ...prev, [f]: e.target.checked }))
                    }
                  />
                  {f}
                </span>
                <input
                  aria-label={`Preset value for ${f}`}
                  value={values[f]}
                  disabled={!included[f]}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [f]: e.target.value }))
                  }
                  className="w-32 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                />
              </label>
            ))}
            <button
              type="button"
              onClick={save}
              disabled={!name.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Save preset
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Checked fields are stored; the form is prefilled from the selected
            row. Presets live in your browser (localStorage) only.
          </p>
        </div>
      )}
    </section>
  );
}
