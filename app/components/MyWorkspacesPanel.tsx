"use client";

/**
 * My Workspaces panel — device-local index of every Team Workspace this browser
 * has CREATED or OPENED.
 *
 * FIX C-1 (My Workspaces Round 3): SINGLE responsive instance — ONE mounted
 * component that adapts via CSS (Tailwind responsive classes). NO JavaScript
 * viewport detection / window.matchMedia in render. Result: exactly ONE
 * "My Workspaces" heading and ONE search input in the DOM at all times.
 *
 * FIX F (My Workspaces Round 3): clicking the workspace NAME itself enters
 * inline rename. The Open button is visually distinct (labeled "Open") so
 * name-click = rename, Open button = navigate, are unambiguous.
 *
 * 100% localStorage, zero network, no accounts.
 *
 * SSR rules:
 * - Never read localStorage in useState initializer or render path.
 * - All localStorage reads happen in useEffect.
 * - useSyncExternalStore is used so the list re-renders on cross-tab storage events.
 *
 * copy-confirmation-survives-tick-rerender (LESSON):
 * - copyTimers is a ref-map (not state) so the green "Copied!" cue persists
 *   through list re-renders driven by the tick timer.
 */

import { useCallback, useEffect, useRef, useSyncExternalStore, useState } from "react";
import {
  MY_WORKSPACES_KEY,
  deserializeMyWorkspaces,
  filterMyWorkspaces,
  removeMyWorkspace,
  renameMyWorkspace,
  resolveEntryDisplayName,
  writeMyWorkspacesToStorage,
  type MyWorkspaceEntry,
} from "../../lib/myWorkspaces";
import { writeClipboard } from "../../lib/share";

// ── localStorage store wired to useSyncExternalStore ─────────────────────────

type Listener = () => void;
const listeners = new Set<Listener>();

// Stable server snapshot: a module-level frozen empty array so the server and
// first client render always return the SAME reference (no new [] each call).
const EMPTY_ENTRIES: MyWorkspaceEntry[] = [] as MyWorkspaceEntry[];
Object.freeze(EMPTY_ENTRIES);

// Cached-snapshot for the client getSnapshot: useSyncExternalStore uses reference
// equality to decide whether to re-render. If getSnapshot returns a NEW array on
// every call (even when localStorage hasn't changed), React sees a "changed" value
// on every render → infinite loop → React error #185.
// Fix: cache the last raw string and only re-parse when it changes.
let _lastRaw: string | null = undefined as unknown as string | null;
let _lastParsed: MyWorkspaceEntry[] = EMPTY_ENTRIES;

function getClientSnapshot(): MyWorkspaceEntry[] {
  try {
    const raw = window.localStorage.getItem(MY_WORKSPACES_KEY);
    if (raw === _lastRaw) return _lastParsed;
    _lastRaw = raw;
    _lastParsed = deserializeMyWorkspaces(raw);
    return _lastParsed;
  } catch {
    return EMPTY_ENTRIES;
  }
}

function subscribeMyWorkspaces(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === MY_WORKSPACES_KEY) listener();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function notifyMyWorkspacesListeners() {
  listeners.forEach((l) => l());
}

/** Write to localStorage and notify in-process subscribers. */
function persistAndNotify(entries: MyWorkspaceEntry[]) {
  writeMyWorkspacesToStorage(entries);
  notifyMyWorkspacesListeners();
}

// ── Relative time display ─────────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const s = Math.floor(diffMs / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MyWorkspacesPanel() {
  // ── SSR-safe localStorage subscription ──────────────────────────────────────
  // Server snapshot: empty array (safe, no localStorage on server).
  // Client snapshot: read from localStorage on first render.
  const entries = useSyncExternalStore(
    subscribeMyWorkspaces,
    getClientSnapshot,
    () => EMPTY_ENTRIES
  );

  // ── Relative-time tick (every 10s) ──────────────────────────────────────────
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 10_000);
    return () => clearInterval(t);
  }, []);

  // ── Search / filter ──────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");

  // ── "Show all" expander ──────────────────────────────────────────────────────
  const PREVIEW_COUNT = 3;
  const [showAll, setShowAll] = useState(false);

  // ── Rename state — one entry at a time ───────────────────────────────────────
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const startRename = useCallback((entry: MyWorkspaceEntry) => {
    setRenamingId(entry.id);
    // Pre-fill with the current user-given name if set, else the display label
    setRenameValue(entry.name ?? entry.label);
    // Focus the input after it renders
    setTimeout(() => renameInputRef.current?.focus(), 0);
  }, []);

  const commitRename = useCallback((id: string, value: string) => {
    setRenamingId(null);
    const current = (() => {
      try {
        return deserializeMyWorkspaces(window.localStorage.getItem(MY_WORKSPACES_KEY));
      } catch {
        return [] as MyWorkspaceEntry[];
      }
    })();
    persistAndNotify(renameMyWorkspace(current, id, value));
  }, []);

  const cancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameValue("");
  }, []);

  // ── Copy link state — ref-map so the green cue survives tick re-renders ──────
  // Map<workspaceId, boolean>
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());
  // Ref-stable timers (per-entry) — not cleared on re-render
  const copyTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const handleCopyLink = useCallback(
    async (entry: MyWorkspaceEntry) => {
      try {
        await writeClipboard(entry.link);
      } catch {
        // execCommand fallback already tried inside writeClipboard
      }
      // Mark copied (ref-stable timer — survives re-renders)
      const existing = copyTimers.current.get(entry.id);
      if (existing) clearTimeout(existing);
      setCopiedIds((prev) => new Set(prev).add(entry.id));
      const timer = setTimeout(() => {
        setCopiedIds((prev) => {
          const next = new Set(prev);
          next.delete(entry.id);
          return next;
        });
        copyTimers.current.delete(entry.id);
      }, 1800);
      copyTimers.current.set(entry.id, timer);
    },
    []
  );

  // ── Remove from list ─────────────────────────────────────────────────────────
  const handleRemove = useCallback((entry: MyWorkspaceEntry) => {
    const displayName = resolveEntryDisplayName(entry);
    const confirmed = window.confirm(
      `Remove "${displayName}" from this list? This only removes it from THIS device — the workspace and its link still work.`
    );
    if (!confirmed) return;
    const current = (() => {
      try {
        return deserializeMyWorkspaces(window.localStorage.getItem(MY_WORKSPACES_KEY));
      } catch {
        return [] as MyWorkspaceEntry[];
      }
    })();
    persistAndNotify(removeMyWorkspace(current, entry.id));
  }, []);

  // ── Visible entries ──────────────────────────────────────────────────────────
  const filtered = filterMyWorkspaces(entries, query);
  const count = entries.length;

  // ── Render one entry card ─────────────────────────────────────────────────────
  function renderEntry(entry: MyWorkspaceEntry) {
    const isCopied = copiedIds.has(entry.id);
    const isRenaming = renamingId === entry.id;
    const displayName = resolveEntryDisplayName(entry);

    return (
      <div
        key={entry.id}
        className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2.5 flex flex-col gap-1.5"
      >
        {/* Label + badges row */}
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          {isRenaming ? (
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              maxLength={120}
              aria-label="Rename workspace"
              data-testid={`rename-input-${entry.id}`}
              className="flex-1 min-w-0 rounded border border-blue-300 bg-white px-2 py-1 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename(entry.id, renameValue);
                if (e.key === "Escape") cancelRename();
              }}
              onBlur={() => commitRename(entry.id, renameValue)}
            />
          ) : (
            /* FIX F: clicking the workspace NAME itself enters inline rename.
               The "Open" button is a distinct action below so name-click = rename
               and Open = navigate are unambiguous. */
            <button
              type="button"
              onClick={() => startRename(entry)}
              aria-label={`Rename workspace: ${displayName}. Click to rename, or use the Open button to navigate.`}
              title="Click to rename"
              className="font-semibold text-sm text-gray-900 truncate hover:text-blue-700 text-left min-w-0 underline-offset-2 hover:underline cursor-text"
            >
              {displayName}
            </button>
          )}
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none ${
              entry.role === "owner"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-200 text-gray-500"
            }`}
            aria-label={`Role: ${entry.role === "owner" ? "Owner" : "Visited"}`}
          >
            {entry.role === "owner" ? "Owner" : "Visited"}
          </span>
          <span className="text-[10px] text-gray-400 shrink-0">
            {relativeTime(entry.lastOpened)}
          </span>
        </div>

        {/* Actions row — always visible, never hover-gated; ≥44px on mobile */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => { window.location.href = `/w/${entry.id}`; }}
            aria-label={`Open workspace ${displayName}`}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 min-h-[44px] sm:min-h-[32px]"
          >
            Open
          </button>

          {/* Copy link — the green cue is on THIS persistent button (per copy-confirmation lesson) */}
          <button
            type="button"
            aria-label={isCopied ? `Link for ${displayName} copied!` : `Copy link for workspace ${displayName}`}
            onClick={() => void handleCopyLink(entry)}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium min-h-[44px] sm:min-h-[32px] transition-colors ${
              isCopied
                ? "bg-green-500 text-white"
                : "text-gray-600 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {isCopied ? (
              <><span aria-hidden="true">✓</span>{" "}<span>Copied!</span></>
            ) : (
              "Copy link"
            )}
          </button>
          {/* aria-live region for screen readers — distinct from the button text */}
          <span role="status" aria-live="polite" className="sr-only">
            {isCopied ? `Link copied for ${displayName}` : ""}
          </span>

          {/* Remove from list — FIX A-4: "Remove from list" verb makes local-only clear */}
          <button
            type="button"
            onClick={() => handleRemove(entry)}
            aria-label={`Remove workspace ${displayName} from this list`}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 min-h-[44px] sm:min-h-[32px]"
          >
            Remove from list
          </button>
        </div>

        {/* Rename hint shown when in rename mode */}
        {isRenaming && (
          <p className="text-[10px] text-gray-400 leading-snug">
            Enter to save · Esc to cancel
          </p>
        )}
      </div>
    );
  }

  // ── Shared list renderer (capped with "Show all") ─────────────────────────────
  function renderList() {
    const visibleEntries = showAll ? filtered : filtered.slice(0, PREVIEW_COUNT);
    const hasMore = filtered.length > PREVIEW_COUNT && !showAll;

    if (filtered.length === 0) {
      return (
        <p className="text-xs text-gray-400 leading-snug py-1">
          {count === 0
            ? `No workspaces yet — create one or open a /w/… link and it'll show up here on this device.`
            : "No workspaces match your search."}
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-1.5">
        {visibleEntries.map(renderEntry)}
        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-xs text-blue-600 hover:text-blue-700 text-left py-1 min-h-[44px]"
          >
            Show all ({filtered.length})
          </button>
        )}
      </div>
    );
  }

  // FIX A (My Workspaces Round 3): do NOT render in prime above-grid space when empty.
  // A first-timer's cold open must not see an empty panel above the grid.
  // When count === 0, return nothing — the grid is the hero.
  if (count === 0) return null;

  // FIX C-1: SINGLE responsive instance — CSS breakpoints only, no JS viewport detection.
  // The panel renders identically on desktop and mobile; Tailwind classes handle any
  // responsive differences. No desktopOnly/mobileOnly branches — only ONE "My Workspaces"
  // heading and ONE search input exist in the DOM at any time.
  return (
    <div data-testid="my-workspaces-panel" className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-800" data-testid="my-workspaces-heading">
          My Workspaces{count > 0 ? ` (${count})` : ""}
        </h2>
        <p className="mt-0.5 text-[10px] text-gray-400 leading-snug">
          Saved on this device only. Keep the workspace link to access it elsewhere.
        </p>
      </div>

      <div className="px-3 py-3 flex flex-col gap-2">
        {/* Search — only when list is non-empty; ≥44px on all viewports (FIX C-1) */}
        {count > 0 && (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workspaces"
            aria-label="Search workspaces"
            data-testid="my-workspaces-search"
            className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 min-h-[44px]"
          />
        )}

        {/* List or empty state — capped at 3 with "Show all (N)" */}
        {renderList()}
      </div>
    </div>
  );
}
