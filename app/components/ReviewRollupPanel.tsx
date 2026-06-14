"use client";

/**
 * ReviewRollupPanel — full-width review roll-up summary shown ABOVE the grid
 * on /w/<id> workspace pages.
 *
 * FIX G (P2): Added subtitle "Mark each link Approved or Needs changes to sign off
 *   before launch." so the sign-off purpose is clear at a glance.
 *
 * Design spec:
 * - Full-width, in normal page flow (NOT a side panel, NOT inside grid columns).
 * - Shows "N approved · N need changes · N unreviewed" + a ratio bar.
 * - Default-visible above the grid.
 * - Indigo accent per UX brief (distinct from amber lint / teal / blue workspace).
 * - Mode-aware: this is server-persisted state — no "client-side only" claims.
 *
 * SINGLE SOURCE: counts always come from computeReviewRollup() from lib/review.ts.
 * The parent passes reviewMap + rowIds — we never re-derive here.
 *
 * Guard: guard 1 (no horizontal overflow). This panel is w-full, no fixed widths.
 * Guard: guard 2 (single eligibility source). Counts from parent via rollup prop.
 * Guard: guard 9 (distinct verb). "Review" / "Approve" / "Needs changes" wording.
 * Guard: guard 10 (JSX space). Explicit {" "} between inline tags.
 */

import type { ReviewRollup } from "../../lib/review";

interface ReviewRollupPanelProps {
  rollup: ReviewRollup;
  /** Is this a read-only rendering (on /review page — no reviewer name control)? */
  readOnly?: boolean;
}

export function ReviewRollupPanel({ rollup }: ReviewRollupPanelProps) {
  const { approved, needsChanges, unreviewed, total } = rollup;

  // Ratio bar widths (percentage)
  const approvedPct = total > 0 ? Math.round((approved / total) * 100) : 0;
  const needsPct = total > 0 ? Math.round((needsChanges / total) * 100) : 0;
  // Unreviewed fills the rest (avoid rounding gap)
  const unreviewedPct = 100 - approvedPct - needsPct;

  const allApproved = total > 0 && approved === total;
  const someNeedChanges = needsChanges > 0;

  return (
    <div
      data-testid="review-rollup-panel"
      role="region"
      aria-label="Review status roll-up"
      className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 mb-4"
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Review status
            </span>
            {allApproved && (
              <span
                role="status"
                aria-live="polite"
                className="inline-flex items-center gap-1 rounded-full bg-green-100 border border-green-300 px-2 py-0.5 text-[11px] font-semibold text-green-800"
              >
                <span aria-hidden="true">✓</span>{" "}
                <span>All approved — ready to launch</span>
              </span>
            )}
            {someNeedChanges && !allApproved && (
              <span
                role="status"
                aria-live="polite"
                className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
              >
                <span aria-hidden="true">⚠</span>{" "}
                <span>{needsChanges} need{needsChanges === 1 ? "s" : ""} changes</span>
              </span>
            )}
          </div>
          {/* FIX G: sign-off subtitle — makes the purpose clear at a glance */}
          <p className="text-xs text-indigo-600 leading-snug">
            Mark each link Approved or Needs changes to sign off before launch.
          </p>
        </div>
        <p className="text-xs text-indigo-400 shrink-0">
          Server-synced — all teammates on this link see the same review state.
        </p>
      </div>

      {/* Count line */}
      <div
        className="flex flex-wrap items-center gap-3 mb-2"
        aria-live="polite"
        role="status"
        data-testid="review-count-line"
      >
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
          <span
            className="inline-block h-3 w-3 rounded-full bg-green-500 shrink-0"
            aria-hidden="true"
          />
          {approved}{" "}
          <span className="font-normal text-green-600">approved</span>
        </span>
        <span className="text-indigo-200 shrink-0" aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
          <span
            className="inline-block h-3 w-3 rounded-full bg-amber-500 shrink-0"
            aria-hidden="true"
          />
          {needsChanges}{" "}
          <span className="font-normal text-amber-600">
            need{needsChanges === 1 ? "s" : ""} changes
          </span>
        </span>
        <span className="text-indigo-200 shrink-0" aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600">
          <span
            className="inline-block h-3 w-3 rounded-full bg-slate-300 shrink-0"
            aria-hidden="true"
          />
          {unreviewed}{" "}
          <span className="font-normal text-slate-500">unreviewed</span>
        </span>
      </div>

      {/* Ratio bar */}
      {total > 0 && (
        <div
          className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex"
          role="img"
          aria-label={`${approved} approved, ${needsChanges} need changes, ${unreviewed} unreviewed out of ${total} total`}
        >
          {approvedPct > 0 && (
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${approvedPct}%` }}
            />
          )}
          {needsPct > 0 && (
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${needsPct}%` }}
            />
          )}
          {unreviewedPct > 0 && (
            <div
              className="h-full bg-slate-300 transition-all duration-300"
              style={{ width: `${unreviewedPct}%` }}
            />
          )}
        </div>
      )}

      {total === 0 && (
        <p className="text-xs text-indigo-400 italic">No links in this workspace yet.</p>
      )}
    </div>
  );
}
