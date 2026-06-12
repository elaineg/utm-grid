import { UTM_FIELDS, type UtmRow } from "./types";

/**
 * Build the full campaign URL for a row.
 *
 * - Empty base URL -> empty string.
 * - Only non-empty UTM params are appended, always in canonical order
 *   (source, medium, campaign, term, content).
 * - Existing query strings and #fragments on the base URL are preserved
 *   (params are appended before the fragment).
 * - Values are URL-encoded.
 */
export function buildUtmUrl(row: Pick<UtmRow, "baseUrl" | (typeof UTM_FIELDS)[number]>): string {
  const base = row.baseUrl.trim();
  if (!base) return "";

  const pairs = UTM_FIELDS.filter((f) => row[f].trim() !== "").map(
    (f) => `${f}=${encodeURIComponent(row[f].trim())}`
  );
  if (pairs.length === 0) return base;

  const hashIndex = base.indexOf("#");
  const beforeHash = hashIndex === -1 ? base : base.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : base.slice(hashIndex);
  const sep = beforeHash.includes("?")
    ? beforeHash.endsWith("?") || beforeHash.endsWith("&")
      ? ""
      : "&"
    : "?";
  return beforeHash + sep + pairs.join("&") + hash;
}

/** Basic URL format check: http(s) URL that the URL constructor accepts. */
export function isValidBaseUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
