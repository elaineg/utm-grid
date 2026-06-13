"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UTM_FIELDS, type UtmField } from "../../lib/types";
import { parseAllowedValuePaste, type UtmSpec } from "../../lib/spec";

interface UtmSpecPanelProps {
  spec: UtmSpec;
  onChange: (next: UtmSpec) => void;
  /** Called when user clicks "Load sample spec" — parent handles dirty-guard + confirm. */
  onLoadSample?: () => void;
  /** Called when user clicks "Share this spec" — parent triggers the existing share-link flow. */
  onShareSpec?: () => void;
  /** True when the share-link was just copied (drives "Link copied!" cue). */
  specLinkCopied?: boolean;
  /** Render as mobile disclosure bar (collapsed by default). */
  mobileOnly?: boolean;
  /** Render as desktop panel only. */
  desktopOnly?: boolean;
}

const FIELD_LABELS: Record<UtmField, string> = {
  utm_source: "utm_source",
  utm_medium: "utm_medium",
  utm_campaign: "utm_campaign",
  utm_term: "utm_term",
  utm_content: "utm_content",
};

/** True when the spec has at least one allowed value defined. */
function specHasValues(spec: UtmSpec): boolean {
  return UTM_FIELDS.some((f) => spec.allowedValues[f].length > 0);
}

export function UtmSpecPanel({
  spec,
  onChange,
  onLoadSample,
  onShareSpec,
  specLinkCopied,
  mobileOnly,
  desktopOnly,
}: UtmSpecPanelProps) {
  // Fix C: open by default when spec has any allowed values; collapsed when empty so cold open stays clean.
  const [expanded, setExpanded] = useState(() => specHasValues(spec));
  // Per-field pending add-value input state
  const [addInputs, setAddInputs] = useState<Record<UtmField, string>>({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  });
  // Flash a chip green briefly on add
  const [flashChips, setFlashChips] = useState<Set<string>>(new Set());
  const flashTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Fix C: track whether we have previously opened for "has values" to avoid re-opening
  // when the user manually collapses. We open once on mount if values exist, and again
  // when the first value is added (handled in addValue by calling setExpanded(true)).
  // No useEffect needed — the lazy useState initializer handles the mount case.

  // Fix C: open via custom event from the "N cells off-spec" indicator in lint bar.
  const panelRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const handler = () => setExpanded(true);
    el.addEventListener("utm-spec-open", handler);
    return () => el.removeEventListener("utm-spec-open", handler);
  }, []);

  const setAddInput = (field: UtmField, value: string) => {
    setAddInputs((prev) => ({ ...prev, [field]: value }));
  };

  /** Flash one or more chip keys green for ~1.2s. */
  const flashChipKeys = useCallback((keys: string[]) => {
    setFlashChips((prev) => {
      const s = new Set(prev);
      for (const k of keys) s.add(k);
      return s;
    });
    for (const chipKey of keys) {
      const t = flashTimers.current.get(chipKey);
      if (t) clearTimeout(t);
      const timer = setTimeout(() => {
        setFlashChips((prev) => {
          const s = new Set(prev);
          s.delete(chipKey);
          return s;
        });
        flashTimers.current.delete(chipKey);
      }, 1200);
      flashTimers.current.set(chipKey, timer);
    }
  }, []);

  /**
   * Fix E: commit the pending add-input for a field.
   * Uses parseAllowedValuePaste to split on comma/newline, trim, dedupe.
   * Fix C: auto-opens the panel when the first value is added (opening once is not harmful).
   */
  const addValue = useCallback(
    (field: UtmField, raw: string) => {
      const existing = spec.allowedValues[field];
      const toAdd = parseAllowedValuePaste(raw, existing);
      if (toAdd.length === 0) {
        setAddInput(field, "");
        return;
      }
      const next: UtmSpec = {
        ...spec,
        allowedValues: {
          ...spec.allowedValues,
          [field]: [...existing, ...toAdd],
        },
      };
      onChange(next);
      setAddInput(field, "");
      flashChipKeys(toAdd.map((v) => `${field}:${v}`));
      // Fix C: ensure panel is open after adding the first value
      setExpanded(true);
    },
    [spec, onChange, flashChipKeys]
  );

  const removeValue = useCallback(
    (field: UtmField, value: string) => {
      const next: UtmSpec = {
        ...spec,
        allowedValues: {
          ...spec.allowedValues,
          [field]: spec.allowedValues[field].filter((v) => v !== value),
        },
      };
      onChange(next);
    },
    [spec, onChange]
  );

  // Fix D: no second Enforce toggle here — the canonical one is in the lint-rule group.
  // We show a read-only status line instead.
  const enforceStatusLine = (
    <div className="flex items-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-2.5 py-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${spec.enforceSpec ? "bg-violet-500" : "bg-gray-300"}`}
        aria-hidden="true"
      />
      <span className="text-xs font-medium text-violet-800">
        {spec.enforceSpec
          ? "Enforcing — change in Lint rules"
          : "Not enforcing — enable in Lint rules"}
      </span>
    </div>
  );

  /** True when the spec has zero allowed values across all fields. */
  const isEmpty = !specHasValues(spec);

  const innerContent = (
    <div className="flex flex-col gap-3">
      {/* Fix D: read-only status (enforcement controlled by canonical toggle in lint bar) */}
      {enforceStatusLine}

      {/* Rob Fix 3b: "Share this spec" — triggers the existing Copy share link flow.
          Labeled distinctly from the top-bar "Copy share link" so it reads as sharing
          the spec/grid, not a duplicate control. */}
      {onShareSpec && (
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            data-testid="share-this-spec-btn"
            onClick={onShareSpec}
            className={`flex w-full items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
              specLinkCopied
                ? "border-green-500 bg-green-500 text-white"
                : "border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100"
            }`}
          >
            {specLinkCopied ? (
              <>
                <span aria-hidden="true">✓</span>{" "}
                <span>Link copied!</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">⤴</span>{" "}
                <span>Share this spec with your team</span>
              </>
            )}
          </button>
          {/* Aria-live cue so mobile users hear the confirmation even when they glance away */}
          <span role="status" aria-live="polite" className="text-[10px] text-green-600 min-h-[1em] text-center">
            {specLinkCopied ? "Link copied!" : ""}
          </span>
        </div>
      )}

      {/* Rob Fix 3a: "Load sample spec" — only shown in the empty state, explicit/opt-in,
          never auto-clobbers. The actual dirty-guard confirm lives in the parent handler. */}
      {isEmpty && onLoadSample && (
        <div className="rounded-md border border-dashed border-violet-200 bg-violet-50/50 p-3 text-center">
          <p className="mb-2 text-[11px] text-gray-500">
            No allowed values yet — define your taxonomy to enforce it on every cell.
          </p>
          <button
            type="button"
            data-testid="load-sample-spec-btn"
            onClick={onLoadSample}
            className="rounded-md border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50"
          >
            Try an example spec
          </button>
          <p className="mt-1.5 text-[10px] text-gray-400">
            Loads sample values and an off-spec row so you can see the Fix-to magic in ~5s.
          </p>
        </div>
      )}

      {/* Per-field allowed-value rows */}
      {UTM_FIELDS.map((field) => {
        const values = spec.allowedValues[field];
        const inputId = `utm-spec-add-${field}`;
        return (
          <div key={field} className="flex flex-col gap-1">
            <label
              htmlFor={inputId}
              className="text-[11px] font-semibold text-gray-500 tracking-wide uppercase"
            >
              {FIELD_LABELS[field]}
            </label>
            {/* Chips */}
            {values.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic">any value</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {values.map((v) => {
                  const chipKey = `${field}:${v}`;
                  const isFlashing = flashChips.has(chipKey);
                  return (
                    <span
                      key={v}
                      className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors duration-300 max-w-[12rem] ${
                        isFlashing
                          ? "border-green-400 bg-green-100 text-green-800"
                          : "border-violet-200 bg-violet-50 text-violet-800"
                      }`}
                    >
                      <span className="truncate">{v}</span>
                      <button
                        type="button"
                        onClick={() => removeValue(field, v)}
                        aria-label={`Remove ${v} from ${field} allowed values`}
                        className="ml-0.5 text-violet-500 hover:text-red-600 leading-none font-bold"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            {/* Fix E: bulk-add input — accepts comma/newline paste */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <input
                  id={inputId}
                  type="text"
                  value={addInputs[field]}
                  onChange={(e) => setAddInput(field, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addValue(field, addInputs[field]);
                    }
                  }}
                  onPaste={(e) => {
                    // Fix E: on paste, grab the pasted text, split immediately, add all.
                    e.preventDefault();
                    const pasted = e.clipboardData.getData("text");
                    addValue(field, pasted);
                  }}
                  placeholder="+ add value"
                  aria-label={`Add allowed value for ${field}`}
                  data-testid={`spec-add-input-${field}`}
                  className="min-w-0 flex-1 rounded-md border border-gray-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-violet-400 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => addValue(field, addInputs[field])}
                  aria-label={`Add value to ${field}`}
                  className="rounded-md border border-gray-200 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100"
                >
                  Add
                </button>
              </div>
              {/* Fix E: hint selling the reuse payoff */}
              <p className="text-[10px] text-gray-400 leading-tight">
                Paste a list — define once, reuse every week, share it to your team.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (desktopOnly) {
    return (
      <aside
        ref={panelRef}
        className="w-64 shrink-0 rounded-lg border border-violet-100 bg-white p-3 mt-3"
        aria-label="UTM Spec panel"
        data-testid="utm-spec-panel"
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-800 mb-1"
          aria-expanded={expanded}
          data-testid="utm-spec-toggle"
        >
          <span>UTM Spec</span>
          <span className="text-gray-400 text-xs">{expanded ? "▲" : "▼"}</span>
        </button>
        {!expanded && (
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Your team&apos;s allowed values — enforced on every cell.{" "}
            Saved on this device.
          </p>
        )}
        {expanded && (
          <>
            <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
              Your team&apos;s allowed values — enforced on every cell.{" "}
              Saved on this device.
            </p>
            {innerContent}
          </>
        )}
      </aside>
    );
  }

  if (mobileOnly) {
    return (
      <>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-violet-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
          aria-expanded={expanded}
          data-testid="utm-spec-mobile-toggle"
        >
          <span>UTM Spec</span>
          <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
        </button>
        {expanded && (
          <div
            ref={panelRef as React.RefObject<HTMLDivElement>}
            className="rounded-b-lg border border-t-0 border-violet-100 bg-white p-4"
            data-testid="utm-spec-panel"
          >
            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
              Your team&apos;s allowed values — enforced on every cell.{" "}
              Saved on this device.
            </p>
            {innerContent}
          </div>
        )}
      </>
    );
  }

  // Default (standalone, not used currently)
  return null;
}
