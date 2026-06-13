/**
 * UTM Spec — governed allowed-value dictionary (pure, client-side, zero network).
 *
 * A UtmSpec holds, per UTM field, an ordered list of canonical allowed values
 * defined by the marketer's org taxonomy. When "Enforce UTM Spec" is on and a
 * field has a non-empty allowed list, any non-empty cell value not in the list
 * (case-insensitively) is off-spec and should be flagged with the nearest
 * allowed value as a fix suggestion.
 */
import { UTM_FIELDS, type UtmField } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SpecAllowedValues = Record<UtmField, string[]>;

export interface UtmSpec {
  /** Per-field allowed-value lists. An empty array means "any value" for that field. */
  allowedValues: SpecAllowedValues;
  /** When false: no off-spec warnings and no datalist suggestions. */
  enforceSpec: boolean;
}

export const DEFAULT_SPEC: UtmSpec = {
  allowedValues: {
    utm_source: [],
    utm_medium: [],
    utm_campaign: [],
    utm_term: [],
    utm_content: [],
  },
  enforceSpec: false,
};

// ── Nearest-value computation ─────────────────────────────────────────────────

/**
 * Collapse case and separator variants to a canonical form for comparison.
 * Mirrors normalizeUtmValue in lint.ts without the dependency.
 */
export function normalizeForSpec(value: string): string {
  return value.trim().toLowerCase().replace(/[-_\s]+/g, "_");
}

/**
 * Levenshtein distance between two strings.
 * Classic DP implementation, O(m*n) time, O(n) space.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  // prev[j] = distance(a[0..i-1], b[0..j])
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr: number[] = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,        // insert
        prev[j] + 1,             // delete
        prev[j - 1] + cost       // replace
      );
    }
    prev = curr;
  }
  return prev[n];
}

/**
 * Return the nearest allowed value for a given cell value:
 *  1. Exact normalized match (case + separator insensitive) — zero distance.
 *  2. Shortest Levenshtein distance on the normalized forms.
 *  3. Ties broken by first occurrence in the allowed list.
 *
 * Returns null if the allowed list is empty.
 */
export function nearestAllowedValue(
  cellValue: string,
  allowedValues: string[]
): string | null {
  if (allowedValues.length === 0) return null;
  const norm = normalizeForSpec(cellValue);

  // Exact normalized match → first such allowed value.
  for (const v of allowedValues) {
    if (normalizeForSpec(v) === norm) return v;
  }

  // Minimum Levenshtein distance on normalized forms.
  let best = allowedValues[0];
  let bestDist = levenshtein(norm, normalizeForSpec(allowedValues[0]));
  for (let i = 1; i < allowedValues.length; i++) {
    const d = levenshtein(norm, normalizeForSpec(allowedValues[i]));
    if (d < bestDist) {
      bestDist = d;
      best = allowedValues[i];
    }
  }
  return best;
}

/**
 * Return true if the cell value is in the allowed list (case-insensitive).
 * Always returns true when the allowed list is empty (no enforcement).
 */
export function isAllowedValue(cellValue: string, allowedValues: string[]): boolean {
  if (allowedValues.length === 0) return true;
  const norm = normalizeForSpec(cellValue);
  return allowedValues.some((v) => normalizeForSpec(v) === norm);
}

// ── Off-spec lint integration ─────────────────────────────────────────────────

export interface OffSpecWarning {
  rowId: string;
  field: UtmField;
  /** The canonical nearest allowed value for the "Fix to <nearest>" action. */
  nearest: string;
  message: string;
}

export type SpecRow = { id: string } & Record<UtmField, string>;

/**
 * Compute off-spec warnings for all rows + fields given a UtmSpec.
 * Only produces warnings when enforceSpec is true AND the field has a
 * non-empty allowed list AND the cell value is non-empty AND off-spec.
 *
 * Pure function — no side-effects, safe for unit tests.
 */
export function lintOffSpec(
  rows: SpecRow[],
  spec: UtmSpec
): OffSpecWarning[] {
  if (!spec.enforceSpec) return [];
  const warnings: OffSpecWarning[] = [];
  for (const row of rows) {
    for (const field of UTM_FIELDS) {
      const allowed = spec.allowedValues[field];
      if (allowed.length === 0) continue;
      const value = (row as Record<string, string>)[field].trim();
      if (!value) continue;
      if (isAllowedValue(value, allowed)) continue;
      const nearest = nearestAllowedValue(value, allowed)!;
      warnings.push({
        rowId: row.id,
        field,
        nearest,
        message: `Off-spec — nearest allowed: ${nearest}`,
      });
    }
  }
  return warnings;
}

// ── Bulk-add parsing (Fix E) ──────────────────────────────────────────────────

/**
 * Parse a raw paste string into new allowed values to add for a field.
 * - Splits on comma and newline (handles Excel column paste + CSV-style lists).
 * - Trims each part, caps at 100 chars.
 * - Drops empties.
 * - Dedupes against the existing allowed list (case-insensitive) AND within the new values.
 * Returns only the truly-new values to add.
 *
 * Pure function — safe for unit tests.
 */
export function parseAllowedValuePaste(raw: string, existing: string[]): string[] {
  const parts = raw.split(/[,\n]+/);
  const result: string[] = [];
  const seen = new Set(existing.map((v) => v.toLowerCase()));
  for (const part of parts) {
    const trimmed = part.trim().slice(0, 100);
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    result.push(trimmed);
  }
  return result;
}

// ── Serialization helpers (backward-compat, null-safe) ────────────────────────

/**
 * Serialize a UtmSpec to a plain JSON-safe object.
 * The result is embedded inside SharePayload / Campaign — not a standalone string.
 */
export function serializeSpec(spec: UtmSpec): object {
  return {
    allowedValues: spec.allowedValues,
    enforceSpec: spec.enforceSpec,
  };
}

/**
 * Deserialize a UtmSpec from an unknown JSON-parsed value.
 * Returns DEFAULT_SPEC on any structural mismatch (backward compat:
 * old campaigns / old share links that lack a spec field are treated as
 * having an empty, unenforced spec).
 */
export function deserializeSpec(v: unknown): UtmSpec {
  if (!v || typeof v !== "object") return DEFAULT_SPEC;
  const obj = v as Record<string, unknown>;

  const enforceSpec = typeof obj.enforceSpec === "boolean" ? obj.enforceSpec : false;

  const allowedValues: SpecAllowedValues = {
    utm_source: [],
    utm_medium: [],
    utm_campaign: [],
    utm_term: [],
    utm_content: [],
  };
  if (obj.allowedValues && typeof obj.allowedValues === "object") {
    const av = obj.allowedValues as Record<string, unknown>;
    for (const field of UTM_FIELDS) {
      const list = av[field];
      if (Array.isArray(list)) {
        allowedValues[field] = list
          .filter((x): x is string => typeof x === "string")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
  }

  return { allowedValues, enforceSpec };
}
