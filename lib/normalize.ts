import type { LintSettings, UtmRow } from "./types";
import { UTM_FIELDS } from "./types";

/**
 * Normalize a single UTM cell value according to the active lint settings.
 *
 * - `lowercaseOnly` on → convert to lowercase.
 * - `noSpaces` on → replace runs of whitespace and separator chars (`-` / `_` /
 *   mixed) with `_`.
 *
 * The function is pure: it never touches row data directly.
 */
export function normalizeValue(value: string, settings: Pick<LintSettings, "lowercaseOnly" | "noSpaces">): string {
  // P1-2: trim leading/trailing whitespace FIRST so a stray trailing space never
  // becomes a trailing underscore (e.g. "Instagram " → "instagram", not "instagram_").
  let v = value.trim();
  if (settings.lowercaseOnly) v = v.toLowerCase();
  if (settings.noSpaces) v = v.replace(/[\s\-]+/g, "_");
  // FIX C-2 (My Workspaces Round 3): strip leading/trailing non-alphanumeric punctuation
  // so e.g. "Launch Day!" → "launch_day" (the "!" is stripped).
  // Conservative: only trim edge characters that are not alphanumeric, underscore, or hyphen.
  // Mid-value characters (internal separators, alphanumerics) are preserved.
  v = v.replace(/^[^a-zA-Z0-9_-]+|[^a-zA-Z0-9_-]+$/g, "");
  return v;
}

/**
 * Returns true when a cell value can be auto-fixed by `normalizeValue` and
 * the fixed result actually differs from the original.
 */
export function isCellFixable(value: string, settings: Pick<LintSettings, "lowercaseOnly" | "noSpaces">): boolean {
  const fixed = normalizeValue(value, settings);
  return fixed !== value;
}

/**
 * Apply normalization to every UTM field in a single row that has lint
 * warnings fixable by normalization. Returns the updated row (or the same
 * reference if nothing changed).
 */
export function normalizeRow(row: UtmRow, settings: LintSettings): UtmRow {
  let changed = false;
  const updated = { ...row };
  for (const f of UTM_FIELDS) {
    const fixed = normalizeValue(row[f], settings);
    if (fixed !== row[f]) {
      updated[f] = fixed;
      changed = true;
    }
  }
  return changed ? updated : row;
}

/**
 * Apply normalization to every row in the grid.
 * Returns a new array only when at least one cell changed; otherwise returns
 * the same reference.
 */
export function normalizeAllRows(rows: UtmRow[], settings: LintSettings): { rows: UtmRow[]; count: number } {
  // count = number of CELLS changed (not rows), so the toast says "Auto-fixed 3 cells" not "1".
  let cellCount = 0;
  let anyRowChanged = false;
  const updated = rows.map((r) => {
    let changed = false;
    const result = { ...r };
    for (const f of UTM_FIELDS) {
      const fixed = normalizeValue(r[f], settings);
      if (fixed !== r[f]) {
        result[f] = fixed;
        cellCount++;
        changed = true;
      }
    }
    if (changed) { anyRowChanged = true; return result as UtmRow; }
    return r;
  });
  return { rows: anyRowChanged ? updated : rows, count: cellCount };
}
