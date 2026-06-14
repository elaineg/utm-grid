"use client";

/**
 * /w/[id]/review — Read-only shareable Review Summary page.
 *
 * MIRRORS /w/[id]/guide and /w/[id]/check — same fetch pattern, same read-only contract.
 *
 * READ-ONLY GUARANTEE:
 *   - Makes ONLY a GET /api/workspace/<id> — NEVER any POST or PUT.
 *   - Does NOT write to localStorage (no useLocalStorage, no writeValue).
 *   - Does NOT autosave. Does NOT trigger any side effect that mutates server state.
 *   - Only browser API used: window.location.origin (in useEffect, SSR-safe).
 *
 * Sections:
 *   (a) Review roll-up badge — screenshot-friendly headline
 *   (b) Roll-up counts (N approved · N need changes · N unreviewed) + ratio bar
 *   (c) Per-link review status list (state badge + reviewer + note)
 *   (d) "Open workspace to review" CTA
 *
 * Empty/legacy state: "0 of N reviewed" with an explanatory hint.
 * Not-found state: "Workspace not found" + link back to /.
 * Mode-aware copy: server-backed, no "nothing leaves your browser" claims.
 *
 * SSR-safe: no useState lazy initializer reads browser APIs.
 * No read from window/document/localStorage in render.
 *
 * Guard #2 (SINGLE SOURCE): computeReviewRollup() is the one source for counts.
 * Guard #8 (MODE-AWARE): explicit "server-persisted" language, no stale client-only claim.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { WorkspacePayload } from "../../../../lib/workspace";
import {
  computeReviewRollup,
  getRowReviewState,
  getRowReviewEntry,
  type ReviewEntry,
} from "../../../../lib/review";
import type { UtmRow } from "../../../../lib/types";

type ReviewState = "approved" | "needs-changes" | "unreviewed";

const STATE_LABELS: Record<ReviewState, string> = {
  approved: "Approved",
  "needs-changes": "Needs changes",
  unreviewed: "Unreviewed",
};

const STATE_BADGE_CLASS: Record<ReviewState, string> = {
  approved: "bg-green-100 text-green-800 border border-green-300",
  "needs-changes": "bg-amber-100 text-amber-800 border border-amber-300",
  unreviewed: "bg-slate-100 text-slate-500 border border-slate-200",
};

/** Row review summary entry for rendering */
interface RowReview {
  row: UtmRow;
  rowIndex: number;
  state: ReviewState;
  entry: ReviewEntry | null;
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);

  // Resolve async params (Next.js 15+ pattern)
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const [status, setStatus] = useState<"loading" | "found" | "not_found">("loading");
  const [payload, setPayload] = useState<WorkspacePayload | null>(null);

  // Fetch workspace — GET only, no write ever.
  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setStatus("loading");

    async function fetchWorkspace() {
      try {
        // ONLY a GET — this route is read-only and never mutates state.
        const res = await fetch(`/api/workspace/${id}`);
        if (cancelled) return;

        if (res.status === 404 || !res.ok) {
          setStatus("not_found");
          return;
        }

        const json = (await res.json()) as { data: string };
        if (cancelled) return;

        const data = JSON.parse(json.data) as WorkspacePayload;
        setPayload(data);
        setStatus("found");
      } catch {
        if (cancelled) return;
        setStatus("not_found");
      }
    }

    void fetchWorkspace();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Loading
  if (status === "loading" || !id) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <p role="status" aria-live="polite" className="text-sm text-gray-500">
          Loading review summary…
        </p>
      </main>
    );
  }

  // Not found — clean state, link back to builder.
  if (status === "not_found") {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 flex flex-col items-center justify-center gap-6 min-h-[50vh]">
        <div className="text-center max-w-md">
          <h1 role="alert" className="text-2xl font-bold text-gray-900 mb-2">
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

  // Found — compute review data from payload.
  const rows = payload!.rows ?? [];
  const reviewMap = payload!.reviewMap;

  // SINGLE SOURCE: all counts from computeReviewRollup (guard #2).
  const rollup = computeReviewRollup(reviewMap, rows.map((r) => r.id));
  const { approved, needsChanges, unreviewed, total } = rollup;

  // Per-row review entries
  const rowReviews: RowReview[] = rows.map((row, i) => ({
    row,
    rowIndex: i,
    state: getRowReviewState(reviewMap, row.id),
    entry: getRowReviewEntry(reviewMap, row.id),
  }));

  const allApproved = total > 0 && approved === total;
  const noneReviewed = approved === 0 && needsChanges === 0;

  // Ratio bar widths
  const approvedPct = total > 0 ? Math.round((approved / total) * 100) : 0;
  const needsPct = total > 0 ? Math.round((needsChanges / total) * 100) : 0;
  const unreviewedPct = 100 - approvedPct - needsPct;

  const workspaceName = payload!.name;
  const pageTitle = workspaceName
    ? `${workspaceName} — Review Summary`
    : "Review Summary";

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{pageTitle}</h1>
        <p className="mt-1 text-xs text-gray-400">
          Read-only review status. Anyone with this secret link can view this page.{" "}
          Review state is server-persisted on the shared workspace.
        </p>
      </header>

      <div className="space-y-6">
        {/* (a) Roll-up badge */}
        <div
          role="status"
          aria-live="polite"
          data-testid="review-summary-badge"
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-base font-bold ${
            allApproved
              ? "border-green-300 bg-green-50 text-green-800"
              : noneReviewed
              ? "border-slate-200 bg-slate-50 text-slate-600"
              : needsChanges > 0
              ? "border-amber-300 bg-amber-50 text-amber-800"
              : "border-indigo-200 bg-indigo-50 text-indigo-800"
          }`}
        >
          <span aria-hidden="true">
            {allApproved ? "✓" : noneReviewed ? "○" : needsChanges > 0 ? "⚠" : "◑"}
          </span>
          <span>
            {allApproved
              ? `All ${total} link${total === 1 ? "" : "s"} approved`
              : noneReviewed
              ? `0 of ${total} reviewed`
              : `${approved} of ${total} approved`}
          </span>
        </div>

        {/* (b) Scorecard */}
        <div
          data-testid="review-summary-scorecard"
          className="rounded-lg border border-indigo-100 bg-indigo-50 px-5 py-4"
        >
          {/* Count line */}
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-bold text-green-700">{approved}</span>
              <span className="text-xs text-slate-500">approved</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-bold text-amber-700">{needsChanges}</span>
              <span className="text-xs text-slate-500">need{needsChanges === 1 ? "s" : ""} changes</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-bold text-slate-500">{unreviewed}</span>
              <span className="text-xs text-slate-500">unreviewed</span>
            </div>
          </div>
          {/* Ratio bar */}
          {total > 0 && (
            <div
              className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden flex"
              role="img"
              aria-label={`${approved} approved, ${needsChanges} need changes, ${unreviewed} unreviewed out of ${total}`}
            >
              {approvedPct > 0 && (
                <div className="h-full bg-green-500" style={{ width: `${approvedPct}%` }} />
              )}
              {needsPct > 0 && (
                <div className="h-full bg-amber-500" style={{ width: `${needsPct}%` }} />
              )}
              {unreviewedPct > 0 && (
                <div className="h-full bg-slate-300" style={{ width: `${unreviewedPct}%` }} />
              )}
            </div>
          )}
          <p className="mt-2 text-[10px] text-indigo-400">
            Review state is server-persisted — all teammates on the workspace link see the same status.
          </p>
        </div>

        {/* (b) empty/legacy state */}
        {noneReviewed && total > 0 && (
          <div
            role="status"
            data-testid="review-summary-none-reviewed"
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <span className="text-slate-400 text-lg" aria-hidden="true">○</span>
            <p className="text-sm text-slate-600">
              No links have been reviewed yet.{" "}
              <Link href={`/w/${id}`} className="text-indigo-600 hover:underline">
                Open the workspace to review →
              </Link>
            </p>
          </div>
        )}

        {/* (c) Per-link review status list */}
        {total > 0 && (
          <section aria-labelledby="per-link-heading">
            <h2 id="per-link-heading" className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Per-link approval status
            </h2>
            <div className="space-y-2">
              {rowReviews.map(({ row, rowIndex, state, entry }) => (
                <div
                  key={row.id}
                  data-testid={`review-summary-row-${rowIndex}`}
                  className="rounded-md border border-gray-100 bg-white px-3 py-2.5 flex flex-col gap-1.5"
                >
                  {/* FIX D: stacked layout at 375px — everything on its own line. */}
                  {/* Top bar: row number + state badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-400 shrink-0">
                      #{rowIndex + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold shrink-0 ${STATE_BADGE_CLASS[state]}`}
                    >
                      <span aria-hidden="true">
                        {state === "approved" ? "✓" : state === "needs-changes" ? "⚠" : "—"}
                      </span>
                      {STATE_LABELS[state]}
                    </span>
                    {entry && (
                      <span className="text-[10px] text-gray-500 shrink-0">
                        by{" "}
                        <span className="font-semibold text-gray-700">
                          {entry.reviewer || "Anonymous"}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* URL — full-width, breaks or truncates on narrow screens */}
                  <p
                    className="text-xs font-mono text-gray-500 break-all leading-tight"
                    title={row.baseUrl || undefined}
                  >
                    {row.baseUrl || <span className="italic text-gray-300">(no base URL)</span>}
                  </p>

                  {/* Source / medium / campaign — single line, wraps */}
                  {(row.utm_source || row.utm_medium || row.utm_campaign) && (
                    <p className="text-[10px] text-gray-400 flex flex-wrap gap-x-1">
                      {row.utm_source && <span>{row.utm_source}</span>}
                      {row.utm_source && row.utm_medium && <span>·</span>}
                      {row.utm_medium && <span>{row.utm_medium}</span>}
                      {(row.utm_source || row.utm_medium) && row.utm_campaign && <span>·</span>}
                      {row.utm_campaign && <span className="font-medium">{row.utm_campaign}</span>}
                    </p>
                  )}

                  {/* Note — full-width, never collides with URL */}
                  {entry?.note && (
                    <p className="text-[10px] text-gray-400 italic leading-snug">
                      &ldquo;{entry.note}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {total === 0 && (
          <p className="text-sm text-gray-400 italic">
            This workspace has no links yet.
          </p>
        )}

        {/* (d) CTA — prominent, with "Open the workspace to review" wording.
            Guard #9: distinct verb "Review"/"Approve" (not Audit/Check).
            Guard #8: mode-aware, no client-side-only claims. */}
        <section aria-labelledby="review-cta-heading">
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h2 id="review-cta-heading" className="text-base font-semibold text-indigo-900 mb-1">
                Want to approve or request changes?
              </h2>
              <p className="text-sm text-indigo-700">
                Open the workspace to mark each link Approved or Needs changes.
                Review state syncs immediately to everyone on this link.
              </p>
            </div>
            <Link
              href={`/w/${id}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 shrink-0"
            >
              Open the workspace to review →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
