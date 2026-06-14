/**
 * launchCheck.ts — pure helpers for the Launch Check / Compliance Report feature.
 *
 * These functions are INTENTIONALLY pure (no DOM, no browser APIs) so they can be
 * unit-tested in vitest and called from any event handler without SSR concerns.
 *
 * READ-ONLY: nothing here mutates grid rows or triggers any side effect.
 */

import { type LintWarning } from "./lint";
import { type UtmRow } from "./types";
import { buildUtmUrl } from "./utm";

/** Subset of a row we need for the report (just enough to look up the base URL by rowId). */
type RowIndex = Map<string, { baseUrl: string; rowNumber: number }>;

/** One violation row in the downloadable CSV report. */
export interface ViolationRow {
  rowNumber: number;
  baseUrl: string;
  /** Full tagged URL including utm_* params (the generated link for this row). */
  fullUrl: string;
  field: string;
  value: string;
  issueType: string;
  message: string;
}

/** Summary counts for the scorecard. */
export interface LaunchCheckSummary {
  totalLinks: number;
  passingCount: number;
  issueCount: number;
  /** Violations grouped: each unique (issueType, field) key with its list of violations */
  violations: ViolationRow[];
}

/**
 * Build a row index for O(1) lookups from rowId → { baseUrl, rowNumber }.
 */
function buildRowIndex(rows: UtmRow[]): RowIndex {
  const map: RowIndex = new Map();
  rows.forEach((row, i) => {
    map.set(row.id, { baseUrl: row.baseUrl, rowNumber: i + 1 });
  });
  return map;
}

/**
 * Compute the Launch Check summary from already-computed lint warnings and the current rows.
 * Called ONLY from an event handler (never in render), so no SSR risk.
 */
export function computeLaunchCheckSummary(
  rows: UtmRow[],
  warnings: LintWarning[]
): LaunchCheckSummary {
  const rowIndex = buildRowIndex(rows);

  // Determine which rows have at least one warning.
  const rowsWithIssues = new Set(warnings.map((w) => w.rowId));

  const totalLinks = rows.filter(
    (r) => r.baseUrl.trim() || Object.values(r).some((v, _k) => typeof v === "string" && v.trim())
  ).length || rows.length;

  const passingCount = rows.filter((r) => !rowsWithIssues.has(r.id)).length;
  const issueCount = rows.filter((r) => rowsWithIssues.has(r.id)).length;

  // Build one ViolationRow per warning (one per violation, as spec requires).
  const violations: ViolationRow[] = [];
  for (const w of warnings) {
    const meta = rowIndex.get(w.rowId);
    if (!meta) continue;
    const row = rows.find((r) => r.id === w.rowId);
    const value = row ? (row[w.field as keyof UtmRow] as string) ?? "" : "";
    // F5: include full tagged URL (base + utm_* params) so the violation row
    // can be joined back to the exact original link.
    const fullUrl = row ? buildUtmUrl(row) : meta.baseUrl;
    violations.push({
      rowNumber: meta.rowNumber,
      baseUrl: meta.baseUrl,
      fullUrl,
      field: w.field,
      value,
      issueType: w.rule,
      message: w.message,
    });
  }

  // Sort by row number, then field, then issue type for stable output.
  violations.sort((a, b) =>
    a.rowNumber !== b.rowNumber
      ? a.rowNumber - b.rowNumber
      : a.field !== b.field
      ? a.field.localeCompare(b.field)
      : a.issueType.localeCompare(b.issueType)
  );

  return { totalLinks, passingCount, issueCount, violations };
}

/**
 * Escape a CSV cell value (RFC 4180): wrap in double-quotes if it contains
 * a comma, double-quote, or newline; double-escape any existing double-quotes.
 */
export function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * CSV header columns.
 * F5: added "full URL" column (complete tagged URL incl. utm_* params) so a failing
 * row can be joined back to the exact original link. "base URL" remains for the
 * stripped base URL.
 */
const CSV_HEADERS = ["row #", "base URL", "full URL", "field", "value", "issue type", "message"];

/**
 * Generate the CSV report string.
 * - F5: UTF-8 BOM prepended so double-clicking into Excel on Windows doesn't mojibake em-dashes.
 * - F5: "full URL" column carries the complete tagged URL (base + utm_* params).
 * - One row per violation (spec requirement).
 * - When clean: one all-clear row (spec requirement).
 */
export function buildLaunchCheckCsv(summary: LaunchCheckSummary): string {
  // F5: UTF-8 BOM — tells Excel this file is UTF-8 (prevents mojibake on double-click)
  const BOM = "﻿";
  const headerLine = CSV_HEADERS.map(escapeCsvCell).join(",");

  if (summary.violations.length === 0) {
    // All-clear row — 7 columns to match updated header
    const allClearRow = [
      "—",
      "—",
      "—",
      "—",
      "—",
      "all-clear",
      `All ${summary.totalLinks} link${summary.totalLinks === 1 ? "" : "s"} pass — no violations found.`,
    ]
      .map(escapeCsvCell)
      .join(",");
    return `${BOM}${headerLine}\n${allClearRow}\n`;
  }

  const dataLines = summary.violations.map((v) =>
    [
      String(v.rowNumber),
      v.baseUrl,
      v.fullUrl,
      v.field,
      v.value,
      v.issueType,
      v.message,
    ]
      .map(escapeCsvCell)
      .join(",")
  );

  return `${BOM}${headerLine}\n${dataLines.join("\n")}\n`;
}

/**
 * Build a plain-text summary for "Copy summary".
 * Mode-aware: on workspace pages don't say "in your browser".
 */
export function buildLaunchCheckTextSummary(
  summary: LaunchCheckSummary,
  isWorkspaceMode: boolean
): string {
  const header = `Launch Check — Compliance Report`;
  const scorecard = `Total: ${summary.totalLinks} link${summary.totalLinks === 1 ? "" : "s"} checked | Passing: ${summary.passingCount} | With issues: ${summary.issueCount}`;

  if (summary.violations.length === 0) {
    const note = isWorkspaceMode
      ? "Reads the workspace without changing it."
      : "Checked in your browser — nothing sent to any server.";
    return `${header}\n${scorecard}\n\nAll ${summary.totalLinks} links pass — no violations found.\n\n${note}`;
  }

  const violationLines = summary.violations.map(
    (v) => `Row ${v.rowNumber} | ${v.field} | ${v.issueType}: ${v.message}`
  );

  return `${header}\n${scorecard}\n\n${violationLines.join("\n")}`;
}

/**
 * Trigger a CSV download from a string blob.
 * Called only from an event handler — safe in browser context.
 */
export function downloadCsv(csvString: string, filename: string): void {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
