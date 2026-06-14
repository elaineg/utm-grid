"use client";

/**
 * /w/[id]/check — Read-only shareable Compliance Report for a workspace.
 *
 * MIRRORS /w/[id]/guide — same fetch pattern, same read-only contract.
 *
 * READ-ONLY GUARANTEE:
 *   - Makes ONLY a GET /api/workspace/<id> — NEVER any POST or PUT.
 *   - Does NOT write to localStorage (no useLocalStorage, no writeValue).
 *   - Does NOT autosave, does NOT trigger any side effect that mutates server state.
 *   - Only browser API used: window.location.origin (in a useEffect, SSR-safe).
 *
 * Recomputes the compliance report from the fetched rows+settings+spec+namingTemplate
 * using the SAME lib/launchCheck + lib/lint helpers as the builder.
 *
 * Sections:
 *   (a) Prominent pass/fail badge — screenshot-friendly headline
 *   (b) Scorecard (N checked / N passing / N with issues)
 *   (c) Grouped issue list (row + field + issue type + message)
 *   (d) Small secondary "Open editable workspace" link (NOT primary — Priya trust lesson)
 *
 * Not-found state: "Workspace not found" + link back to /.
 * Mode-aware copy: server-backed, no "nothing leaves your browser" claim.
 *
 * SSR-safe: no useState lazy initializer reads browser APIs.
 * No read from window/document/localStorage in render.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { WorkspacePayload } from "../../../../lib/workspace";
import { lintRows, groupWarnings } from "../../../../lib/lint";
import { computeLaunchCheckSummary, type LaunchCheckSummary } from "../../../../lib/launchCheck";
import { DEFAULT_NAMING_TEMPLATE, type NamingTemplate } from "../../../../lib/namingTemplate";
import { FIELD_LABELS, UTM_FIELDS, type UtmField } from "../../../../lib/types";

/** Human-readable issue type label — mirrors ComplianceReportPanel. */
function issueTypeLabel(issueType: string): string {
  switch (issueType) {
    case "required": return "Missing required";
    case "lowercase": return "Uppercase letters";
    case "no-spaces": return "Contains spaces";
    case "inconsistent": return "Inconsistent values";
    case "off-spec": return "Off-spec (not in allowed values)";
    case "off-template": return "Off-template structure";
    case "invalid-url": return "Invalid URL";
    case "base-utm": return "Base URL has UTM params";
    default: return issueType;
  }
}

/** Color class for the issue type badge — mirrors ComplianceReportPanel. */
function issueTypeBadgeClass(issueType: string): string {
  switch (issueType) {
    case "off-spec": return "bg-violet-100 text-violet-800";
    case "off-template": return "bg-teal-100 text-teal-800";
    case "required":
    case "invalid-url":
    case "base-utm": return "bg-red-50 text-red-700";
    default: return "bg-amber-50 text-amber-800";
  }
}

/** Group violations by (issueType, field) key — mirrors ComplianceReportPanel. */
function groupViolations(
  violations: LaunchCheckSummary["violations"]
): Map<string, LaunchCheckSummary["violations"]> {
  const map = new Map<string, LaunchCheckSummary["violations"]>();
  for (const v of violations) {
    const k = `${v.issueType}:${v.field}`;
    const list = map.get(k) ?? [];
    list.push(v);
    map.set(k, list);
  }
  return map;
}

export default function CheckPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);

  // Resolve async params (Next.js 15+ pattern — mirror guide/page.tsx)
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const [status, setStatus] = useState<"loading" | "found" | "not_found">("loading");
  const [summary, setSummary] = useState<LaunchCheckSummary | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");

  // Fetch workspace via GET only — NEVER POST or PUT.
  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setStatus("loading");

    async function fetchAndCompute() {
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

        // Recompute lint + compliance report using the SAME helpers as the builder.
        const namingTemplate: NamingTemplate = data.namingTemplate ?? DEFAULT_NAMING_TEMPLATE;
        const warnings = groupWarnings(lintRows(data.rows, data.settings, data.spec, namingTemplate));
        const allWarnings = Array.from(warnings.values()).flat();
        const computed = computeLaunchCheckSummary(data.rows, allWarnings);

        if (cancelled) return;
        setSummary(computed);
        setWorkspaceName(data.name ?? "");
        setStatus("found");
      } catch {
        if (cancelled) return;
        setStatus("not_found");
      }
    }

    void fetchAndCompute();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Loading
  if (status === "loading" || !id) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <p role="status" aria-live="polite" className="text-sm text-gray-500">
          Loading compliance report…
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

  const s = summary!;
  const allPass = s.violations.length === 0;
  const grouped = groupViolations(s.violations);
  const pageTitle = workspaceName
    ? `${workspaceName} — Compliance Report`
    : "Compliance Report";

  // (a) Prominent pass/fail badge text — screenshot-friendly
  const badgeText = allPass
    ? `All ${s.totalLinks} link${s.totalLinks === 1 ? "" : "s"} pass`
    : `Batch ${s.issueCount === 1 ? "has 1 issue" : `has ${s.issueCount} issues`}`;

  const badgeClass = allPass
    ? "inline-flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-base font-bold text-green-800"
    : "inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-base font-bold text-amber-800";

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{pageTitle}</h1>
        <p className="mt-1 text-xs text-gray-400">
          Read-only view. Workspace data is fetched from the server — anyone with this secret link can view this report.
        </p>
      </header>

      <div className="space-y-6">
        {/* (a) Prominent pass/fail badge — screenshot-friendly */}
        <div
          role="status"
          aria-live="polite"
          data-testid="check-badge"
          className={badgeClass}
        >
          <span aria-hidden="true">{allPass ? "✓" : "⚠"}</span>
          <span>{badgeText}</span>
        </div>

        {/* (b) Scorecard */}
        <div
          data-testid="check-scorecard"
          className="flex flex-wrap gap-5 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-bold text-slate-900">{s.totalLinks}</span>
            <span className="text-xs text-slate-500">link{s.totalLinks === 1 ? "" : "s"} checked</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-bold text-green-700">{s.passingCount}</span>
            <span className="text-xs text-slate-500">passing</span>
          </div>
          {s.issueCount > 0 && (
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-bold text-amber-700">{s.issueCount}</span>
              <span className="text-xs text-slate-500">with issues</span>
            </div>
          )}
        </div>

        {/* (c) All-pass success */}
        {allPass && (
          <div
            role="status"
            data-testid="check-all-pass"
            className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3"
          >
            <span aria-hidden="true" className="text-green-600 font-bold text-lg">✓</span>
            <p className="text-sm font-semibold text-green-800">
              All {s.totalLinks} link{s.totalLinks === 1 ? "" : "s"} pass — no violations found.
            </p>
          </div>
        )}

        {/* (c) Issue groups */}
        {!allPass && (
          <div
            className="space-y-3"
            data-testid="check-issues"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Issues ({s.issueCount} {s.issueCount === 1 ? "row" : "rows"} with problems)
            </h2>
            {Array.from(grouped.entries()).map(([key, violations]) => {
              const [issueType, field] = key.split(":");
              const fieldLabel =
                FIELD_LABELS[field as UtmField | "baseUrl"] ?? field;
              return (
                <div
                  key={key}
                  className="rounded-md border border-slate-200 bg-white p-3"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${issueTypeBadgeClass(issueType)}`}
                    >
                      {issueTypeLabel(issueType)}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {fieldLabel}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({violations.length} row{violations.length === 1 ? "" : "s"})
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {violations.map((v, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5"
                      >
                        <span className="font-semibold text-slate-500 shrink-0">
                          Row {v.rowNumber}
                        </span>
                        {v.value && (
                          <span className="font-mono text-[11px] text-slate-600 truncate max-w-[16rem]">
                            &ldquo;{v.value}&rdquo;
                          </span>
                        )}
                        <span className="text-slate-500 min-w-0">{v.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* (d) Small, clearly-secondary "Open editable workspace" link.
            NOT a CTA card — must not read as the primary action (Priya trust lesson).
            The page's identity is "read-only report". */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400 mb-2">
            This is a read-only compliance report. To edit links or re-run the check with different settings:
          </p>
          <Link
            href={`/w/${id}`}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Open editable workspace →
          </Link>
        </div>
      </div>
    </main>
  );
}
