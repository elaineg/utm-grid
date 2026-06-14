/**
 * Pure utility functions for QR code generation feature.
 * No browser APIs, no React — safe to import in any context including tests.
 */
import { buildUtmUrl } from "./utm";
import type { UtmRow } from "./types";

/**
 * Lint rules that BLOCK QR generation.
 * "required" (missing required param) and "invalid-url" (non-parseable URL)
 * make the generated link untracked or invalid — a printed QR would be wrong.
 * Style/consistency warnings (lowercase, no-spaces, inconsistent, off-spec,
 * off-template, base-utm) are NOT blocking; those links are complete, just stylistically flagged.
 */
export const BLOCKING_QR_LINT_RULES: ReadonlySet<string> = new Set(["required", "invalid-url"]);

/**
 * Returns true when a row has NO blocking lint error (required-missing or invalid-url),
 * AND has a non-empty parseable generated URL.
 *
 * Callers MUST compute the per-row eligibility from the existing lint warnings
 * (same lintRows output the grid already renders) and pass it as `rowEligibility`.
 * qr.ts stays pure — it never re-runs lint itself.
 *
 * @param row - The UtmRow to check
 * @param rowEligibility - Whether this row has NO blocking lint (caller-computed)
 */
export function isRowQrEligible(row: UtmRow, rowEligibility: boolean): boolean {
  if (!rowEligibility) return false;
  const url = buildUtmUrl(row);
  return url.trim().length > 0;
}

/**
 * Slugify a string for use in a filename:
 * - lowercase
 * - non-alphanumeric chars replaced with hyphens
 * - collapse consecutive hyphens
 * - strip leading/trailing hyphens
 */
export function slugifyForFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Build a stable, channel-aware filename for a QR PNG.
 * Format: "NN-campaign-source-medium.png" (omits empty parts, never produces a duplicate
 * or empty name, always filesystem-safe).
 *
 * Examples:
 *   stableQrFilename(1, "spring_sale", "newsletter", "email") → "01-spring-sale-newsletter-email.png"
 *   stableQrFilename(2, "summer", "", "")                    → "02-summer.png"
 *   stableQrFilename(3, "", "fb", "paid")                    → "03-fb-paid.png"
 *   stableQrFilename(4, "", "", "")                          → "04.png"
 */
export function stableQrFilename(
  rowIndex: number,
  utm_campaign: string,
  utm_source?: string,
  utm_medium?: string
): string {
  const padded = String(rowIndex).padStart(2, "0");
  const parts = [
    slugifyForFilename(utm_campaign || ""),
    slugifyForFilename(utm_source || ""),
    slugifyForFilename(utm_medium || ""),
  ].filter(Boolean);
  return parts.length > 0 ? `${padded}-${parts.join("-")}.png` : `${padded}.png`;
}

/**
 * Build the contact-sheet label for a QR entry.
 * Format: "NN · campaign · source/medium" (falls back to the generated URL when campaign is empty).
 *
 * Examples:
 *   contactSheetLabel(1, "spring_sale", "newsletter", "email", url) → "01 · spring_sale · newsletter/email"
 *   contactSheetLabel(2, "", "fb", "paid", url)                    → "02 · fb/paid"
 *   contactSheetLabel(3, "", "", "", "https://example.com/…")      → "03 · https://example.com/…"
 */
export function contactSheetLabel(
  rowIndex: number,
  utm_campaign: string,
  utm_source: string,
  utm_medium: string,
  fallbackUrl: string
): string {
  const padded = String(rowIndex).padStart(2, "0");
  const channel =
    utm_source && utm_medium
      ? `${utm_source}/${utm_medium}`
      : utm_source || utm_medium || "";
  if (utm_campaign && channel) return `${padded} · ${utm_campaign} · ${channel}`;
  if (utm_campaign) return `${padded} · ${utm_campaign}`;
  if (channel) return `${padded} · ${channel}`;
  return `${padded} · ${fallbackUrl.slice(0, 40)}`;
}

/**
 * Filter rows to those that are QR-eligible.
 * A row is eligible when:
 *   1. It has a non-empty generated URL.
 *   2. It has NO blocking lint error (required or invalid-url) — caller passes this
 *      per-row boolean in the `rowEligibilityMap`.
 *
 * Returns { valid: UtmRow[], skippedCount: number, targetedCount: number }.
 *
 * @param rows - All grid rows (or a pre-filtered selection)
 * @param rowEligibilityMap - Map from rowId → true when the row has NO blocking lint
 * @param selectedRowIds - When non-empty, only these rows are targeted
 */
export function filterValidQrRows(
  rows: UtmRow[],
  rowEligibilityMap?: Map<string, boolean>,
  selectedRowIds?: Set<string>
): { valid: UtmRow[]; skippedCount: number; targetedCount: number } {
  const targeted =
    selectedRowIds && selectedRowIds.size > 0
      ? rows.filter((r) => selectedRowIds.has(r.id))
      : rows;

  const valid = targeted.filter((r) => {
    const eligible = rowEligibilityMap ? (rowEligibilityMap.get(r.id) ?? true) : true;
    return isRowQrEligible(r, eligible);
  });

  return {
    valid,
    skippedCount: targeted.length - valid.length,
    targetedCount: targeted.length,
  };
}

/**
 * Build the green-fill result message after a bulk QR download.
 * - All skipped: "No QR codes — no rows have a complete, valid URL yet."
 * - Some skipped: "N QR codes generated, M skipped — incomplete or invalid URL"
 * - None skipped: "N QR codes generated"
 */
export function buildQrResultMessage(generatedCount: number, skippedCount: number): string {
  if (generatedCount === 0) {
    return "No QR codes — no rows have a complete, valid URL yet.";
  }
  if (skippedCount > 0) {
    return `${generatedCount} QR code${generatedCount === 1 ? "" : "s"} generated, ${skippedCount} skipped — incomplete or invalid URL`;
  }
  return `${generatedCount} QR code${generatedCount === 1 ? "" : "s"} generated`;
}
