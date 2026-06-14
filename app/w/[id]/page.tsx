"use client";

/**
 * /w/[id] — Team Workspace page.
 *
 * - Fetches GET /api/workspace/[id] in a useEffect (NEVER in a useState
 *   lazy initializer — SSR/hydration lesson).
 * - On success: mounts UtmGrid seeded from the server payload, in workspace
 *   mode (prefixed localStorage keys, onStateChange autosave).
 * - On 404: renders a clear "Workspace not found" state.
 * - Server is source-of-truth on load: we write the server payload into
 *   prefixed localStorage BEFORE mounting UtmGrid, so UtmGrid's
 *   useLocalStorage reads the server data on first snapshot.
 * - Workspace mode does NOT touch the default (utm-grid:*) localStorage keys.
 *
 * History & Attribution (Rung 2):
 * - "Editing as: [name]" control in the banner (localStorage per-device)
 * - History panel (below banner, above grid)
 * - Preview mode (read-only grid view)
 * - Non-destructive restore (PUT the chosen version's data back as current)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { UtmGrid } from "../../components/UtmGrid";
import { WorkspaceHistory, type HistoryVersion } from "../../components/WorkspaceHistory";
import { writeValue } from "../../../lib/useLocalStorage";
import type { WorkspacePayload } from "../../../lib/workspace";
import { writeClipboard } from "../../../lib/share";

type SyncStatus = "idle" | "saving" | "saved" | "error";

/** Relative time display e.g. "just now", "12s ago", "3m ago". */
function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const s = Math.floor(diffMs / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);

  // Resolve the async params (Next.js 15+ pattern)
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const [status, setStatus] = useState<"loading" | "found" | "not_found">("loading");
  const [payload, setPayload] = useState<WorkspacePayload | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [, setTick] = useState(0);
  const tickRef = useRef(0);

  // Editor name (managed by WorkspaceHistory component, hoisted here for autosave)
  const editorNameRef = useRef<string>("");
  const handleEditorChange = useCallback((name: string) => {
    editorNameRef.current = name;
  }, []);

  // Tick every 10s to update relative time display
  useEffect(() => {
    const timer = setInterval(() => {
      tickRef.current += 1;
      setTick((t) => t + 1);
    }, 10_000);
    return () => clearInterval(timer);
  }, []);

  // Copy workspace link state
  const [workspaceLinkCopied, setWorkspaceLinkCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mount the workspace link copied state on entry (if we just navigated from "Create shared workspace")
  // Check sessionStorage for a pending copy-on-load signal
  const didMountCopyCheck = useRef(false);

  // Debounced autosave
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPayloadRef = useRef<WorkspacePayload | null>(null);

  // P0-2: gate autosave — do NOT fire until server payload is fully hydrated into the grid.
  // Set to true AFTER writeValue seeds the prefixed localStorage keys and UtmGrid has mounted.
  const isHydratedRef = useRef(false);

  // Preview state: when non-null, show the payload read-only
  const [previewPayload, setPreviewPayload] = useState<WorkspacePayload | null>(null);
  const [previewVersion, setPreviewVersion] = useState<HistoryVersion | null>(null);
  const isPreviewing = previewPayload !== null;
  // Ref for preview status to avoid stale closure in handleStateChange
  const isPreviewingRef = useRef(false);
  useEffect(() => {
    isPreviewingRef.current = previewPayload !== null;
  }, [previewPayload]);

  // Track the latest version id (used to tag "current" in history list)
  const [latestVersionId, setLatestVersionId] = useState<number | null>(null);

  // Restore confirmation display — ref-stable, survives re-render
  const [restoreLabel, setRestoreLabel] = useState<string | null>(null);
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save-bump tick for History panel (incremented after each successful autosave)
  const [historyTick, setHistoryTick] = useState(0);

  // Fetch workspace on mount (after id is resolved)
  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setStatus("loading");

    async function fetchWorkspace() {
      try {
        const res = await fetch(`/api/workspace/${id}`);
        if (cancelled) return;

        if (res.status === 404) {
          setStatus("not_found");
          return;
        }

        if (!res.ok) {
          setStatus("not_found");
          return;
        }

        const json = (await res.json()) as { data: string };
        if (cancelled) return;

        const data = JSON.parse(json.data) as WorkspacePayload;

        // Server wins on load: write the server payload into the prefixed
        // localStorage keys BEFORE UtmGrid mounts, so useLocalStorage reads
        // the server data on first snapshot — not stale prior-visit data.
        //
        // IMPORTANT: key names must match exactly what UtmGrid computes via key(k):
        //   storageKeyPrefix + k  →  `ws:<id>:utm-grid:rows`  etc.
        // The prefix passed to UtmGrid is `ws:<id>:` and UtmGrid appends `utm-grid:rows`,
        // `utm-grid:lint-settings`, and `utm-grid:utm-spec` — so we must write those same
        // fully-qualified keys here.
        const wsPrefix = `ws:${id}:`;
        writeValue(`${wsPrefix}utm-grid:rows`, data.rows, data.rows, 0);
        writeValue(`${wsPrefix}utm-grid:lint-settings`, data.settings, data.settings, 0);
        writeValue(`${wsPrefix}utm-grid:utm-spec`, data.spec, data.spec, 0);

        // Mark hydrated BEFORE setStatus so the autosave guard is active when UtmGrid mounts.
        isHydratedRef.current = true;

        setPayload(data);
        latestPayloadRef.current = data;
        setStatus("found");
        setSyncStatus("idle");
        setSavedAt(Date.now());
      } catch {
        if (cancelled) return;
        setStatus("not_found");
      }
    }

    void fetchWorkspace();
    return () => { cancelled = true; };
  }, [id]);

  // Check for pending copy-on-load from "Create shared workspace" navigation
  useEffect(() => {
    if (!id) return;
    if (didMountCopyCheck.current) return;
    didMountCopyCheck.current = true;

    try {
      const key = `ws-copy-on-load:${id}`;
      const flag = sessionStorage.getItem(key);
      if (flag === "1") {
        sessionStorage.removeItem(key);
        // Copy the workspace link and show green confirmation
        const url = `${window.location.origin}/w/${id}`;
        void writeClipboard(url).catch(() => {});
        if (copyTimer.current) clearTimeout(copyTimer.current);
        setWorkspaceLinkCopied(true);
        copyTimer.current = setTimeout(() => {
          setWorkspaceLinkCopied(false);
          copyTimer.current = null;
        }, 2000);
      }
    } catch {
      // sessionStorage unavailable — ignore
    }
  }, [id]);

  // Perform the actual PUT save to server.
  // Called by both autosave debounce and immediate restore-save.
  const doSave = useCallback(
    async (toSave: WorkspacePayload, editorLabel: string | null): Promise<boolean> => {
      if (!id) return false;
      try {
        const payloadRaw = JSON.stringify(toSave);
        const body = JSON.stringify({ payload: payloadRaw, editor: editorLabel });
        const res = await fetch(`/api/workspace/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body,
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    [id]
  );

  // Autosave: debounced PUT to server.
  // P0-2 guard: only fires after server payload has been fully seeded into UtmGrid.
  const handleStateChange = useCallback(
    (next: WorkspacePayload) => {
      if (!id) return;
      if (!isHydratedRef.current) return;
      // Exit preview on any edit (read ref to avoid stale closure)
      if (isPreviewingRef.current) {
        setPreviewPayload(null);
        setPreviewVersion(null);
      }
      latestPayloadRef.current = next;

      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSyncStatus("saving");

      saveTimer.current = setTimeout(async () => {
        saveTimer.current = null;
        const toSave = latestPayloadRef.current;
        if (!toSave) return;

        const ok = await doSave(toSave, editorNameRef.current || null);
        if (ok) {
          setSyncStatus("saved");
          setSavedAt(Date.now());
          setHistoryTick((t) => t + 1);
        } else {
          setSyncStatus("error");
        }
      }, 800);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, doSave]
    // Note: previewPayload intentionally excluded to avoid re-creating debounce on every preview change
  );

  const retryAutosave = useCallback(() => {
    const toSave = latestPayloadRef.current;
    if (!toSave || !id) return;
    setSyncStatus("saving");
    void doSave(toSave, editorNameRef.current || null).then((ok) => {
      if (ok) {
        setSyncStatus("saved");
        setSavedAt(Date.now());
        setHistoryTick((t) => t + 1);
      } else {
        setSyncStatus("error");
      }
    });
  }, [id, doSave]);

  const copyWorkspaceLink = useCallback(async () => {
    if (!id) return;
    const url = `${window.location.origin}/w/${id}`;
    try {
      await writeClipboard(url);
    } catch {
      // execCommand fallback already tried inside writeClipboard
    }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setWorkspaceLinkCopied(true);
    copyTimer.current = setTimeout(() => {
      setWorkspaceLinkCopied(false);
      copyTimer.current = null;
    }, 1800);
  }, [id]);

  // ── Preview handler ────────────────────────────────────────────────────────
  const handleHistoryPreview = useCallback(
    (p: WorkspacePayload | null, v: HistoryVersion | null) => {
      if (p !== null && id) {
        // Seed the preview-prefixed localStorage keys with the version's data so
        // UtmGrid's useLocalStorage picks them up on first snapshot (same pattern
        // as handleRestore / initial workspace load). Without this, UtmGrid reads
        // empty/null for `preview:<id>:utm-grid:rows` and shows a blank starter row.
        const previewPrefix = `preview:${id}:`;
        writeValue(`${previewPrefix}utm-grid:rows`, p.rows, p.rows, 0);
        writeValue(`${previewPrefix}utm-grid:lint-settings`, p.settings, p.settings, 0);
        writeValue(`${previewPrefix}utm-grid:utm-spec`, p.spec, p.spec, 0);
      }
      setPreviewPayload(p);
      setPreviewVersion(v);
    },
    [id]
  );

  // ── Restore handler ────────────────────────────────────────────────────────
  const handleRestore = useCallback(
    async (restoredPayload: WorkspacePayload, label: string) => {
      if (!id || !isHydratedRef.current) return;

      // 1. Snapshot current state as a version FIRST (so it's not lost).
      //    The current working payload is already in latestPayloadRef.
      //    We fire a SAVE of the current state before writing the restored one.
      const currentPayload = latestPayloadRef.current;
      if (currentPayload) {
        setSyncStatus("saving");
        const snapshotOk = await doSave(currentPayload, editorNameRef.current || null);
        if (!snapshotOk) {
          // Non-fatal: continue anyway (the pre-restore state was last saved via autosave)
        }
      }

      // 2. Write the restored payload via the normal autosave PUT → appends a new version.
      setSyncStatus("saving");
      const ok = await doSave(restoredPayload, editorNameRef.current || null);

      if (ok) {
        // Update the UtmGrid with the restored payload
        const wsPrefix = `ws:${id}:`;
        writeValue(`${wsPrefix}utm-grid:rows`, restoredPayload.rows, restoredPayload.rows, 0);
        writeValue(`${wsPrefix}utm-grid:lint-settings`, restoredPayload.settings, restoredPayload.settings, 0);
        writeValue(`${wsPrefix}utm-grid:utm-spec`, restoredPayload.spec, restoredPayload.spec, 0);

        // Update local payload state → forces UtmGrid remount with new data
        latestPayloadRef.current = restoredPayload;
        setPayload(restoredPayload);

        setSyncStatus("saved");
        setSavedAt(Date.now());
        setHistoryTick((t) => t + 1);

        // Show "Restored …" confirmation (ref-stable timer)
        if (restoreTimer.current) clearTimeout(restoreTimer.current);
        setRestoreLabel(`Restored ${label} · all changes saved`);
        restoreTimer.current = setTimeout(() => {
          setRestoreLabel(null);
          restoreTimer.current = null;
        }, 3000);
      } else {
        setSyncStatus("error");
      }

      // Exit preview
      setPreviewPayload(null);
      setPreviewVersion(null);
    },
    [id, doSave]
  );

  // Sync status dot + text
  function renderSyncStatus() {
    // Show restore confirmation if present (takes priority)
    if (restoreLabel) {
      return (
        <span
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-1.5 text-xs text-green-700"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          {restoreLabel}
        </span>
      );
    }

    const editorDisplay = editorNameRef.current || "Anonymous";

    if (syncStatus === "saving") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-amber-700">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
          Saving…
        </span>
      );
    }
    if (syncStatus === "error") {
      return (
        <span
          role="alert"
          className="inline-flex items-center gap-1.5 text-xs text-red-700"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
          Couldn&apos;t save —{" "}
          <button
            type="button"
            onClick={retryAutosave}
            className="underline font-semibold hover:text-red-900"
          >
            Retry now
          </button>
        </span>
      );
    }
    if (syncStatus === "saved" && savedAt) {
      return (
        <span
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-1.5 text-xs text-green-700"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          last edited by {editorDisplay} · saved {relativeTime(savedAt)}
        </span>
      );
    }
    // idle after initial load
    if (savedAt) {
      return (
        <span
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-1.5 text-xs text-green-700"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          All changes saved · saved {relativeTime(savedAt)}
        </span>
      );
    }
    return null;
  }

  // Loading state
  if (status === "loading" || !id) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 p-6">
        <p role="status" aria-live="polite" className="text-sm text-gray-500">
          Loading workspace…
        </p>
      </main>
    );
  }

  // Not found state
  if (status === "not_found") {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 p-6 flex flex-col items-center justify-center gap-6 min-h-[50vh]">
        <div className="text-center max-w-md">
          <h1
            role="alert"
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            Workspace not found
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            This workspace link is invalid or was never created.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to the UTM grid builder →
          </Link>
        </div>
      </main>
    );
  }

  // Found state — render the workspace
  const storageKeyPrefix = `ws:${id}:`;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 p-6">
      {/* Team Workspace banner — in normal document flow, NEVER fixed/sticky.
          Pushes the grid DOWN. Full-width, cool-neutral strip.
          At 375px: stacks label+status on first line, full-width button beneath.
          aria-live="polite" announces state changes. */}
      <div
        role="status"
        aria-live="polite"
        data-testid="workspace-banner"
        className="mb-4 flex flex-col gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 w-full"
      >
        {/* Top row: title + copy button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-sm font-semibold text-blue-900">
              Team Workspace — synced
            </span>
            {renderSyncStatus()}
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
            <button
              type="button"
              data-testid="copy-workspace-link"
              aria-label="Copy workspace link"
              onClick={() => void copyWorkspaceLink()}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors duration-200 min-h-[44px] ${
                workspaceLinkCopied
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-blue-400 bg-white text-blue-700 hover:bg-blue-50"
              }`}
            >
              {workspaceLinkCopied ? (
                <span className="inline-flex items-center gap-1.5">
                  <span>✓</span>{" "}
                  <span>Workspace link copied!</span>
                </span>
              ) : (
                "Copy workspace link"
              )}
            </button>
            {/* Fix 2: permission note — anyone with the link can edit */}
            <span className="text-[10px] text-blue-600 text-right leading-tight">
              Anyone with this secret link can edit.
            </span>
            {/* aria-live region for screen readers on copy */}
            <span role="status" aria-live="polite" className="sr-only">
              {workspaceLinkCopied ? "Workspace link copied!" : ""}
            </span>
          </div>
        </div>

        {/* History & Editing-as row */}
        {id && (
          <WorkspaceHistory
            workspaceId={id}
            onRestore={(p, label) => void handleRestore(p, label)}
            onPreview={handleHistoryPreview}
            onEditorChange={handleEditorChange}
            tick={historyTick}
            latestVersionId={latestVersionId}
            isPreviewing={isPreviewing}
            previewVersion={previewVersion}
          />
        )}
      </div>

      {/* The UtmGrid editor, seeded from server payload, in workspace mode.
          Mounted ONLY after the server payload is ready (status === "found")
          so useLocalStorage reads the server-written values on first snapshot.
          storageKeyPrefix isolates workspace state from the user's default grid.
          In preview mode: UtmGrid is remounted with the preview payload and
          wrapped in a pointer-events-none overlay to prevent edits. */}
      {isPreviewing && previewPayload ? (
        <div
          aria-label="Read-only preview of a past version"
          className="relative"
        >
          {/* Invisible overlay to block all pointer interactions */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-50 cursor-not-allowed"
            style={{ pointerEvents: "all" }}
          />
          <div className="opacity-80 select-none">
            <UtmGrid
              key={`preview-${previewVersion?.id ?? "p"}`}
              storageKeyPrefix={`preview:${id}:`}
              initialWorkspace={previewPayload}
            />
          </div>
        </div>
      ) : (
        payload && (
          <UtmGrid
            key="live"
            storageKeyPrefix={storageKeyPrefix}
            initialWorkspace={payload}
            onStateChange={handleStateChange}
          />
        )
      )}
    </main>
  );
}
