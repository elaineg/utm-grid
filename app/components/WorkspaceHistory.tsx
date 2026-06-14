"use client";

/**
 * WorkspaceHistory — History panel for /w/[id] pages only.
 *
 * Renders:
 * - "Editing as: <name>" control (in-banner, localStorage per-device)
 * - "History (N)" toggle button (in-banner)
 * - History panel (in-flow below banner, above grid)
 * - Preview ribbon (in-flow, replaces banner sync-status while previewing)
 * - Restore confirmation via native confirm()
 *
 * CRITICAL SSR rule: localStorage is read INSIDE useEffect only, never in
 * useState lazy initializer.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkspacePayload } from "../../lib/workspace";
import { relativeTimeFromMs } from "../../lib/workspaceHistory";

const EDITOR_KEY = "utm-grid:editor-name";

export interface HistoryVersion {
  id: number;
  editor: string | null;
  created_at: number;
  data: string;
}

export interface WorkspaceHistoryProps {
  workspaceId: string;
  /** Called when user restores a version — caller updates the grid */
  onRestore: (payload: WorkspacePayload, label: string) => void;
  /** Called when user enters/exits Preview mode — null = exit preview */
  onPreview: (payload: WorkspacePayload | null, version: HistoryVersion | null) => void;
  /** Called when editor name changes */
  onEditorChange: (name: string) => void;
  /** Tick (counter) to refresh history after saves — caller bumps on each save */
  tick: number;
  /** Latest version id in history (used to tag "current") */
  latestVersionId: number | null;
  /** Whether currently in preview mode */
  isPreviewing: boolean;
  /** The version being previewed (if any) */
  previewVersion: HistoryVersion | null;
}

/** Relative time label for a version */
function versionTime(ts: number): string {
  return relativeTimeFromMs(ts);
}

/** Display label: "by Alex" or "by Anonymous" */
function byLabel(editor: string | null): string {
  return `by ${editor ?? "Anonymous"}`;
}

export function WorkspaceHistory({
  workspaceId,
  onRestore,
  onPreview,
  onEditorChange,
  tick,
  latestVersionId,
  isPreviewing,
  previewVersion,
}: WorkspaceHistoryProps) {
  // ── Editor name (localStorage, SSR-safe) ───────────────────────────────────
  // Init to "" (SSR-safe), read localStorage in useEffect.
  const [editorName, setEditorName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Mount: read editor name from localStorage DIRECTLY (not via closured state).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(EDITOR_KEY);
      const val = stored !== null ? (JSON.parse(stored) as string) : "";
      const name = typeof val === "string" ? val.trim() : "";
      if (name) {
        setEditorName(name);
        onEditorChange(name);
      }
    } catch {
      // localStorage unavailable
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only

  const commitName = useCallback(
    (raw: string) => {
      const trimmed = raw.trim().slice(0, 80);
      const final = trimmed || "";
      setEditorName(final);
      setIsEditingName(false);
      try {
        window.localStorage.setItem(EDITOR_KEY, JSON.stringify(final));
      } catch { /* unavailable */ }
      onEditorChange(final);
    },
    [onEditorChange]
  );

  const startEditName = useCallback(() => {
    setNameInput(editorName);
    setIsEditingName(true);
    // Focus after render
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, [editorName]);

  // ── History panel state ────────────────────────────────────────────────────
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<HistoryVersion[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Re-fetch history whenever the panel opens or after a restore/save (tick changes)
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch(`/api/workspace/${workspaceId}/history`);
      if (!res.ok) {
        setHistoryError("Couldn't load history.");
        return;
      }
      const data = (await res.json()) as HistoryVersion[];
      setVersions(data);
    } catch {
      setHistoryError("Couldn't load history.");
    } finally {
      setHistoryLoading(false);
    }
  }, [workspaceId]);

  // Fetch when panel opens
  useEffect(() => {
    if (historyOpen) {
      void fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyOpen]);

  // Re-fetch after a save (tick changes) while panel is open
  const prevTickRef = useRef(tick);
  useEffect(() => {
    if (prevTickRef.current !== tick) {
      prevTickRef.current = tick;
      if (historyOpen) {
        void fetchHistory();
      }
    }
  }, [tick, historyOpen, fetchHistory]);

  // ── Preview ────────────────────────────────────────────────────────────────
  const handlePreview = useCallback(
    (v: HistoryVersion) => {
      try {
        const p = JSON.parse(v.data) as WorkspacePayload;
        onPreview(p, v);
      } catch {
        // corrupt data — ignore
      }
    },
    [onPreview]
  );

  const handleExitPreview = useCallback(() => {
    onPreview(null, null);
  }, [onPreview]);

  // ── Restore ────────────────────────────────────────────────────────────────
  const handleRestore = useCallback(
    (v: HistoryVersion) => {
      const timeLabel = versionTime(v.created_at);
      const editorLabel = v.editor ?? "Anonymous";
      const confirmed = window.confirm(
        `Restore the version from ${timeLabel} (${byLabel(v.editor)})? It becomes the current grid for everyone on this link. Your current version is saved in history first, so nothing is lost.`
      );
      if (!confirmed) return;
      try {
        const p = JSON.parse(v.data) as WorkspacePayload;
        onRestore(p, `version from ${timeLabel} (by ${editorLabel})`);
        // Exit preview if we were previewing
        if (isPreviewing) onPreview(null, null);
        // Refresh history after restore (will be triggered by tick bump from parent)
      } catch {
        // corrupt data — ignore
      }
    },
    [onRestore, onPreview, isPreviewing]
  );

  // ── Restore confirmation state ─────────────────────────────────────────────
  // Exposed via ref-stable state for the banner to render "Restored …"
  // (handled in the page component via restoreLabel prop)

  const displayName = editorName || "Anonymous";

  return (
    <>
      {/* ── Banner row: Editing as + History button ─────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mt-1">
        {/* "Editing as" control */}
        <span className="flex items-center gap-1 text-xs text-blue-700">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={nameInput}
              maxLength={80}
              placeholder="Your name"
              aria-label="Your display name for this workspace"
              className="rounded border border-blue-300 bg-white px-2 py-1 text-xs text-blue-900 min-w-0 w-32 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitName(nameInput);
                if (e.key === "Escape") setIsEditingName(false);
              }}
              onBlur={() => commitName(nameInput)}
            />
          ) : (
            <button
              type="button"
              aria-label={`Editing as: ${displayName}. Click to change.`}
              onClick={startEditName}
              className="inline-flex items-center gap-1 rounded border border-transparent px-1 py-0.5 hover:border-blue-200 hover:bg-blue-100 transition-colors text-xs text-blue-700 min-h-[44px]"
            >
              <span aria-hidden="true">✏️</span>{" "}
              <span>
                Editing as:{" "}
                <span className="font-semibold">{displayName}</span>
              </span>
            </button>
          )}
        </span>

        {/* History toggle */}
        <button
          type="button"
          data-testid="history-toggle"
          aria-expanded={historyOpen}
          aria-controls="workspace-history-panel"
          onClick={() => setHistoryOpen((o) => !o)}
          className="inline-flex items-center gap-1 rounded border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors min-h-[44px]"
        >
          <span aria-hidden="true">🕐</span>{" "}
          <span>
            History{versions.length > 0 ? ` (${versions.length})` : ""}
          </span>
        </button>
      </div>

      {/* ── Preview ribbon ─────────────────────────────────────────────────── */}
      {isPreviewing && previewVersion && (
        <div
          role="status"
          aria-live="polite"
          data-testid="preview-ribbon"
          className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 w-full"
        >
          <span className="text-sm font-medium text-amber-800">
            Previewing version from{" "}
            {versionTime(previewVersion.created_at)}{" "}
            ({byLabel(previewVersion.editor)}) — read-only
          </span>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              data-testid="preview-restore-btn"
              onClick={() => handleRestore(previewVersion)}
              className="rounded-md border border-amber-400 bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200 min-h-[44px]"
            >
              Restore this version
            </button>
            <button
              type="button"
              data-testid="preview-back-btn"
              onClick={handleExitPreview}
              className="rounded-md border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 min-h-[44px]"
            >
              Back to current
            </button>
          </div>
        </div>
      )}

      {/* ── History panel ──────────────────────────────────────────────────── */}
      {historyOpen && (
        <div
          id="workspace-history-panel"
          data-testid="history-panel"
          role="region"
          aria-label="Version history"
          className="mt-3 rounded-lg border border-blue-200 bg-white w-full"
        >
          {/* Panel header */}
          <div className="border-b border-blue-100 px-4 py-3">
            <p className="text-sm font-semibold text-blue-900">
              Version history
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              Every save is kept. Restoring brings a version back without
              losing the current one.
            </p>
          </div>

          {/* Version list */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "320px" }}
          >
            {historyLoading && (
              <p className="px-4 py-3 text-xs text-gray-500">
                Loading history…
              </p>
            )}
            {historyError && (
              <p role="alert" className="px-4 py-3 text-xs text-red-600">
                {historyError}
              </p>
            )}
            {!historyLoading && !historyError && versions.length === 0 && (
              <p className="px-4 py-3 text-xs text-gray-500">
                This is the first version — edits you save will appear here.
              </p>
            )}
            {!historyLoading && !historyError && versions.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {versions.map((v, idx) => {
                  const isCurrent = v.id === latestVersionId || idx === 0;
                  const isBeingPreviewed =
                    isPreviewing && previewVersion?.id === v.id;
                  return (
                    <li
                      key={v.id}
                      data-testid={`history-entry-${v.id}`}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 ${
                        isCurrent ? "border-l-4 border-blue-400 bg-blue-50" : ""
                      } ${isBeingPreviewed ? "bg-amber-50" : ""}`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-xs font-semibold text-gray-900">
                          {versionTime(v.created_at)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {byLabel(v.editor)}
                          {isCurrent && idx === 0 && (
                            <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                              current
                            </span>
                          )}
                        </span>
                      </div>
                      {/* Actions — always visible, never hover-gated */}
                      {!(isCurrent && idx === 0) && (
                        <div className="flex gap-2 flex-wrap shrink-0">
                          <button
                            type="button"
                            data-testid={`preview-version-${v.id}`}
                            onClick={() => handlePreview(v)}
                            className={`rounded-md border px-3 py-1.5 text-xs font-medium min-h-[44px] transition-colors ${
                              isBeingPreviewed
                                ? "border-amber-400 bg-amber-100 text-amber-800"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            data-testid={`restore-version-${v.id}`}
                            onClick={() => handleRestore(v)}
                            className="rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 min-h-[44px]"
                          >
                            Restore this version
                          </button>
                        </div>
                      )}
                      {isCurrent && idx === 0 && (
                        <span className="text-xs text-blue-500 shrink-0">
                          (current)
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
