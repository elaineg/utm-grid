"use client";

import { useState } from "react";
import { UTM_FIELDS, type UtmField, type UtmRow } from "../../lib/types";

// Fix 5: Base URL is a valid bulk column too.
export type BulkColumn = UtmField | "baseUrl";

export const BULK_COLUMN_LABELS: Record<BulkColumn, string> = {
  baseUrl: "Base URL",
  utm_source: "utm_source",
  utm_medium: "utm_medium",
  utm_campaign: "utm_campaign",
  utm_term: "utm_term",
  utm_content: "utm_content",
};

export const ALL_BULK_COLUMNS: BulkColumn[] = ["baseUrl", ...UTM_FIELDS];

interface BulkEditBarProps {
  rows: UtmRow[];
  selectedRowIds: Set<string>;
  onSetColumn: (field: BulkColumn, value: string) => void;
  /** matchCase is controlled by the bar and passed up on each call. */
  onFindReplace: (field: BulkColumn, find: string, replace: string, matchCase: boolean) => void;
  /** Message shown after a successful bulk op (e.g. "Set utm_campaign on 5 rows — Undo"). Cleared by parent. */
  resultMessage: string | null;
  /** Message shown on zero matches or empty-find validation. Cleared by parent. */
  noMatchMessage: string | null;
  /** Handler for bulk QR download. Async; parent owns the logic. */
  onDownloadQr?: () => Promise<void>;
  /** Green-fill result message after bulk QR download. ref-stable ~3s from parent. */
  qrResultMessage?: string | null;
}

export function BulkEditBar({
  rows,
  selectedRowIds,
  onSetColumn,
  onFindReplace,
  resultMessage,
  noMatchMessage,
  onDownloadQr,
  qrResultMessage,
}: BulkEditBarProps) {
  // P1: collapsed by default on cold open (desktop + mobile). Payoff label visible when collapsed.
  const [isExpanded, setIsExpanded] = useState(false);
  const [column, setColumn] = useState<BulkColumn>("utm_campaign");
  const [setValue, setSetValue] = useState("");
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  // Fix 2b: Match case toggle, default OFF (case-insensitive).
  const [matchCase, setMatchCase] = useState(false);

  const someSelected = selectedRowIds.size > 0;
  const targetCount = someSelected ? selectedRowIds.size : rows.length;
  const scopeLabel = someSelected
    ? `Apply to: ${targetCount} selected row${targetCount === 1 ? "" : "s"}`
    : `Apply to: all ${targetCount} row${targetCount === 1 ? "" : "s"}`;

  const handleSetColumn = () => {
    onSetColumn(column, setValue);
  };

  const handleFindReplace = () => {
    onFindReplace(column, findValue, replaceValue, matchCase);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/70">
      {/* P1: Always-visible collapsible header — payoff label named so it's legible at a glance.
          Fix 1: this bar sits ABOVE the table so sticky table columns don't overlap it. */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
        aria-controls="bulk-edit-panel"
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-700 hover:bg-gray-100/50"
      >
        <span>
          Bulk edit{" "}
          <span className="normal-case font-normal text-gray-400">— set or replace a column across rows</span>
        </span>
        <span className="text-gray-400 text-[10px]">{isExpanded ? "▲" : "▼"}</span>
      </button>

      {/* Expanded: desktop inline, mobile stacked — both show when expanded */}
      {isExpanded && (
        <div id="bulk-edit-panel" className="border-t border-gray-200">
          {/* Desktop controls (inline at ≥900px) */}
          <div className="hidden min-[900px]:flex items-start gap-3 flex-wrap px-4 py-3">
            <BulkEditControls
              column={column}
              setColumn={setColumn}
              setValue={setValue}
              setSetValue={setSetValue}
              findValue={findValue}
              setFindValue={setFindValue}
              replaceValue={replaceValue}
              setReplaceValue={setReplaceValue}
              matchCase={matchCase}
              setMatchCase={setMatchCase}
              scopeLabel={scopeLabel}
              someSelected={someSelected}
              onSetColumn={handleSetColumn}
              onFindReplace={handleFindReplace}
            />
          </div>
          {/* Mobile controls (stacked at <900px) */}
          <div className="min-[900px]:hidden px-4 py-3 flex flex-col gap-3">
            <BulkEditControls
              column={column}
              setColumn={setColumn}
              setValue={setValue}
              setSetValue={setSetValue}
              findValue={findValue}
              setFindValue={setFindValue}
              replaceValue={replaceValue}
              setReplaceValue={setReplaceValue}
              matchCase={matchCase}
              setMatchCase={setMatchCase}
              scopeLabel={scopeLabel}
              someSelected={someSelected}
              onSetColumn={handleSetColumn}
              onFindReplace={handleFindReplace}
              mobile
            />
          </div>
        </div>
      )}

      {/* Result / no-match messages — always shown when present, never silent (Fix 2a). */}
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

      {/* QR export section — divider-separated, visually distinct from Set/Find verbs.
          Only rendered when expanded AND onDownloadQr is provided. */}
      {isExpanded && onDownloadQr && (
        <div className="border-t border-gray-200 px-4 py-2.5 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              {/* QR-square + download icon glyph */}
              <span aria-hidden="true" className="text-base leading-none">⊞⬇</span>
              <div className="flex flex-col gap-0">
                <span className="text-xs font-semibold text-gray-700">Download QR codes</span>
                <span className="text-[10px] text-gray-400 leading-tight">Export</span>
              </div>
            </div>
            {/* Scope pill — same "Apply to:" model as Set/Find */}
            <span
              className={`text-xs rounded-full px-2.5 py-0.5 ${
                selectedRowIds.size > 0
                  ? "bg-blue-600 text-white font-semibold border border-blue-700"
                  : "bg-gray-100 text-gray-500 font-medium border border-gray-200"
              }`}
              aria-live="polite"
              role="status"
            >
              {selectedRowIds.size > 0
                ? `Apply to: ${selectedRowIds.size} selected row${selectedRowIds.size === 1 ? "" : "s"}`
                : `Apply to: all ${rows.length} row${rows.length === 1 ? "" : "s"}`}
            </span>
            <button
              type="button"
              onClick={() => void onDownloadQr()}
              aria-label="Download QR codes as ZIP"
              className="cursor-pointer rounded border border-teal-600 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 shadow-sm active:scale-95 transition-transform whitespace-nowrap"
            >
              Download QR codes
            </button>
          </div>
          {/* Green-fill result message — peripherally unmissable, ref-stable ~3s */}
          {qrResultMessage && (
            <p
              role="status"
              aria-live="polite"
              className={`text-xs font-medium px-2 py-1 rounded ${
                qrResultMessage.startsWith("No QR")
                  ? "text-amber-700 bg-amber-50"
                  : "text-green-700 bg-green-50"
              }`}
            >
              {qrResultMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Inner controls shared between desktop and mobile ─────────────────────────

interface BulkEditControlsProps {
  column: BulkColumn;
  setColumn: (f: BulkColumn) => void;
  setValue: string;
  setSetValue: (v: string) => void;
  findValue: string;
  setFindValue: (v: string) => void;
  replaceValue: string;
  setReplaceValue: (v: string) => void;
  matchCase: boolean;
  setMatchCase: (v: boolean) => void;
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
  matchCase,
  setMatchCase,
  scopeLabel,
  someSelected,
  onSetColumn,
  onFindReplace,
  mobile,
}: BulkEditControlsProps) {
  const baseInputCls =
    "rounded border border-gray-300 bg-white px-2 py-1 text-xs font-mono focus:outline-none focus:border-blue-400";
  // P1-1a: strong button styling so controls unmistakably read as buttons, not inputs.
  const baseBtnCls =
    "cursor-pointer rounded border px-3 py-1.5 text-xs font-semibold whitespace-nowrap shadow-sm active:scale-95 transition-transform";

  // Fix 4: stronger visual emphasis when scope is narrowed to selected rows.
  // P1-2a: pill uses break-words/normal whitespace so it wraps instead of overflowing at 375px.
  const scopePill = (
    <span
      className={`text-xs rounded-full px-2.5 py-0.5 break-words max-w-full ${
        someSelected
          ? "bg-blue-600 text-white font-semibold border border-blue-700"
          : "bg-gray-100 text-gray-500 font-medium border border-gray-200"
      }`}
      aria-live="polite"
      role="status"
    >
      {scopeLabel}
    </span>
  );

  // Fix 5: column picker includes Base URL.
  const columnPicker = (labelVisible: boolean) => (
    <div className={labelVisible ? "flex flex-wrap items-center gap-2" : ""}>
      {labelVisible && (
        <label htmlFor={mobile ? "bulk-col-mobile" : "bulk-col-desktop"} className="text-xs text-gray-600 whitespace-nowrap">
          Column:
        </label>
      )}
      <select
        id={mobile ? "bulk-col-mobile" : "bulk-col-desktop"}
        value={column}
        onChange={(e) => setColumn(e.target.value as BulkColumn)}
        aria-label="Column for bulk edit"
        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
      >
        {ALL_BULK_COLUMNS.map((f) => (
          <option key={f} value={f}>
            {BULK_COLUMN_LABELS[f]}
          </option>
        ))}
      </select>
      {scopePill}
    </div>
  );

  // Fix 6: Match case toggle as a proper label+checkbox (keyboard-operable).
  const matchCaseToggle = (
    <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={matchCase}
        onChange={(e) => setMatchCase(e.target.checked)}
        aria-label="Match case (off = case-insensitive)"
        className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
      />
      Match case
    </label>
  );

  if (mobile) {
    return (
      <div className="flex flex-col gap-3">
        {/* Column picker */}
        {columnPicker(true)}

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
              // Fix 6: Enter from value input triggers Set column.
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSetColumn(); } }}
            />
            <button
              type="button"
              onClick={onSetColumn}
              aria-label={`Set column ${column}`}
              title={`Set ${column} on targeted rows`}
              className={`${baseBtnCls} border-blue-600 bg-blue-600 text-white hover:bg-blue-700`}
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
              // Fix 6: Enter from Find input triggers Find & replace.
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onFindReplace(); } }}
            />
            <input
              value={replaceValue}
              onChange={(e) => setReplaceValue(e.target.value)}
              aria-label="Replace with text"
              placeholder="Replace with"
              className={`${baseInputCls} w-28`}
              // Fix 6: Enter from Replace input triggers Find & replace.
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onFindReplace(); } }}
            />
            <button
              type="button"
              onClick={onFindReplace}
              aria-label={`Find and replace in column ${column}`}
              title={`Replace in ${column} on targeted rows`}
              className={`${baseBtnCls} border-purple-600 bg-purple-600 text-white hover:bg-purple-700`}
            >
              Find &amp; replace in column
            </button>
          </div>
          {/* Fix 2b: Match case toggle */}
          {matchCaseToggle}
        </div>
      </div>
    );
  }

  // Desktop layout: one horizontal row
  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      {/* Fix 5: column picker with Base URL */}
      {columnPicker(false)}

      {/* ── Set column group ── */}
      <div className="flex items-center gap-1.5 border-l border-gray-300 pl-3">
        <input
          value={setValue}
          onChange={(e) => setSetValue(e.target.value)}
          aria-label="Value to set"
          placeholder="New value (empty clears)"
          title="Empty value clears the column."
          className={`${baseInputCls} w-36`}
          // Fix 6: Enter from value input triggers Set column.
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSetColumn(); } }}
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
          // Fix 6: Enter from Find input triggers Find & replace.
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onFindReplace(); } }}
        />
        <input
          value={replaceValue}
          onChange={(e) => setReplaceValue(e.target.value)}
          aria-label="Replace with text"
          placeholder="Replace with"
          className={`${baseInputCls} w-24`}
          // Fix 6: Enter from Replace input triggers Find & replace.
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onFindReplace(); } }}
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
        {/* Fix 2b: Match case toggle */}
        {matchCaseToggle}
      </div>
    </div>
  );
}
