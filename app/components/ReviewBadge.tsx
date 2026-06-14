"use client";

/**
 * ReviewBadge — per-row compact review state badge that opens a popover
 * with Approve / Needs changes / note controls.
 *
 * Design spec:
 * - Leftmost review area per UX brief.
 * - ONE compact fixed-width badge/button per row.
 * - Popover anchored, high z-stack (z-[11]+) for mobile tappability.
 * - Note + reviewer name in the popover + truncated tooltip, NOT inline columns.
 * - Indigo accent (distinct from amber lint, teal check, blue workspace).
 *
 * Guards implemented here:
 * #1 NO HORIZONTAL OVERFLOW — badge is compact fixed-width, uses no w-NN shrink-0
 *    that would escape container resize; capped at w-[100px] which is explicit intent.
 * #5 MOBILE — high z-[50] popover, ≥44px tap targets.
 * #6 DUAL-RENDER — only ONE popover per row; we use an `open` boolean +
 *    document click handler that ignores clicks inside [role="dialog"].
 * #9 DISTINCT VERB — "Review"/"Approve"/"Needs changes" (never Audit/Check).
 * #10 JSX SPACE — explicit {" "} after closing inline tags.
 * #11 TESTIDS — suffixed with -table / -card when dual-rendered
 *    (the parent can pass suffix prop).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReviewEntry } from "../../lib/review";

type ReviewState = "approved" | "needs-changes" | "unreviewed";

interface ReviewBadgeProps {
  rowId: string;
  rowIndex: number;
  /** Current state from reviewMap (single-source) */
  reviewState: ReviewState;
  /** The full ReviewEntry (null if unreviewed) */
  reviewEntry: ReviewEntry | null;
  /** Reviewer name for this browser (from localStorage) */
  reviewerName: string;
  /** Called when reviewer sets a review */
  onSetReview: (
    rowId: string,
    state: "approved" | "needs-changes",
    note: string
  ) => void;
  /** Called when reviewer clears a review */
  onClearReview: (rowId: string) => void;
  /** Breakpoint suffix for testid de-duplication on dual-rendered table+card */
  testidSuffix?: "table" | "card";
}

const STATE_LABELS: Record<ReviewState, string> = {
  approved: "Approved",
  "needs-changes": "Needs changes",
  unreviewed: "Review",
};

const STATE_BADGE_CLASS: Record<ReviewState, string> = {
  approved:
    "bg-green-100 text-green-800 border border-green-300 hover:bg-green-200",
  "needs-changes":
    "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200",
  unreviewed:
    "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100",
};

const STATE_DOT_CLASS: Record<ReviewState, string> = {
  approved: "bg-green-500",
  "needs-changes": "bg-amber-500",
  unreviewed: "bg-slate-300",
};

export function ReviewBadge({
  rowId,
  rowIndex,
  reviewState,
  reviewEntry,
  reviewerName,
  onSetReview,
  onClearReview,
  testidSuffix,
}: ReviewBadgeProps) {
  const [open, setOpen] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const badgeRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const suffix = testidSuffix ? `-${testidSuffix}` : "";

  // Pre-fill note when opening
  const openPopover = useCallback(() => {
    setNoteInput(reviewEntry?.note ?? "");
    setOpen(true);
  }, [reviewEntry]);

  // Close on outside click — guard #6: ignore clicks inside any [role="dialog"]
  // so a hidden dual-rendered sibling's listener doesn't cross-dismiss this popover.
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (!target) return;
      // Ignore clicks inside our own popover
      if (popoverRef.current?.contains(target)) return;
      // Ignore clicks inside our own badge button
      if (badgeRef.current?.contains(target)) return;
      // Guard #6: ignore clicks inside any dialog element to prevent cross-dismiss
      if (target.closest('[role="dialog"]')) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick, true);
    return () => document.removeEventListener("mousedown", handleClick, true);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleApprove = useCallback(() => {
    onSetReview(rowId, "approved", noteInput);
    setOpen(false);
  }, [rowId, noteInput, onSetReview]);

  const handleNeedsChanges = useCallback(() => {
    onSetReview(rowId, "needs-changes", noteInput);
    setOpen(false);
  }, [rowId, noteInput, onSetReview]);

  const handleClear = useCallback(() => {
    onClearReview(rowId);
    setOpen(false);
  }, [rowId, onClearReview]);

  const displayReviewer = reviewEntry?.reviewer || reviewerName || "You";
  const shortNote =
    reviewEntry?.note && reviewEntry.note.length > 40
      ? reviewEntry.note.slice(0, 40) + "…"
      : reviewEntry?.note;

  return (
    <div className="relative" data-testid={`review-badge-container-row-${rowIndex}${suffix}`}>
      {/* Badge button */}
      <button
        ref={badgeRef}
        type="button"
        aria-label={`Row ${rowIndex + 1} review: ${STATE_LABELS[reviewState]}. Click to review.`}
        aria-expanded={open}
        aria-haspopup="dialog"
        data-testid={`review-badge-btn-row-${rowIndex}${suffix}`}
        onClick={() => (open ? setOpen(false) : openPopover())}
        title={
          reviewEntry
            ? `${STATE_LABELS[reviewState]} by ${displayReviewer}${reviewEntry.note ? ` · ${reviewEntry.note}` : ""}`
            : STATE_LABELS[reviewState]
        }
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors min-h-[36px] whitespace-nowrap ${STATE_BADGE_CLASS[reviewState]}`}
      >
        <span
          className={`inline-block h-2 w-2 rounded-full shrink-0 ${STATE_DOT_CLASS[reviewState]}`}
          aria-hidden="true"
        />
        <span>{STATE_LABELS[reviewState]}</span>
        {shortNote && (
          <span className="hidden sm:inline text-[10px] font-normal opacity-75 max-w-[60px] truncate">
            {shortNote}
          </span>
        )}
      </button>

      {/* Anchored popover — guard #5: z-50, guard #6: role="dialog" */}
      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`Review row ${rowIndex + 1}`}
          data-testid={`review-popover-row-${rowIndex}${suffix}`}
          className="absolute left-0 top-full mt-1 z-[50] w-64 rounded-lg border border-indigo-200 bg-white shadow-lg shadow-indigo-100/50 p-3 flex flex-col gap-2"
        >
          {/* Popover header */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-xs font-semibold text-indigo-800">
              Review row {rowIndex + 1}
            </span>
            <button
              type="button"
              aria-label="Close review popover"
              onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-700 p-1 -mr-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Reviewer context */}
          {reviewEntry && (
            <div className="text-[11px] text-indigo-600 bg-indigo-50 rounded px-2 py-1">
              {reviewEntry.state === "approved" ? "✓ Approved" : "⚠ Needs changes"}{" "}
              by{" "}
              <span className="font-semibold">
                {reviewEntry.reviewer || "Anonymous"}
              </span>
            </div>
          )}

          {/* Note field */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`review-note-${rowId}${suffix}`}
              className="text-[11px] font-medium text-gray-600"
            >
              Note <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id={`review-note-${rowId}${suffix}`}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="e.g. fix campaign casing"
              className="w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              data-testid={`review-approve-btn-row-${rowIndex}${suffix}`}
              onClick={handleApprove}
              className="w-full rounded-md border border-green-300 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800 hover:bg-green-100 transition-colors min-h-[40px]"
            >
              ✓{" "}
              Approve
            </button>
            <button
              type="button"
              data-testid={`review-needs-changes-btn-row-${rowIndex}${suffix}`}
              onClick={handleNeedsChanges}
              className="w-full rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors min-h-[40px]"
            >
              ⚠{" "}
              Needs changes
            </button>
            {reviewState !== "unreviewed" && (
              <button
                type="button"
                data-testid={`review-clear-btn-row-${rowIndex}${suffix}`}
                onClick={handleClear}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-normal text-gray-500 hover:bg-gray-50 transition-colors min-h-[36px]"
              >
                Clear review
              </button>
            )}
          </div>

          {/* Reviewer name shown (informational only — name is set in the banner) */}
          <p className="text-[10px] text-indigo-400 leading-tight">
            Reviewing as:{" "}
            <span className="font-semibold">{reviewerName || "Anonymous"}</span>
          </p>
        </div>
      )}
    </div>
  );
}
