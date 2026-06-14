/**
 * Pure utility functions for QR code generation feature.
 * No browser APIs, no React — safe to import in any context including tests.
 */
import { buildUtmUrl } from "./utm";
import type { UtmRow } from "./types";

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
 * Build a stable filename for a QR PNG given the 1-based row index and utm_campaign.
 * Format: "NN-slug.png" or "NN.png" when campaign is empty.
 * Row index is zero-padded to at least 2 digits.
 */
export function stableQrFilename(rowIndex: number, utm_campaign: string): string {
  const padded = String(rowIndex).padStart(2, "0");
  const slug = slugifyForFilename(utm_campaign || "");
  return slug ? `${padded}-${slug}.png` : `${padded}.png`;
}

/**
 * Filter rows to those with a valid (non-empty) generated URL.
 * Returns { valid: UtmRow[], skippedCount: number }.
 */
export function filterValidQrRows(
  rows: UtmRow[],
  selectedRowIds?: Set<string>
): { valid: UtmRow[]; skippedCount: number; targetedCount: number } {
  const targeted =
    selectedRowIds && selectedRowIds.size > 0
      ? rows.filter((r) => selectedRowIds.has(r.id))
      : rows;

  const valid = targeted.filter((r) => {
    const url = buildUtmUrl(r);
    return url.trim().length > 0;
  });

  return {
    valid,
    skippedCount: targeted.length - valid.length,
    targetedCount: targeted.length,
  };
}

/**
 * Build the green-fill result message after a bulk QR download.
 * - All skipped: "No QR codes — no rows have a valid URL yet."
 * - Some skipped: "N QR codes generated, M rows skipped — no valid URL"
 * - None skipped: "N QR codes generated"
 */
export function buildQrResultMessage(generatedCount: number, skippedCount: number): string {
  if (generatedCount === 0) {
    return "No QR codes — no rows have a valid URL yet.";
  }
  if (skippedCount > 0) {
    return `${generatedCount} QR code${generatedCount === 1 ? "" : "s"} generated, ${skippedCount} row${skippedCount === 1 ? "" : "s"} skipped — no valid URL`;
  }
  return `${generatedCount} QR code${generatedCount === 1 ? "" : "s"} generated`;
}
