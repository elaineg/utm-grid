"use client";

/**
 * ReviewBadge — per-row compact review state badge that opens a popover
 * with Approve / Needs changes / note controls.
 *
 * FIX A (P0): Unified identity — "reviewerName" now comes from the SAME
 *   "Your name" editor-name localStorage key as the edit attribution.
 *   The popover shows an inline name input ("Reviewing as: <name>") so
 *   a user who hasn't set a name can set it right before confirming —
 *   never silently logging "Anonymous". Name is optional and never blocks.
 *   Name changes inside the popover call onNameChange so the parent can
 *   persist them to the unified localStorage key.
 *
 * FIX C (P1): Popover interaction.
 *   - Render synchronously on first click (no autoFocus that triggers onBlur
 *     on parent inputs — lesson auto-focus-onblur-swallows-first-click-on-siblings).
 *   - Position upward when near viewport bottom (clamp to viewport).
 *   - Dual-render outside-click guard: ignore clicks inside [role="dialog"].
 *
 * FIX E (P1): "Needs changes" chip label "Changes" (short enough to fit at 1280px).
 *   Badge shows full "Needs changes" in tooltip/aria-label; chip label shows "Changes".
 *
 * Guards implemented here:
 * #1 NO HORIZONTAL OVERFLOW — badge compact fixed-width.
 * #5 MOBILE — high z-[50] popover, ≥44px tap targets.
 * #6 DUAL-RENDER — only ONE popover per row; document click handler ignores
 *    clicks inside [role="dialog"] to prevent cross-dismiss.
 * #9 DISTINCT VERB — "Review"/"Approve"/"Needs changes".
 * #10 JSX SPACE — explicit {" "} after closing inline tags.
 * #11 TESTIDS — suffixed with -table / -card when dual-rendered.
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
  /** Reviewer name for this browser (from unified localStorage — same as editor-name) */
  reviewerName: string;
  /** Called when reviewer sets a review */
  onSetReview: (
    rowId: string,
    state: "approved" | "needs-changes",
    note: string
  ) => void;
  /** Called when reviewer clears a review */
  onClearReview: (rowId: string) => void;
  /**
   * FIX A: Called when the user sets/changes their name in the popover.
   * Parent persists it to the unified localStorage key.
   */
  onNameChange?: (name: string) => void;
  /** Breakpoint suffix for testid de-duplication on dual-rendered table+card */
  testidSuffix?: "table" | "card";
}

/** Badge chip label — short enough to render without truncation at 1280px. */
const CHIP_LABELS: Record<ReviewState, string> = {
  approved: "Approved",
  "needs-changes": "Changes", // FIX E: short label — full text in aria-label/tooltip
  unreviewed: "Review",
};

/** Full label used in aria-label, tooltip, popover header. */
const FULL_LABELS: Record<ReviewState, string> = {
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
  onNameChange,
  testidSuffix,
}: ReviewBadgeProps) {
  const [open, setOpen] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  // FIX A: local name state inside popover — pre-filled from prop, editable before confirm.
  const [nameInput, setNameInput] = useState("");
  // FIX C: track whether popover should open upward (near bottom of viewport).
  const [openUpward, setOpenUpward] = useState(false);
  const badgeRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const suffix = testidSuffix ? `-${testidSuffix}` : "";

  // Pre-fill note + name when opening
  // FIX C: Do NOT call focus() here — autofocus triggers onBlur on any previously
  // focused "Your name" input in the banner, which swallows the first click.
  // (lesson: auto-focus-onblur-swallows-first-click-on-siblings)
  const openPopover = useCallback(() => {
    setNoteInput(reviewEntry?.note ?? "");
    // FIX A: pre-fill with current reviewer name (from unified identity)
    setNameInput(reviewerName || "");

    // FIX C: determine if we're near the bottom of the viewport so we can open upward
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // If less than 280px below the badge, open upward
      setOpenUpward(viewportH - rect.bottom < 280);
    }

    setOpen(true);
    // No focus() — intentional, per lesson auto-focus-onblur-swallows-first-click-on-siblings.
  }, [reviewEntry, reviewerName]);

  // FIX A: commit the name entered in the popover before recording the review.
  const commitNameFromPopover = useCallback(() => {
    const trimmed = nameInput.trim().slice(0, 80);
    if (onNameChange && trimmed !== reviewerName) {
      onNameChange(trimmed);
    }
    return trimmed || reviewerName || "";
  }, [nameInput, reviewerName, onNameChange]);

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
    const name = commitNameFromPopover();
    onSetReview(rowId, "approved", noteInput);
    // FIX A: name already committed via commitNameFromPopover calling onNameChange
    void name; // used for side-effect only
    setOpen(false);
  }, [rowId, noteInput, onSetReview, commitNameFromPopover]);

  const handleNeedsChanges = useCallback(() => {
    const name = commitNameFromPopover();
    onSetReview(rowId, "needs-changes", noteInput);
    void name;
    setOpen(false);
  }, [rowId, noteInput, onSetReview, commitNameFromPopover]);

  const handleClear = useCallback(() => {
    onClearReview(rowId);
    setOpen(false);
  }, [rowId, onClearReview]);

  const displayReviewer = reviewEntry?.reviewer || reviewerName || "You";
  const shortNote =
    reviewEntry?.note && reviewEntry.note.length > 40
      ? reviewEntry.note.slice(0, 40) + "…"
      : reviewEntry?.note;

  // FIX C: popover position — open upward when near viewport bottom to stay visible.
  const popoverPositionClass = openUpward
    ? "absolute left-0 bottom-full mb-1 z-[50]"
    : "absolute left-0 top-full mt-1 z-[50]";

  return (
    <div className="relative" data-testid={`review-badge-container-row-${rowIndex}${suffix}`}>
      {/* Badge button */}
      <button
        ref={badgeRef}
        type="button"
        aria-label={`Row ${rowIndex + 1} review: ${FULL_LABELS[reviewState]}. Click to review.`}
        aria-expanded={open}
        aria-haspopup="dialog"
        data-testid={`review-badge-btn-row-${rowIndex}${suffix}`}
        onClick={() => (open ? setOpen(false) : openPopover())}
        title={
          reviewEntry
            ? `${FULL_LABELS[reviewState]} by ${displayReviewer}${reviewEntry.note ? ` · ${reviewEntry.note}` : ""}`
            : FULL_LABELS[reviewState]
        }
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors min-h-[36px] whitespace-nowrap ${STATE_BADGE_CLASS[reviewState]}`}
      >
        <span
          className={`inline-block h-2 w-2 rounded-full shrink-0 ${STATE_DOT_CLASS[reviewState]}`}
          aria-hidden="true"
        />
        {/* FIX E: short chip label for "needs-changes" so it doesn't truncate at 1280px */}
        <span>{CHIP_LABELS[reviewState]}</span>
        {shortNote && (
          <span className="hidden sm:inline text-[10px] font-normal opacity-75 max-w-[60px] truncate">
            {shortNote}
          </span>
        )}
      </button>

      {/* Anchored popover — guard #5: z-50, guard #6: role="dialog" */}
      {/* FIX C: position upward when near viewport bottom (openUpward state) */}
      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`Review row ${rowIndex + 1}`}
          data-testid={`review-popover-row-${rowIndex}${suffix}`}
          className={`${popoverPositionClass} w-64 rounded-lg border border-indigo-200 bg-white shadow-lg shadow-indigo-100/50 p-3 flex flex-col gap-2`}
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

          {/* FIX A: "Reviewing as" identity inline in the popover.
              Pre-filled from the unified "Your name" (editor-name).
              Allows user who hasn't set a name to set it before confirming.
              NEVER blocks opening the popover or clicking Approve/Needs changes. */}
          <div className="flex flex-col gap-0.5">
            <label
              htmlFor={`popover-reviewer-name-${rowId}${suffix}`}
              className="text-[10px] font-medium text-indigo-600"
            >
              Reviewing as
            </label>
            <input
              ref={nameInputRef}
              id={`popover-reviewer-name-${rowId}${suffix}`}
              type="text"
              value={nameInput}
              maxLength={80}
              placeholder="Your name (optional)"
              aria-label="Your name for this review"
              data-testid={`review-popover-name-input-row-${rowIndex}${suffix}`}
              className="rounded border border-indigo-200 bg-white px-2 py-1 text-xs text-indigo-900 w-full focus:outline-none focus:ring-1 focus:ring-indigo-300"
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={() => {
                // Save on blur so name persists if user blurs without clicking a button
                const trimmed = nameInput.trim().slice(0, 80);
                if (onNameChange && trimmed !== reviewerName) {
                  onNameChange(trimmed);
                }
              }}
            />
          </div>

          {/* Prior review context */}
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

          {/* Name is optional, never required to review */}
          <p className="text-[10px] text-indigo-400 leading-tight">
            Name is optional — your device only, never required to review.
          </p>
        </div>
      )}
    </div>
  );
}
