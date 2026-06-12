import { UTM_FIELDS, type UtmField, type UtmRow } from "./types";
import { buildUtmUrl } from "./utm";

/**
 * Minimal RFC-4180-style CSV parser.
 * Handles quoted fields containing commas, escaped quotes (""), and
 * newlines inside quotes. Accepts \n, \r\n, and \r line endings.
 * Returns rows of string cells; trailing empty line is dropped.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        cell += ch;
        i++;
      }
    } else if (ch === '"') {
      inQuotes = true;
      i++;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
      i++;
    } else if (ch === "\n" || ch === "\r") {
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
      if (ch === "\r" && text[i + 1] === "\n") i += 2;
      else i++;
    } else {
      cell += ch;
      i++;
    }
  }
  // Final cell/row (no trailing newline).
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  // Drop blank lines (single empty cell), e.g. between records or at EOF.
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

function escapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

/** Serialize rows of cells to CSV text with \n line endings. */
export function serializeCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCell).join(",")).join("\n") + "\n";
}

export const EXPORT_HEADERS = [
  "base_url",
  ...UTM_FIELDS,
  "generated_url",
] as const;

/** Build the export CSV: one row per grid row, base URL + all utm_* + generated URL. */
export function rowsToCsv(rows: UtmRow[]): string {
  const data = rows.map((row) => [
    row.baseUrl,
    ...UTM_FIELDS.map((f) => row[f]),
    buildUtmUrl(row),
  ]);
  return serializeCsv([[...EXPORT_HEADERS], ...data]);
}

export type MappableField = "baseUrl" | UtmField;

export const MAPPABLE_FIELDS: readonly MappableField[] = [
  "baseUrl",
  ...UTM_FIELDS,
];

/** Normalize a header for matching: lowercase, strip everything non-alphanumeric. */
function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const HEADER_ALIASES: Record<MappableField, string[]> = {
  baseUrl: ["baseurl", "url", "link", "destination", "destinationurl", "landingpage", "page"],
  utm_source: ["utmsource", "source"],
  utm_medium: ["utmmedium", "medium"],
  utm_campaign: ["utmcampaign", "campaign", "campaignname"],
  utm_term: ["utmterm", "term", "keyword"],
  utm_content: ["utmcontent", "content"],
};

/**
 * Auto pre-map CSV headers to grid fields. Returns, per mappable field, the
 * index of the matching CSV column, or null when no header matches.
 * Exact field-name matches win over aliases; each CSV column maps at most once.
 */
export function autoMapHeaders(headers: string[]): Record<MappableField, number | null> {
  const normalized = headers.map(normalizeHeader);
  const mapping = Object.fromEntries(
    MAPPABLE_FIELDS.map((f) => [f, null])
  ) as Record<MappableField, number | null>;
  const used = new Set<number>();

  for (const field of MAPPABLE_FIELDS) {
    const candidates = HEADER_ALIASES[field];
    for (const candidate of candidates) {
      const idx = normalized.findIndex((h, i) => h === candidate && !used.has(i));
      if (idx !== -1) {
        mapping[field] = idx;
        used.add(idx);
        break;
      }
    }
  }
  return mapping;
}

/**
 * Apply a column mapping to parsed CSV data rows (header row excluded),
 * producing grid rows. Unmapped fields are empty.
 */
export function csvToRows(
  dataRows: string[][],
  mapping: Record<MappableField, number | null>,
  makeId: () => string
): UtmRow[] {
  return dataRows.map((cells) => {
    const get = (field: MappableField): string => {
      const idx = mapping[field];
      return idx === null || idx === undefined ? "" : (cells[idx] ?? "");
    };
    return {
      id: makeId(),
      baseUrl: get("baseUrl"),
      utm_source: get("utm_source"),
      utm_medium: get("utm_medium"),
      utm_campaign: get("utm_campaign"),
      utm_term: get("utm_term"),
      utm_content: get("utm_content"),
    };
  });
}
