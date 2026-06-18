"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_NAMING_TEMPLATE,
  previewPattern,
  type NamingSegment,
  type NamingTemplate,
} from "../../lib/namingTemplate";

interface NamingTemplatePanelProps {
  template: NamingTemplate;
  onChange: (next: NamingTemplate) => void;
  /** Render only for mobile disclosure bar (<900px). */
  mobileOnly?: boolean;
  /** Render only for desktop sidebar (≥900px). */
  desktopOnly?: boolean;
  /** enforceTemplate toggle is canonical — controlled externally via this prop. */
  enforceTemplate: boolean;
  onEnforceTemplateChange: (next: boolean) => void;
}

export function NamingTemplatePanel({
  template,
  onChange,
  mobileOnly,
  desktopOnly,
  enforceTemplate,
  onEnforceTemplateChange,
}: NamingTemplatePanelProps) {
  // Always start collapsed — consistent with Campaigns and UTM Spec panels.
  // Panel auto-expands only on explicit user actions:
  //   • addSegment() calls setExpanded(true) inline
  //   • the "naming-template-open" custom event from the lint-bar (below)
  // We do NOT auto-expand on hydration from localStorage: a returning user who stored
  // segments should still see all three setup panels collapsed on load so the grid
  // is the first thing they see. They can open the panel if they want to edit it.
  const [expanded, setExpanded] = useState(false);

  // Custom event: open via lint-bar "N off-template" indicator
  const panelRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const handler = () => setExpanded(true);
    el.addEventListener("naming-template-open", handler);
    return () => el.removeEventListener("naming-template-open", handler);
  }, []);

  // Flash state for chips
  const [flashChips, setFlashChips] = useState<Set<string>>(new Set());
  const flashTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const flashChipKeys = useCallback((keys: string[]) => {
    setFlashChips((prev) => {
      const s = new Set(prev);
      for (const k of keys) s.add(k);
      return s;
    });
    for (const chipKey of keys) {
      const prev = flashTimers.current.get(chipKey);
      if (prev) clearTimeout(prev);
      const t = setTimeout(() => {
        setFlashChips((p) => {
          const s = new Set(p);
          s.delete(chipKey);
          return s;
        });
        flashTimers.current.delete(chipKey);
      }, 1200);
      flashTimers.current.set(chipKey, t);
    }
  }, []);

  // Per-segment token add inputs
  const [tokenInputs, setTokenInputs] = useState<string[]>(() =>
    template.segments.map(() => "")
  );
  // Segment name edit state (inline)
  const [segmentNames, setSegmentNames] = useState<string[]>(() =>
    template.segments.map((s) => s.name)
  );

  // Keep local name/token inputs in sync when segments change externally
  useEffect(() => {
    setSegmentNames(template.segments.map((s) => s.name));
    setTokenInputs(template.segments.map(() => ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.segments.length]);

  const updateSegmentName = (idx: number, name: string) => {
    const next = template.segments.map((s, i) =>
      i === idx ? { ...s, name } : s
    );
    onChange({ ...template, segments: next });
    setSegmentNames((prev) => {
      const arr = [...prev];
      arr[idx] = name;
      return arr;
    });
  };

  const addToken = (segIdx: number, raw: string) => {
    const parts = raw.split(/[,\n]+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) {
      setTokenInputs((prev) => {
        const arr = [...prev];
        arr[segIdx] = "";
        return arr;
      });
      return;
    }
    const existing = new Set(
      template.segments[segIdx].allowedTokens.map((t) => t.toLowerCase())
    );
    const toAdd: string[] = [];
    for (const p of parts) {
      if (!existing.has(p.toLowerCase())) {
        existing.add(p.toLowerCase());
        toAdd.push(p);
      }
    }
    if (toAdd.length === 0) {
      setTokenInputs((prev) => {
        const arr = [...prev];
        arr[segIdx] = "";
        return arr;
      });
      return;
    }
    const nextSegments = template.segments.map((s, i) =>
      i === segIdx
        ? { ...s, allowedTokens: [...s.allowedTokens, ...toAdd] }
        : s
    );
    onChange({ ...template, segments: nextSegments });
    setTokenInputs((prev) => {
      const arr = [...prev];
      arr[segIdx] = "";
      return arr;
    });
    flashChipKeys(toAdd.map((t) => `${segIdx}:${t}`));
  };

  const removeToken = (segIdx: number, token: string) => {
    const nextSegments = template.segments.map((s, i) =>
      i === segIdx
        ? { ...s, allowedTokens: s.allowedTokens.filter((t) => t !== token) }
        : s
    );
    onChange({ ...template, segments: nextSegments });
  };

  const addSegment = () => {
    const nextSegments: NamingSegment[] = [
      ...template.segments,
      { name: "", allowedTokens: [] },
    ];
    onChange({ ...template, segments: nextSegments });
    setSegmentNames((prev) => [...prev, ""]);
    setTokenInputs((prev) => [...prev, ""]);
    setExpanded(true);
  };

  const removeSegment = (idx: number) => {
    const nextSegments = template.segments.filter((_, i) => i !== idx);
    onChange({ ...template, segments: nextSegments });
    setSegmentNames((prev) => prev.filter((_, i) => i !== idx));
    setTokenInputs((prev) => prev.filter((_, i) => i !== idx));
  };

  const pattern = previewPattern(template);
  const isEmpty = template.segments.length === 0;

  // ── Shared inner content ──────────────────────────────────────────────────

  const innerContent = (
    <div className="flex flex-col gap-3">
      {/* Enforce toggle + status */}
      <div className="flex flex-col gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-2.5 py-2">
        <label className="flex items-center gap-2 text-xs font-medium text-teal-800 cursor-pointer">
          <input
            type="checkbox"
            data-testid="enforce-template-toggle-panel"
            checked={enforceTemplate}
            onChange={(e) => onEnforceTemplateChange(e.target.checked)}
          />
          Enforce naming template
        </label>
        <p className="text-[10px] text-teal-700 leading-tight">
          {enforceTemplate
            ? "On — utm_campaign values that don't match this structure will be flagged."
            : isEmpty
            ? (
              <>Not enforcing — <button type="button" onClick={() => setExpanded(true)} className="underline font-medium">define structure below ↓</button> first.</>
            )
            : "Off — no off-template warnings."}
        </p>
      </div>

      {/* Separator + live preview */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-gray-500 tracking-wide uppercase">
          Join parts with
        </label>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-gray-200 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => onChange({ ...template, separator: "_" })}
              className={`px-3 py-1 font-mono ${
                template.separator === "_"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              aria-pressed={template.separator === "_"}
            >
              _
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...template, separator: "-" })}
              className={`px-3 py-1 font-mono border-l border-gray-200 ${
                template.separator === "-"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              aria-pressed={template.separator === "-"}
            >
              -
            </button>
          </div>
          {pattern && (
            <span className="font-mono text-[11px] text-teal-700 bg-teal-50 border border-teal-200 rounded px-2 py-0.5 truncate max-w-[160px]" title={pattern}>
              {pattern}
            </span>
          )}
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="rounded-md border border-dashed border-teal-200 bg-teal-50/50 p-3 text-center">
          <p className="text-[11px] text-gray-500">
            No naming template yet — add segments (e.g. quarter, channel, audience) to build consistent campaign names and flag ones that don&apos;t match.
          </p>
        </div>
      )}

      {/* Segment rows */}
      {template.segments.map((seg, idx) => {
        const idSuffix = desktopOnly ? "desktop" : mobileOnly ? "mobile" : "solo";
        const inputId = `naming-seg-name-${idx}-${idSuffix}`;
        const tokenInputId = `naming-seg-tokens-${idx}-${idSuffix}`;
        return (
          <div
            key={idx}
            className="flex flex-col gap-1.5 rounded-md border border-gray-100 bg-gray-50 p-2.5"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-teal-600 w-4 text-center shrink-0">
                {idx + 1}
              </span>
              <input
                id={inputId}
                type="text"
                value={segmentNames[idx] ?? seg.name}
                onChange={(e) => updateSegmentName(idx, e.target.value)}
                placeholder="segment name (e.g. quarter)"
                aria-label={`Segment ${idx + 1} name`}
                data-testid={`naming-seg-name-${idx}-${idSuffix}`}
                className="min-w-0 flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => removeSegment(idx)}
                aria-label={`Remove segment ${idx + 1}`}
                className="text-gray-400 hover:text-red-500 text-sm font-bold leading-none px-1"
              >
                ×
              </button>
            </div>
            {/* Allowed tokens for this segment */}
            <div className="ml-5">
              {seg.allowedTokens.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic">any text</p>
              ) : (
                <div className="flex flex-wrap gap-1 mb-1">
                  {seg.allowedTokens.map((t) => {
                    const chipKey = `${idx}:${t}`;
                    const isFlashing = flashChips.has(chipKey);
                    return (
                      <span
                        key={t}
                        className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors duration-300 ${
                          isFlashing
                            ? "border-green-400 bg-green-100 text-green-800"
                            : "border-teal-200 bg-teal-50 text-teal-800"
                        }`}
                      >
                        <span className="truncate max-w-[8rem]">{t}</span>
                        <button
                          type="button"
                          onClick={() => removeToken(idx, t)}
                          aria-label={`Remove token "${t}" from segment ${idx + 1}`}
                          className="ml-0.5 text-teal-500 hover:text-red-600 leading-none font-bold"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="flex items-center gap-1">
                <input
                  id={tokenInputId}
                  type="text"
                  value={tokenInputs[idx] ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTokenInputs((prev) => {
                      const arr = [...prev];
                      arr[idx] = val;
                      return arr;
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addToken(idx, tokenInputs[idx] ?? "");
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData("text");
                    addToken(idx, pasted);
                  }}
                  placeholder="+ add token (optional)"
                  aria-label={`Add allowed token for segment ${idx + 1}`}
                  data-testid={`naming-seg-tokens-${idx}-${idSuffix}`}
                  className="min-w-0 flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-teal-400 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => addToken(idx, tokenInputs[idx] ?? "")}
                  aria-label={`Add token to segment ${idx + 1}`}
                  className="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* + Add segment */}
      <button
        type="button"
        data-testid="add-naming-segment-btn"
        onClick={addSegment}
        className="flex items-center gap-1.5 rounded-md border border-dashed border-teal-300 bg-teal-50 px-3 py-2 text-xs font-medium text-teal-700 hover:bg-teal-100 transition-colors"
      >
        <span>+</span>
        <span>Add segment</span>
      </button>
    </div>
  );

  // ── Shared panel header ───────────────────────────────────────────────────
  const panelHeader = (testId: string) => (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className="flex w-full items-start justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50"
      aria-expanded={expanded}
      data-testid={testId}
    >
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-gray-800 leading-tight">
          Campaign Naming Template
        </span>
        <span
          className="block text-[10px] text-gray-400 leading-snug mt-0.5"
          data-testid="naming-template-subtitle"
        >
          Build consistent campaign names — define parts like quarter_channel_audience
        </span>
      </span>
      <span className="text-gray-400 text-xs shrink-0 mt-0.5">{expanded ? "▲" : "▼"}</span>
    </button>
  );

  // ── Panel description ─────────────────────────────────────────────────────
  const panelDescription = (
    <p className="text-[11px] text-gray-500 mb-2 leading-relaxed">
      Add named parts (e.g. quarter, channel, audience) and they join into a campaign name like{" "}
      <span className="font-mono text-teal-700">quarter_channel_audience</span>.{" "}
      Turn on enforce to flag any row that doesn&apos;t match the shape.{" "}
      <span className="font-medium text-teal-700">Different from Allowed Values — that panel sets the list of valid values, this one sets the shape.</span>{" "}
      Saved on this device.
    </p>
  );

  // ── Desktop variant ────────────────────────────────────────────────────────

  if (desktopOnly) {
    return (
      <aside
        ref={panelRef}
        className="flex flex-col w-full rounded-lg border border-gray-200 bg-white"
        aria-label="Campaign Naming Template panel"
        data-testid="naming-template-panel"
      >
        {panelHeader("naming-template-toggle")}
        {expanded && (
          <div className="border-t border-gray-100 p-4">
            {panelDescription}
            {innerContent}
          </div>
        )}
      </aside>
    );
  }

  // ── Mobile variant ─────────────────────────────────────────────────────────

  if (mobileOnly) {
    return (
      <>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
          aria-expanded={expanded}
          data-testid="naming-template-mobile-toggle"
        >
          <span>
            Campaign Naming Template{" "}
            <span className="font-normal text-gray-400 text-xs" data-testid="naming-template-subtitle">— define parts like quarter_channel_audience</span>
          </span>
          <span className="text-gray-400 shrink-0">{expanded ? "▲" : "▼"}</span>
        </button>
        {expanded && (
          <div
            ref={panelRef as React.RefObject<HTMLDivElement>}
            className="rounded-b-lg border border-t-0 border-gray-200 bg-white p-4"
            data-testid="naming-template-panel"
          >
            {panelDescription}
            {innerContent}
          </div>
        )}
      </>
    );
  }

  return null;
}

// ── NamingTemplatePanel re-export DEFAULT ────────────────────────────────────

export { DEFAULT_NAMING_TEMPLATE };
