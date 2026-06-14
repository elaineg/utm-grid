"use client";

/**
 * /w/[id]/guide — Team UTM Style Guide (READ-ONLY).
 *
 * Fetches the workspace via GET /api/workspace/<id> in a useEffect
 * (NEVER in a useState lazy initializer — SSR/hydration lesson).
 *
 * Makes ZERO writes: no PUT, no POST, no autosave, no localStorage writes.
 * The guide is a server-fetched, typographic READ-ONLY document.
 *
 * Sections (per UX brief):
 *   (a) What & why
 *   (b) Allowed values per UTM field (only fields with non-empty list)
 *   (c) Campaign Naming Template — segments + separator + worked example
 *   (d) Active lint conventions in plain language
 *   (e) CTA card linking to /w/<id>
 *
 * Empty state: if no spec values and no naming template, still renders
 *   (a) + (d) + a friendly note + (e).
 *
 * Not-found state: clean "Workspace not found" + link back to /.
 *
 * Mode-aware copy: NO "client-side only / nothing leaves browser" claims here
 * (this page fetches from the server). Privacy: secret link is the access control.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { WorkspacePayload } from "../../../../lib/workspace";
import { UTM_FIELDS, type UtmField } from "../../../../lib/types";

const FIELD_LABELS: Record<UtmField, string> = {
  utm_source: "utm_source",
  utm_medium: "utm_medium",
  utm_campaign: "utm_campaign",
  utm_term: "utm_term",
  utm_content: "utm_content",
};

export default function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);

  // Resolve async params (Next.js 15+ pattern — mirror /w/[id]/page.tsx)
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const [status, setStatus] = useState<"loading" | "found" | "not_found">("loading");
  const [payload, setPayload] = useState<WorkspacePayload | null>(null);

  // Fetch workspace on id resolve — GET only, no write ever
  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setStatus("loading");

    async function fetchWorkspace() {
      try {
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
          Loading style guide…
        </p>
      </main>
    );
  }

  // Not found
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

  // Found — render the guide document
  const spec = payload!.spec;
  const template = payload!.namingTemplate;
  const settings = payload!.settings;
  const workspaceName = payload!.name ?? "Team";

  // (b) Only UTM fields with non-empty allowed-value list
  const fieldsWithValues = UTM_FIELDS.filter(
    (f) => spec?.allowedValues[f]?.length > 0
  );

  // (c) Campaign Naming Template — only if segments exist
  const hasTemplate = (template?.segments?.length ?? 0) > 0;

  // Worked example: first allowed token per segment, else <segment-name> placeholder
  function buildWorkedExample(): string {
    if (!template || !hasTemplate) return "";
    const parts = template.segments.map((seg) =>
      seg.allowedTokens.length > 0 ? seg.allowedTokens[0] : `<${seg.name || "segment"}>`
    );
    return parts.join(template.separator);
  }

  const workedExample = buildWorkedExample();

  // (d) Active lint conventions
  const activeLintRules: string[] = [];
  if (settings.requiredParams) {
    activeLintRules.push("utm_source, utm_medium, and utm_campaign are required on every link.");
  }
  if (settings.lowercaseOnly) {
    activeLintRules.push("All UTM values must be lowercase.");
  }
  if (settings.noSpaces) {
    activeLintRules.push("No spaces allowed in UTM values — use underscores or hyphens.");
  }
  if (settings.enforceSpec && fieldsWithValues.length > 0) {
    activeLintRules.push("All values must come from the allowed list defined above.");
  }
  if (settings.enforceTemplate && hasTemplate) {
    activeLintRules.push(
      `Campaign names must follow the template: ${template!.segments.map((s) => s.name || "segment").join(` ${template!.separator} `)} (separated by "${template!.separator}").`
    );
  }

  const hasNoCustomTaxonomy = fieldsWithValues.length === 0 && !hasTemplate;

  const pageTitle = `${workspaceName} UTM Tagging Standard`;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      {/* Page header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{pageTitle}</h1>
        <p className="mt-2 text-sm text-gray-500">
          How this team tags campaign links so reporting stays clean.{" "}
          Read-only reference.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Anyone with this secret link can view this page.
        </p>
      </header>

      <div className="space-y-8">
        {/* (a) What & why */}
        <section aria-labelledby="what-why-heading">
          <h2 id="what-why-heading" className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Why UTM tags matter
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Consistent UTM tags keep campaign data from silently splitting in Google Analytics.
            A single casing or spelling inconsistency — e.g.{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono">Newsletter</code>{" "}
            vs.{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono">newsletter</code>{" "}
            — creates two separate traffic sources in reports, hiding the real impact of a channel.
            This page defines the standard so everyone on the team tags links the same way.
          </p>
        </section>

        {/* Empty state */}
        {hasNoCustomTaxonomy && (
          <section aria-labelledby="no-taxonomy-heading">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
              <h2 id="no-taxonomy-heading" className="text-sm font-semibold text-gray-700 mb-1">
                No custom taxonomy defined yet
              </h2>
              <p className="text-sm text-gray-500">
                This team hasn&apos;t defined a custom allowed-value list or campaign naming template
                yet — the conventions below still apply.
              </p>
            </div>
          </section>
        )}

        {/* (b) Allowed values per field */}
        {fieldsWithValues.length > 0 && (
          <section aria-labelledby="allowed-values-heading">
            <h2 id="allowed-values-heading" className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Allowed values per UTM field
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Only the values listed below are approved for each field.
            </p>
            <div className="space-y-4">
              {fieldsWithValues.map((field) => (
                <div key={field}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    <code className="font-mono">{FIELD_LABELS[field]}</code>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {spec.allowedValues[field].map((val) => (
                      <span
                        key={val}
                        className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-mono text-blue-800"
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* (c) Campaign Naming Template */}
        {hasTemplate && (
          <section aria-labelledby="naming-template-heading">
            <h2 id="naming-template-heading" className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Campaign naming template
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              The{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono">utm_campaign</code>{" "}
              value must be composed of{" "}
              {template!.segments.length} ordered{" "}
              {template!.segments.length === 1 ? "segment" : "segments"} joined by{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono">&quot;{template!.separator}&quot;</code>.
            </p>

            {/* Segment definitions */}
            <div className="space-y-3 mb-5">
              {template!.segments.map((seg, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {seg.name || `Segment ${idx + 1}`}
                    </p>
                    {seg.allowedTokens.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {seg.allowedTokens.map((tok) => (
                          <span
                            key={tok}
                            className="inline-block rounded border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-mono text-teal-700"
                          >
                            {tok}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-0.5 text-xs text-gray-400 italic">any value</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Worked example */}
            <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 mb-1">
                Worked example
              </p>
              <code className="text-sm font-mono text-teal-900 break-all">{workedExample}</code>
              <p className="mt-1 text-xs text-teal-600">
                A compliant{" "}
                <code className="font-mono">utm_campaign</code> value following this template.
              </p>
            </div>
          </section>
        )}

        {/* (d) Conventions */}
        <section aria-labelledby="conventions-heading">
          <h2 id="conventions-heading" className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Naming conventions
          </h2>
          {activeLintRules.length > 0 ? (
            <ul className="space-y-2">
              {activeLintRules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 text-green-500 shrink-0" aria-hidden="true">✓</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No naming convention rules are currently active in this workspace.
            </p>
          )}
        </section>

        {/* (e) CTA card — prominent, not just a footer link */}
        <section aria-labelledby="cta-heading">
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h2 id="cta-heading" className="text-base font-semibold text-blue-900 mb-1">
                Ready to build or edit links?
              </h2>
              <p className="text-sm text-blue-700">
                Open the live team workspace to add rows, edit UTM values, and export tagged URLs
                — changes sync to everyone on this link.
              </p>
            </div>
            <Link
              href={`/w/${id}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 shrink-0"
            >
              Open the editable workspace →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
