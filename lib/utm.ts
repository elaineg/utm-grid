import { UTM_FIELDS, type UtmField, type UtmRow, emptyRow } from "./types";

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

/**
 * Parse a full tagged URL back into its constituent fields (the inverse of buildUtmUrl).
 *
 * - Returns null for a blank/empty line.
 * - Returns an error string for a line that is not a parseable http(s) URL.
 * - On success returns the extracted row fields:
 *     baseUrl = scheme + host + path + any NON-utm query params (original order preserved)
 *     utm_* values are URL-decoded from the query string.
 * - Round-trip invariant: parseUtmUrl(buildUtmUrl(row)) reproduces that row's fields;
 *   buildUtmUrl(parseUtmUrl(url)) reproduces the url (no dup params).
 */
export type ParseUtmResult =
  | { ok: true; fields: Pick<UtmRow, "baseUrl" | (typeof UTM_FIELDS)[number]> }
  | { ok: false; error: string }
  | null; // blank line

export function parseUtmUrl(line: string): ParseUtmResult {
  const trimmed = line.trim();
  if (!trimmed) return null; // blank line

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, error: "not a valid URL" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "not an http(s) URL" };
  }

  // Extract utm_* values (URL-decoded) and build the baseUrl (non-utm params preserved).
  const extracted: Record<string, string> = {};
  const keptParams: string[] = [];

  url.searchParams.forEach((value, key) => {
    if ((UTM_FIELDS as readonly string[]).includes(key)) {
      // Only keep the FIRST occurrence of each utm_* param (per URL spec, first wins).
      if (!(key in extracted)) extracted[key] = value;
    } else {
      keptParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  });

  // Reconstruct baseUrl: scheme + host + pathname + non-utm query params + hash
  const baseWithoutQuery = `${url.protocol}//${url.host}${url.pathname}`;
  const baseUrl =
    keptParams.length > 0
      ? `${baseWithoutQuery}?${keptParams.join("&")}${url.hash}`
      : `${baseWithoutQuery}${url.hash}`;

  const fields: Pick<UtmRow, "baseUrl" | (typeof UTM_FIELDS)[number]> = {
    baseUrl,
    utm_source: extracted["utm_source"] ?? "",
    utm_medium: extracted["utm_medium"] ?? "",
    utm_campaign: extracted["utm_campaign"] ?? "",
    utm_term: extracted["utm_term"] ?? "",
    utm_content: extracted["utm_content"] ?? "",
  };

  return { ok: true, fields };
}

export interface ParsedLine {
  lineNo: number;
  line: string;
  reason: string;
}

export interface ParseManyResult {
  rows: UtmRow[];
  skipped: ParsedLine[];
}

/**
 * Parse many lines (one URL per line) into grid rows.
 * Blank lines are silently ignored (not counted as skipped).
 * Malformed lines are recorded in `skipped` with a line number and reason.
 * `idGen` is called per row to produce a unique row id (matches the pattern used by the grid).
 */
export function parseUtmUrls(text: string, idGen: () => string): ParseManyResult {
  const lines = text.split(/\r?\n/);
  const rows: UtmRow[] = [];
  const skipped: ParsedLine[] = [];

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    const result = parseUtmUrl(line);
    if (result === null) return; // blank — skip silently
    if (!result.ok) {
      skipped.push({ lineNo, line: line.trim(), reason: result.error });
      return;
    }
    const row: UtmRow = { ...emptyRow(idGen()), ...result.fields };
    rows.push(row);
  });

  return { rows, skipped };
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
