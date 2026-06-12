import { UTM_FIELDS, type UtmField, type UtmRow } from "./types";

function splitHash(base: string): [string, string] {
  const hashIndex = base.indexOf("#");
  return hashIndex === -1
    ? [base, ""]
    : [base.slice(0, hashIndex), base.slice(hashIndex)];
}

/**
 * UTM params already present in the base URL's query string, in canonical
 * field order. Used to lint pre-tagged base URLs.
 */
export function baseUtmParams(baseUrl: string): UtmField[] {
  const [beforeHash] = splitHash(baseUrl.trim());
  const qIndex = beforeHash.indexOf("?");
  if (qIndex === -1) return [];
  const keys = new Set(
    beforeHash
      .slice(qIndex + 1)
      .split("&")
      .map((pair) => pair.split("=")[0])
  );
  return UTM_FIELDS.filter((f) => keys.has(f));
}

/**
 * Build the full campaign URL for a row.
 *
 * - Empty base URL -> empty string.
 * - Only non-empty UTM params are appended, always in canonical order
 *   (source, medium, campaign, term, content).
 * - Existing query strings and #fragments on the base URL are preserved
 *   (params are appended before the fragment).
 * - A utm_* param already present in the base URL is REPLACED by the grid
 *   value (never duplicated — duplicates create GA4 ambiguity). Base utm_*
 *   params the row leaves empty are kept as-is.
 * - Values are URL-encoded.
 */
export function buildUtmUrl(row: Pick<UtmRow, "baseUrl" | (typeof UTM_FIELDS)[number]>): string {
  const base = row.baseUrl.trim();
  if (!base) return "";

  const pairs = UTM_FIELDS.filter((f) => row[f].trim() !== "").map(
    (f) => `${f}=${encodeURIComponent(row[f].trim())}`
  );
  if (pairs.length === 0) return base;

  const split = splitHash(base);
  let beforeHash = split[0];
  const hash = split[1];

  // Drop base-URL utm_* params that this row sets: the grid value replaces
  // them instead of appending a duplicate.
  const qIndex = beforeHash.indexOf("?");
  if (qIndex !== -1) {
    const kept = beforeHash
      .slice(qIndex + 1)
      .split("&")
      .filter((pair) => {
        if (pair === "") return false;
        const key = pair.split("=")[0];
        return (
          !(UTM_FIELDS as readonly string[]).includes(key) ||
          row[key as UtmField].trim() === ""
        );
      });
    beforeHash =
      beforeHash.slice(0, qIndex) + (kept.length > 0 ? "?" + kept.join("&") : "");
  }

  const sep = beforeHash.includes("?") ? "&" : "?";
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
