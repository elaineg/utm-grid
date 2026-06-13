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
  let v = value;
  if (settings.lowercaseOnly) v = v.toLowerCase();
  if (settings.noSpaces) v = v.replace(/[\s\-]+/g, "_");
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
  let count = 0;
  const updated = rows.map((r) => {
    const next = normalizeRow(r, settings);
    if (next !== r) count++;
    return next;
  });
  return { rows: count > 0 ? updated : rows, count };
}
