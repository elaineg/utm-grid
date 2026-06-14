"use client";

/**
 * ComplianceReportPanel — Launch Check / Compliance Report.
 *
 * Visually DISTINCT from AuditSummaryPanel (violet paste-audit):
 * - Slate/teal "QA report" treatment with checklist/shield glyph.
 * - Title: "Launch Check — Compliance Report"
 * - Scorecard + grouped issues + Download CSV + Copy summary.
 *
 * FULL-WIDTH in normal page flow — never a side panel, never inside grid columns.
 * READ-ONLY: this panel NEVER mutates rows or triggers autosave.
 * NO SSR read: the report is held in state initialized in the parent's event handler.
 */

import { useRef, useState } from "react";
import { writeClipboard } from "../../lib/share";
import {
  buildLaunchCheckCsv,
  buildLaunchCheckTextSummary,
  downloadCsv,
  type LaunchCheckSummary,
} from "../../lib/launchCheck";
import { FIELD_LABELS } from "../../lib/types";
import type { UtmField } from "../../lib/types";

/** Group violations by issue type + field for the "issues" section. */
function groupViolationsByTypeAndField(
  violations: LaunchCheckSummary["violations"]
): Map<string, LaunchCheckSummary["violations"]> {
  const map = new Map<string, LaunchCheckSummary["violations"]>();
  for (const v of violations) {
    const key = `${v.issueType}:${v.field}`;
    const list = map.get(key) ?? [];
    list.push(v);
    map.set(key, list);
  }
  return map;
}

/** Human-readable issue type label. */
function issueTypeLabel(issueType: string): string {
  switch (issueType) {
    case "required": return "Missing required";
    case "lowercase": return "Uppercase letters";
    case "no-spaces": return "Contains spaces";
    case "inconsistent": return "Inconsistent values";
    case "off-spec": return "Off-spec (not in allowed values)";
    case "off-template": return "Off-template structure";
    case "invalid-url": return "Invalid URL";
    case "base-utm": return "Base URL has UTM params";
    default: return issueType;
  }
}

/** Color class for the issue type badge. */
function issueTypeBadgeClass(issueType: string): string {
  switch (issueType) {
    case "off-spec": return "bg-violet-100 text-violet-800";
    case "off-template": return "bg-teal-100 text-teal-800";
    case "required":
    case "invalid-url":
    case "base-utm": return "bg-red-50 text-red-700";
    default: return "bg-amber-50 text-amber-800";
  }
}

export interface ComplianceReportPanelProps {
  summary: LaunchCheckSummary;
  isWorkspaceMode: boolean;
  onDismiss: () => void;
}

export function ComplianceReportPanel({
  summary,
  isWorkspaceMode,
  onDismiss,
}: ComplianceReportPanelProps) {
  const allPass = summary.violations.length === 0;

  // "Copy summary" — ref-stable timer that survives re-render (spec requirement).
  const [copySummaryState, setCopySummaryState] = useState<"idle" | "copied">("idle");
  const copySummaryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopySummary = async () => {
    const text = buildLaunchCheckTextSummary(summary, isWorkspaceMode);
    try {
      await writeClipboard(text);
    } catch {
      // execCommand/textarea fallback already tried inside writeClipboard
    }
    if (copySummaryTimer.current) clearTimeout(copySummaryTimer.current);
    setCopySummaryState("copied");
    copySummaryTimer.current = setTimeout(() => {
      setCopySummaryState("idle");
      copySummaryTimer.current = null;
    }, 1800);
  };

  const handleDownloadCsv = () => {
    const csv = buildLaunchCheckCsv(summary);
    downloadCsv(csv, "utm-launch-check.csv");
  };

  const grouped = groupViolationsByTypeAndField(summary.violations);

  // Calculate pass ratio (0–100%) for the thin bar.
  const passRatio = summary.totalLinks > 0
    ? Math.round((summary.passingCount / summary.totalLinks) * 100)
    : 100;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="compliance-report-panel"
      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-4"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {/* Shield/checklist glyph — teal, distinct from violet AuditSummaryPanel */}
            <span aria-hidden="true" className="text-teal-600 text-lg leading-none">✓</span>
            <h2 className="text-sm font-bold text-slate-900">
              Launch Check — Compliance Report
            </h2>
          </div>
          {/* Mode-aware privacy note */}
          <p className="mt-0.5 text-[11px] text-slate-400">
            {isWorkspaceMode
              ? "Reads this workspace without changing it."
              : "Checked in your browser — nothing sent to any server."}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss compliance report"
          data-testid="compliance-report-dismiss"
          className="shrink-0 text-slate-400 hover:text-slate-600 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Scorecard */}
      <div className="mt-3 flex flex-wrap gap-4 items-center">
        <span className="text-sm text-slate-600">
          <strong className="text-slate-900 text-base">{summary.totalLinks}</strong>
          {" "}link{summary.totalLinks === 1 ? "" : "s"} checked
        </span>
        <span className="text-sm text-green-700">
          <strong className="text-base">{summary.passingCount}</strong>
          {" "}passing
        </span>
        {summary.issueCount > 0 && (
          <span className="text-sm text-amber-700">
            <strong className="text-base">{summary.issueCount}</strong>
            {" "}with issues
          </span>
        )}
      </div>

      {/* Pass ratio bar */}
      <div
        className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-300"
          style={{ width: `${passRatio}%` }}
        />
      </div>

      {/* All-pass success state */}
      {allPass && (
        <div
          role="status"
          data-testid="compliance-report-all-pass"
          className="mt-3 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2"
        >
          <span aria-hidden="true" className="text-green-600 font-bold text-lg">✓</span>
          <p className="text-sm font-semibold text-green-800">
            All {summary.totalLinks} link{summary.totalLinks === 1 ? "" : "s"} pass
          </p>
        </div>
      )}

      {/* Issue groups */}
      {!allPass && (
        <div
          className="mt-3 space-y-3"
          data-testid="compliance-report-issues"
        >
          {Array.from(grouped.entries()).map(([key, violations]) => {
            const [issueType, field] = key.split(":");
            const fieldLabel =
              FIELD_LABELS[field as UtmField | "baseUrl"] ?? field;
            return (
              <div
                key={key}
                className="rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${issueTypeBadgeClass(issueType)}`}
                  >
                    {issueTypeLabel(issueType)}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {fieldLabel}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({violations.length} row{violations.length === 1 ? "" : "s"})
                  </span>
                </div>
                <ul className="space-y-1">
                  {violations.map((v, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-700 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5"
                    >
                      <span className="font-semibold text-slate-500 shrink-0">
                        Row {v.rowNumber}
                      </span>
                      {v.value && (
                        <span className="font-mono text-[11px] text-slate-600 truncate max-w-[16rem]">
                          &ldquo;{v.value}&rdquo;
                        </span>
                      )}
                      <span className="text-slate-500 min-w-0">{v.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions row */}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          data-testid="compliance-download-csv"
          onClick={handleDownloadCsv}
          className="min-h-[44px] rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
        >
          Download report (CSV)
        </button>

        {/* "Copy summary" — ref-stable green fill + label flip + aria-live (spec requirement) */}
        <button
          type="button"
          data-testid="compliance-copy-summary"
          aria-label="copy-summary"
          onClick={() => void handleCopySummary()}
          className={`min-h-[44px] rounded-md border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            copySummaryState === "copied"
              ? "border-green-500 bg-green-500 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
          }`}
        >
          {copySummaryState === "copied" ? (
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">✓</span>{" "}
              <span>Copied!</span>
            </span>
          ) : (
            "Copy summary"
          )}
        </button>
        {/* aria-live region for screenreader announcement of copy */}
        <span role="status" aria-live="polite" className="sr-only">
          {copySummaryState === "copied" ? "Summary copied to clipboard!" : ""}
        </span>
      </div>
    </div>
  );
}
