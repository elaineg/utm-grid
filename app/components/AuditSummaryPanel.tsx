"use client";

/**
 * AuditSummaryPanel — Post-audit grouped summary.
 *
 * Renders ABOVE the grid in normal page flow (full-width, not a side panel) so the
 * audit payoff is legible with NO horizontal scrolling (Fix 1).
 *
 * Groups warnings BY FIELD, deduped — one line per field instead of repeating the
 * full GA4 sentence per row (Fix 2).
 *
 * Names each skipped line with its number, truncated text, and reason (Fix 3).
 *
 * The flaggedCount is derived from the LIVE warnings map so it updates after
 * Auto-fix — zero remaining = "All audited URLs are clean" (Fix 4).
 */

import type { LintWarning } from "../../lib/lint";
import type { ParsedLine } from "../../lib/utm";
import type { UtmField } from "../../lib/types";
import { FIELD_LABELS, UTM_FIELDS } from "../../lib/types";

export interface AuditSummaryPanelProps {
  /** Number of URLs successfully parsed from the paste */
  parsedCount: number;
  /** All lint warnings currently active for the audited rows (live from lintRows) */
  liveWarnings: LintWarning[];
  /** Set of row IDs that came from this audit (to filter warnings to just audited rows) */
  auditedRowIds: Set<string>;
  /** Lines that were skipped (non-blank, non-parseable) */
  skipped: ParsedLine[];
  /** Called when the user dismisses the panel */
  onDismiss: () => void;
}

const FIELD_ORDER: (UtmField | "baseUrl")[] = [
  "baseUrl",
  ...UTM_FIELDS,
];

const MAX_SKIPPED_PREVIEW = 60;

/** Summarize a group of warnings for one field into a short human-readable string. */
function summarizeFieldWarnings(field: UtmField | "baseUrl", fieldWarnings: LintWarning[]): string[] {
  const lines: string[] = [];

  // Inconsistency — show variants and row count
  const inconsistents = fieldWarnings.filter((w) => w.rule === "inconsistent");
  if (inconsistents.length > 0) {
    // Extract variant names from the first message (they all have the same variants)
    const msg = inconsistents[0].message;
    // Message format: "Inconsistent X across rows: "A" vs "B" — these will …"
    const variantMatch = msg.match(/:\s+(.+?)\s+—\s+these/);
    const variants = variantMatch ? variantMatch[1] : "(mixed values)";
    lines.push(`Inconsistent values (${inconsistents.length} cell${inconsistents.length === 1 ? "" : "s"}): ${variants}`);
  }

  // Lowercase — show count
  const lowercases = fieldWarnings.filter((w) => w.rule === "lowercase");
  if (lowercases.length > 0) {
    lines.push(`Contains uppercase letters (${lowercases.length} cell${lowercases.length === 1 ? "" : "s"}) — Auto-fix can normalize`);
  }

  // Spaces — show count
  const spaces = fieldWarnings.filter((w) => w.rule === "no-spaces");
  if (spaces.length > 0) {
    lines.push(`Contains spaces (${spaces.length} cell${spaces.length === 1 ? "" : "s"}) — Auto-fix can normalize`);
  }

  // Required — show count
  const required = fieldWarnings.filter((w) => w.rule === "required");
  if (required.length > 0) {
    lines.push(`Missing required value (${required.length} row${required.length === 1 ? "" : "s"})`);
  }

  // Invalid URL
  const invalidUrl = fieldWarnings.filter((w) => w.rule === "invalid-url");
  if (invalidUrl.length > 0) {
    lines.push(`Invalid URL format (${invalidUrl.length} cell${invalidUrl.length === 1 ? "" : "s"}) — include https://`);
  }

  // Base URL already has UTM params
  const baseUtm = fieldWarnings.filter((w) => w.rule === "base-utm");
  if (baseUtm.length > 0) {
    lines.push(`Base URL already contains UTM params (${baseUtm.length} cell${baseUtm.length === 1 ? "" : "s"})`);
  }

  // Off-spec
  const offSpec = fieldWarnings.filter((w) => w.rule === "off-spec");
  if (offSpec.length > 0) {
    lines.push(`Off-spec / not in allowed values (${offSpec.length} cell${offSpec.length === 1 ? "" : "s"})`);
  }

  return lines;
}

export function AuditSummaryPanel({
  parsedCount,
  liveWarnings,
  auditedRowIds,
  skipped,
  onDismiss,
}: AuditSummaryPanelProps) {
  // Filter to only warnings for the audited rows (ignore pre-existing rows in Append mode)
  const auditWarnings = liveWarnings.filter((w) => auditedRowIds.has(w.rowId));

  // Group by field
  const byField = new Map<UtmField | "baseUrl", LintWarning[]>();
  for (const w of auditWarnings) {
    const key = w.field as UtmField | "baseUrl";
    const list = byField.get(key) ?? [];
    list.push(w);
    byField.set(key, list);
  }

  // Total live flagged count (cells, not warnings)
  const flaggedCellCount = new Set(auditWarnings.map((w) => `${w.rowId}:${w.field}`)).size;
  const allClean = flaggedCellCount === 0;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="audit-summary-panel"
      className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 w-full"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-violet-900">
            Audit complete — {parsedCount} URL{parsedCount === 1 ? "" : "s"} parsed
            {allClean ? (
              <span className="ml-2 text-green-700"> All audited URLs are clean</span>
            ) : (
              <span className="ml-2 text-violet-700">
                · {flaggedCellCount} cell{flaggedCellCount === 1 ? "" : "s"} flagged
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss audit summary"
          className="shrink-0 text-violet-500 hover:text-violet-700 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Grouped field issues */}
      {!allClean && (
        <ul className="mt-2 space-y-1" data-testid="audit-summary-issues">
          {FIELD_ORDER.filter((f) => byField.has(f)).map((field) => {
            const fieldWarnings = byField.get(field)!;
            const summaryLines = summarizeFieldWarnings(field, fieldWarnings);
            if (summaryLines.length === 0) return null;
            const label = FIELD_LABELS[field as keyof typeof FIELD_LABELS] ?? field;
            return (
              <li key={field} className="text-xs text-violet-800">
                <span className="font-semibold text-violet-900">{label}:</span>{" "}
                {summaryLines.join(" · ")}
              </li>
            );
          })}
        </ul>
      )}

      {/* Skipped lines — Fix 3: name each line with number, truncated text, reason */}
      {skipped.length > 0 && (
        <div className="mt-2 border-t border-violet-200 pt-2" data-testid="audit-summary-skipped">
          <p className="text-xs font-semibold text-violet-700">
            {skipped.length} line{skipped.length === 1 ? "" : "s"} skipped (no valid URL found):
          </p>
          <ul className="mt-1 space-y-0.5">
            {skipped.map((s) => (
              <li key={s.lineNo} className="text-xs text-violet-600 font-mono">
                Line {s.lineNo}:{" "}
                <span className="text-violet-500">
                  &ldquo;{s.line.length > MAX_SKIPPED_PREVIEW ? s.line.slice(0, MAX_SKIPPED_PREVIEW) + "…" : s.line}&rdquo;
                </span>
                {" "}— {s.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
