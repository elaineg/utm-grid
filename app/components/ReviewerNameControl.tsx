"use client";

/**
 * ReviewerNameControl — "Reviewing as: [name]" control for /w/<id> pages.
 *
 * Mirrors the existing WorkspaceHistory "Editing as: [name]" control pattern.
 * - Stored in localStorage key `utm-grid:reviewer-name`.
 * - SSR-safe: init to "" (empty), read localStorage in useEffect only.
 * - NEVER required, NEVER blocks the cold-open editable grid.
 * - Optional and anonymous-first.
 *
 * Guard #4 (SSR/HYDRATION): localStorage read in useEffect, not useState initializer.
 * Guard #8 (MODE-AWARE PRIVACY): reviewer name is a per-device local label, but
 *   review state itself is server-persisted — copy here is accurate.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export const REVIEWER_KEY = "utm-grid:reviewer-name";

interface ReviewerNameControlProps {
  /** Called whenever the reviewer name changes */
  onNameChange: (name: string) => void;
}

export function ReviewerNameControl({ onNameChange }: ReviewerNameControlProps) {
  // Guard #4: init to "" (SSR-safe), read localStorage in useEffect
  const [reviewerName, setReviewerName] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Mount: read reviewer name from localStorage DIRECTLY (guard #4: not closured state)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(REVIEWER_KEY);
      if (raw !== null) {
        const val = JSON.parse(raw) as string;
        const name = typeof val === "string" ? val.trim() : "";
        if (name) {
          setReviewerName(name);
          onNameChange(name);
        }
      }
    } catch {
      // localStorage unavailable — leave empty
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only

  const commitName = useCallback(
    (raw: string) => {
      const trimmed = raw.trim().slice(0, 80);
      const final = trimmed || "";
      setReviewerName(final);
      setIsEditing(false);
      try {
        window.localStorage.setItem(REVIEWER_KEY, JSON.stringify(final));
      } catch {
        // unavailable
      }
      onNameChange(final);
    },
    [onNameChange]
  );

  const startEdit = useCallback(() => {
    setNameInput(reviewerName);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [reviewerName]);

  const displayName = reviewerName || "Anonymous";

  return (
    <span className="flex items-center gap-1 text-xs text-indigo-700">
      {isEditing ? (
        <div className="flex flex-col gap-0.5">
          <input
            ref={inputRef}
            type="text"
            value={nameInput}
            maxLength={80}
            placeholder="Your name (optional)"
            aria-label="Your reviewer name for this workspace"
            data-testid="reviewer-name-input"
            className="rounded border border-indigo-300 bg-white px-2 py-1 text-xs text-indigo-900 min-w-0 w-40 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName(nameInput);
              if (e.key === "Escape") setIsEditing(false);
            }}
            onBlur={() => commitName(nameInput)}
          />
          <span className="text-[10px] text-indigo-500 leading-tight max-w-[200px]">
            Optional — saved on this device. Never required to review.
          </span>
        </div>
      ) : (
        <button
          type="button"
          aria-label={`Reviewing as: ${displayName}. Click to change.`}
          data-testid="reviewer-name-btn"
          onClick={startEdit}
          className="inline-flex items-center gap-1 rounded border border-transparent px-1 py-0.5 hover:border-indigo-200 hover:bg-indigo-100 transition-colors text-xs text-indigo-700 min-h-[44px]"
        >
          <span aria-hidden="true">🔍</span>{" "}
          <span>
            Reviewing as:{" "}
            <span className="font-semibold">{displayName}</span>
          </span>
        </button>
      )}
    </span>
  );
}
