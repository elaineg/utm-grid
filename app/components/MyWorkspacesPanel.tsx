"use client";

/**
 * My Workspaces panel — device-local index of every Team Workspace this browser
 * has CREATED or OPENED.
 *
 * Lives in the RIGHT-RAIL sidebar on desktop (≥900px), FIRST item ABOVE Campaigns.
 * Auto-expanded by default (the only side section that is).
 * On mobile (<900px): first disclosure ABOVE Campaigns, expanded by default with
 * count, capped at 3 visible entries + "Show all (N)" expander.
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
  writeMyWorkspacesToStorage,
  type MyWorkspaceEntry,
} from "../../lib/myWorkspaces";
import { writeClipboard } from "../../lib/share";

// ── localStorage store wired to useSyncExternalStore ─────────────────────────

type Listener = () => void;
const listeners = new Set<Listener>();

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

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  /** Render only on desktop (≥900px). Mutually exclusive with mobileOnly. */
  desktopOnly?: boolean;
  /** Render only on mobile (<900px). Mutually exclusive with desktopOnly. */
  mobileOnly?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MyWorkspacesPanel({ desktopOnly, mobileOnly }: Props) {
  // ── SSR-safe localStorage subscription ──────────────────────────────────────
  // Server snapshot: empty array (safe, no localStorage on server).
  // Client snapshot: read from localStorage on first render.
  const entries = useSyncExternalStore(
    subscribeMyWorkspaces,
    () => {
      try {
        const raw = window.localStorage.getItem(MY_WORKSPACES_KEY);
        return deserializeMyWorkspaces(raw);
      } catch {
        return [] as MyWorkspaceEntry[];
      }
    },
    () => [] as MyWorkspaceEntry[]
  );

  // ── Relative-time tick (every 10s) ──────────────────────────────────────────
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 10_000);
    return () => clearInterval(t);
  }, []);

  // ── Search / filter ──────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");

  // ── Mobile "Show all" expander ───────────────────────────────────────────────
  const MOBILE_PREVIEW = 3;
  const [showAll, setShowAll] = useState(false);

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
    const confirmed = window.confirm(
      `Remove "${entry.label}" from this list? This only removes it from THIS device — the workspace and its link still work.`
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

  // ── Wrapper class (desktop-only / mobile-only) ───────────────────────────────
  const wrapperClass = desktopOnly
    ? "hidden min-[900px]:block"
    : mobileOnly
    ? "min-[900px]:hidden"
    : "";

  // ── Render one entry card ─────────────────────────────────────────────────────
  function renderEntry(entry: MyWorkspaceEntry) {
    const isCopied = copiedIds.has(entry.id);
    return (
      <div
        key={entry.id}
        className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2.5 flex flex-col gap-1"
      >
        {/* Label + badges row */}
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <button
            type="button"
            onClick={() => { window.location.href = `/w/${entry.id}`; }}
            aria-label={`Open workspace: ${entry.label}`}
            className="font-semibold text-sm text-gray-900 truncate hover:text-blue-700 text-left min-w-0"
          >
            {entry.label}
          </button>
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

        {/* Actions row — always visible, never hover-gated */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => { window.location.href = `/w/${entry.id}`; }}
            aria-label={`Open workspace ${entry.label}`}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 min-h-[36px] sm:min-h-[32px]"
          >
            Open
          </button>

          {/* Copy link — the green cue is on THIS persistent button (per copy-confirmation lesson) */}
          <button
            type="button"
            aria-label={isCopied ? `Link for ${entry.label} copied!` : `Copy link for workspace ${entry.label}`}
            onClick={() => void handleCopyLink(entry)}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium min-h-[36px] sm:min-h-[32px] transition-colors ${
              isCopied
                ? "bg-green-500 text-white"
                : "text-gray-600 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {isCopied ? (
              <><span aria-hidden="true">✓</span><span>Copied!</span></>
            ) : (
              "Copy link"
            )}
          </button>
          {/* aria-live region for screen readers — distinct from the button text */}
          <span role="status" aria-live="polite" className="sr-only">
            {isCopied ? `Link copied for ${entry.label}` : ""}
          </span>

          <button
            type="button"
            onClick={() => handleRemove(entry)}
            aria-label={`Remove workspace ${entry.label} from this list`}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 min-h-[36px] sm:min-h-[32px]"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  // ── Desktop render ────────────────────────────────────────────────────────────
  function renderDesktop() {
    return (
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-800">
            My Workspaces{count > 0 ? ` (${count})` : ""}
          </h2>
          <p className="mt-0.5 text-[10px] text-gray-400 leading-snug">
            Workspaces you create or open are saved on THIS device only — not synced. Keep
            the workspace link to access it elsewhere.{" "}
            <span className="italic">Sign-in to sync across devices is coming.</span>
          </p>
        </div>

        <div className="px-3 py-3 flex flex-col gap-2">
          {/* Search — only when list is non-empty */}
          {count > 0 && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workspaces"
              aria-label="Search workspaces"
              className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 min-h-[36px]"
            />
          )}

          {/* List or empty state */}
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400 leading-snug py-1">
              {count === 0
                ? `No workspaces yet — create one or open a /w/… link and it'll show up here on this device.`
                : "No workspaces match your search."}
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {filtered.map(renderEntry)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Mobile render ─────────────────────────────────────────────────────────────
  function renderMobile() {
    const visibleEntries = showAll ? filtered : filtered.slice(0, MOBILE_PREVIEW);
    const hasMore = filtered.length > MOBILE_PREVIEW && !showAll;

    return (
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        {/* Header — always expanded on mobile (the only section that is) */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-800">
            My Workspaces{count > 0 ? ` (${count})` : ""}
          </h2>
          <p className="mt-0.5 text-[10px] text-gray-400 leading-snug">
            Saved on this device only — not synced.
          </p>
        </div>

        <div className="px-3 py-3 flex flex-col gap-2">
          {/* Search — only when list is non-empty */}
          {count > 0 && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workspaces"
              aria-label="Search workspaces"
              className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 min-h-[44px]"
            />
          )}

          {/* List or empty state */}
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400 leading-snug py-1">
              {count === 0
                ? `No workspaces yet — create one or open a /w/… link and it'll show up here on this device.`
                : "No workspaces match your search."}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
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
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass} data-testid="my-workspaces-panel">
      {mobileOnly ? renderMobile() : renderDesktop()}
    </div>
  );
}
