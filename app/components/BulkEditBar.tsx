"use client";

import { useState } from "react";
import { UTM_FIELDS, type UtmField, type UtmRow } from "../../lib/types";

interface BulkEditBarProps {
  rows: UtmRow[];
  selectedRowIds: Set<string>;
  onSetColumn: (field: UtmField, value: string) => void;
  onFindReplace: (field: UtmField, find: string, replace: string) => void;
  /** Message shown after a bulk op (e.g. "Set utm_campaign on 5 rows — Undo"). Cleared by parent. */
  resultMessage: string | null;
  noMatchMessage: string | null;
}

const UTM_FIELD_LABELS: Record<UtmField, string> = {
  utm_source: "utm_source",
  utm_medium: "utm_medium",
  utm_campaign: "utm_campaign",
  utm_term: "utm_term",
  utm_content: "utm_content",
};

export function BulkEditBar({
  rows,
  selectedRowIds,
  onSetColumn,
  onFindReplace,
  resultMessage,
  noMatchMessage,
}: BulkEditBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [column, setColumn] = useState<UtmField>("utm_campaign");
  const [setValue, setSetValue] = useState("");
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");

  const someSelected = selectedRowIds.size > 0;
  const targetCount = someSelected ? selectedRowIds.size : rows.length;
  const scopeLabel = someSelected
    ? `Apply to: ${targetCount} selected row${targetCount === 1 ? "" : "s"}`
    : `Apply to: all ${targetCount} row${targetCount === 1 ? "" : "s"}`;

  const handleSetColumn = () => {
    onSetColumn(column, setValue);
  };

  const handleFindReplace = () => {
    onFindReplace(column, findValue, replaceValue);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/70">
      {/* Always-visible label + mobile expand toggle */}
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase whitespace-nowrap">
          Bulk edit
        </span>

        {/* Desktop: full controls inline. Mobile: toggle button */}
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          className="min-[900px]:hidden ml-auto text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-2 py-0.5"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>

        {/* Desktop controls (always visible at ≥900px) */}
        <div className="hidden min-[900px]:flex flex-1 items-start gap-3 flex-wrap">
          <BulkEditControls
            column={column}
            setColumn={setColumn}
            setValue={setValue}
            setSetValue={setSetValue}
            findValue={findValue}
            setFindValue={setFindValue}
            replaceValue={replaceValue}
            setReplaceValue={setReplaceValue}
            scopeLabel={scopeLabel}
            someSelected={someSelected}
            onSetColumn={handleSetColumn}
            onFindReplace={handleFindReplace}
          />
        </div>
      </div>

      {/* Mobile: expanded controls */}
      {isExpanded && (
        <div className="min-[900px]:hidden border-t border-gray-200 px-4 py-3 flex flex-col gap-3">
          <BulkEditControls
            column={column}
            setColumn={setColumn}
            setValue={setValue}
            setSetValue={setSetValue}
            findValue={findValue}
            setFindValue={setFindValue}
            replaceValue={replaceValue}
            setReplaceValue={setReplaceValue}
            scopeLabel={scopeLabel}
            someSelected={someSelected}
            onSetColumn={handleSetColumn}
            onFindReplace={handleFindReplace}
            mobile
          />
        </div>
      )}

      {/* Result / no-match messages */}
      {(resultMessage || noMatchMessage) && (
        <div className="border-t border-gray-200 px-4 py-1.5">
          {resultMessage && (
            <p role="status" className="text-xs text-green-700 font-medium">
              {resultMessage}
            </p>
          )}
          {noMatchMessage && (
            <p role="alert" className="text-xs text-amber-700">
              {noMatchMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Inner controls shared between desktop and mobile ─────────────────────────

interface BulkEditControlsProps {
  column: UtmField;
  setColumn: (f: UtmField) => void;
  setValue: string;
  setSetValue: (v: string) => void;
  findValue: string;
  setFindValue: (v: string) => void;
  replaceValue: string;
  setReplaceValue: (v: string) => void;
  scopeLabel: string;
  someSelected: boolean;
  onSetColumn: () => void;
  onFindReplace: () => void;
  mobile?: boolean;
}

function BulkEditControls({
  column,
  setColumn,
  setValue,
  setSetValue,
  findValue,
  setFindValue,
  replaceValue,
  setReplaceValue,
  scopeLabel,
  someSelected,
  onSetColumn,
  onFindReplace,
  mobile,
}: BulkEditControlsProps) {
  const baseInputCls =
    "rounded border border-gray-300 bg-white px-2 py-1 text-xs font-mono focus:outline-none focus:border-blue-400";
  const baseBtnCls =
    "rounded border px-3 py-1 text-xs font-medium whitespace-nowrap";

  const scopePill = (
    <span
      className={`text-xs rounded-full px-2 py-0.5 font-medium whitespace-nowrap ${
        someSelected
          ? "bg-blue-100 text-blue-700 border border-blue-200"
          : "bg-gray-100 text-gray-500 border border-gray-200"
      }`}
      aria-live="polite"
      role="status"
    >
      {scopeLabel}
    </span>
  );

  if (mobile) {
    return (
      <div className="flex flex-col gap-3">
        {/* Column picker */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">Column:</label>
          <select
            value={column}
            onChange={(e) => setColumn(e.target.value as UtmField)}
            aria-label="UTM column for bulk edit"
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
          >
            {UTM_FIELDS.map((f) => (
              <option key={f} value={f}>
                {UTM_FIELD_LABELS[f]}
              </option>
            ))}
          </select>
          {scopePill}
        </div>

        {/* Set column */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">Set column</span>
          <div className="flex items-center gap-2">
            <input
              value={setValue}
              onChange={(e) => setSetValue(e.target.value)}
              aria-label="Value to set"
              placeholder="New value (empty clears)"
              className={`${baseInputCls} flex-1`}
            />
            <button
              type="button"
              onClick={onSetColumn}
              aria-label={`Set column ${column}`}
              title={`Set ${column} on targeted rows`}
              className={`${baseBtnCls} border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100`}
            >
              Set column
            </button>
          </div>
          <p className="text-[11px] text-gray-400">Empty value clears the column.</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Find & replace */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">Find &amp; replace in column</span>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={findValue}
              onChange={(e) => setFindValue(e.target.value)}
              aria-label="Find text"
              placeholder="Find"
              className={`${baseInputCls} w-28`}
            />
            <input
              value={replaceValue}
              onChange={(e) => setReplaceValue(e.target.value)}
              aria-label="Replace with text"
              placeholder="Replace with"
              className={`${baseInputCls} w-28`}
            />
            <button
              type="button"
              onClick={onFindReplace}
              aria-label={`Find and replace in column ${column}`}
              title={`Replace in ${column} on targeted rows`}
              className={`${baseBtnCls} border-purple-400 bg-purple-50 text-purple-700 hover:bg-purple-100`}
            >
              Find &amp; replace in column
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout: one horizontal row
  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      {/* Column picker */}
      <select
        value={column}
        onChange={(e) => setColumn(e.target.value as UtmField)}
        aria-label="UTM column for bulk edit"
        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
      >
        {UTM_FIELDS.map((f) => (
          <option key={f} value={f}>
            {UTM_FIELD_LABELS[f]}
          </option>
        ))}
      </select>

      {scopePill}

      {/* ── Set column group ── */}
      <div className="flex items-center gap-1.5 border-l border-gray-300 pl-3">
        <input
          value={setValue}
          onChange={(e) => setSetValue(e.target.value)}
          aria-label="Value to set"
          placeholder="New value (empty clears)"
          title="Empty value clears the column."
          className={`${baseInputCls} w-36`}
        />
        <button
          type="button"
          onClick={onSetColumn}
          aria-label={`Set column ${column}`}
          title={`Set ${column} on targeted rows`}
          className={`${baseBtnCls} border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100`}
        >
          Set column
        </button>
      </div>

      {/* ── Find & replace group ── */}
      <div className="flex items-center gap-1.5 border-l border-gray-300 pl-3">
        <input
          value={findValue}
          onChange={(e) => setFindValue(e.target.value)}
          aria-label="Find text"
          placeholder="Find"
          className={`${baseInputCls} w-24`}
        />
        <input
          value={replaceValue}
          onChange={(e) => setReplaceValue(e.target.value)}
          aria-label="Replace with text"
          placeholder="Replace with"
          className={`${baseInputCls} w-24`}
        />
        <button
          type="button"
          onClick={onFindReplace}
          aria-label={`Find and replace in column ${column}`}
          title={`Replace in ${column} on targeted rows`}
          className={`${baseBtnCls} border-purple-400 bg-purple-50 text-purple-700 hover:bg-purple-100`}
        >
          Find &amp; replace in column
        </button>
      </div>
    </div>
  );
}
