"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  composeCampaignName,
  type NamingTemplate,
} from "../../lib/namingTemplate";

interface BuildNameComposerProps {
  template: NamingTemplate;
  /** Current utm_campaign value (pre-fills dropdowns/inputs where possible). */
  currentValue: string;
  /** Called when the user clicks Apply with the composed value. */
  onApply: (value: string) => void;
  /** Called when the popover should close (Cancel / Esc / Apply). */
  onClose: () => void;
  /** data-testid suffix (e.g. rowId) for stable test handles. */
  testIdSuffix: string;
  /**
   * Optional anchor rect — used for fixed positioning so the popover
   * is never clipped by overflow:hidden row boundaries or sticky columns.
   * When omitted falls back to absolute-below-anchor (legacy).
   */
  anchorRect?: DOMRect | null;
}

/**
 * BuildNameComposer — popover for building a campaign name from segments.
 * Fix 5 (P2): renders via React portal into document.body so it escapes
 * row overflow:hidden / sticky column clipping on laptops and 375px cards.
 * Position is anchored below the trigger button via fixed viewport coords.
 * All controls ≥44px. Works on mobile card view.
 */
export function BuildNameComposer({
  template,
  currentValue,
  onApply,
  onClose,
  testIdSuffix,
  anchorRect,
}: BuildNameComposerProps) {
  const { segments, separator } = template;

  // Pre-fill from the current value if segment count matches
  const existingParts = currentValue.split(separator);
  const canPrefill = existingParts.length === segments.length;

  const [tokens, setTokens] = useState<string[]>(() =>
    segments.map((_, i) => (canPrefill ? existingParts[i] : ""))
  );

  const composed = composeCampaignName(tokens, separator);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay so the open-button click doesn't immediately close the popover
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  const setToken = (idx: number, value: string) => {
    setTokens((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const handleApply = () => {
    onApply(composed);
    onClose();
  };

  // Compute fixed position from anchor rect for viewport-aware placement.
  // Prefers below the trigger; if not enough room, opens above.
  const [fixedStyle, setFixedStyle] = useState<React.CSSProperties>({});
  useEffect(() => {
    if (!anchorRect) return;
    const popoverH = 400; // estimated max height
    const popoverW = 288; // w-72
    const vpH = window.innerHeight;
    const vpW = window.innerWidth;

    let top = anchorRect.bottom + 4;
    let left = anchorRect.left;

    // If opens below would clip, open above
    if (top + popoverH > vpH - 8) {
      top = Math.max(8, anchorRect.top - popoverH - 4);
    }
    // Clamp horizontally so popover doesn't overflow viewport
    if (left + popoverW > vpW - 8) {
      left = Math.max(8, vpW - popoverW - 8);
    }

    setFixedStyle({
      position: "fixed",
      top,
      left,
      width: Math.min(popoverW, vpW - 16),
      zIndex: 9999,
    });
  }, [anchorRect]);

  const popoverContent = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Build campaign name"
      data-testid={`build-name-composer-${testIdSuffix}`}
      style={anchorRect ? fixedStyle : undefined}
      className={
        anchorRect
          ? "rounded-lg border border-teal-200 bg-white p-3 shadow-xl"
          : "absolute left-0 top-full z-40 mt-1 w-72 max-w-[calc(100vw-16px)] rounded-lg border border-teal-200 bg-white p-3 shadow-xl"
      }
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">Build campaign name</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close composer"
          className="text-gray-400 hover:text-gray-600 text-sm leading-none"
        >
          ×
        </button>
      </div>

      {segments.length === 0 ? (
        <p className="text-[11px] text-gray-400">
          No segments defined yet — add them in the Campaign Naming Template panel.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2 mb-3">
            {segments.map((seg, idx) => {
              const labelId = `build-name-seg-label-${testIdSuffix}-${idx}`;
              return (
                <div key={idx} className="flex flex-col gap-0.5">
                  <label
                    id={labelId}
                    className="text-[10px] font-semibold text-teal-700 uppercase tracking-wide"
                  >
                    {seg.name || `Segment ${idx + 1}`}
                  </label>
                  {seg.allowedTokens.length > 0 ? (
                    <select
                      aria-labelledby={labelId}
                      value={tokens[idx] ?? ""}
                      onChange={(e) => setToken(idx, e.target.value)}
                      data-testid={`build-name-seg-${idx}-${testIdSuffix}`}
                      className="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400 min-h-[44px]"
                    >
                      <option value="">— choose —</option>
                      {seg.allowedTokens.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      aria-labelledby={labelId}
                      value={tokens[idx] ?? ""}
                      onChange={(e) => setToken(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApply();
                      }}
                      data-testid={`build-name-seg-${idx}-${testIdSuffix}`}
                      placeholder={seg.name || `segment ${idx + 1}`}
                      className="rounded border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400 min-h-[44px]"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Live joined preview */}
          <div className="mb-3 rounded bg-teal-50 border border-teal-100 px-2 py-1.5">
            <span className="text-[10px] text-teal-600 uppercase tracking-wide font-semibold">Preview: </span>
            <span
              className="font-mono text-[11px] text-teal-800"
              data-testid={`build-name-preview-${testIdSuffix}`}
            >
              {composed || <span className="text-gray-400 italic">fill in the fields above</span>}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              data-testid={`build-name-apply-${testIdSuffix}`}
              onClick={handleApply}
              disabled={!composed}
              className="flex-1 min-h-[44px] rounded-md bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Fix 5: Portal to body for viewport-aware, never-clipped positioning.
  // Falls back to inline absolute when document.body not available (SSR).
  if (anchorRect && typeof document !== "undefined") {
    return createPortal(popoverContent, document.body);
  }

  return popoverContent;
}
