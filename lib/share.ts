/**
 * Client-side grid sharing via URL hash.
 * State is compressed with lz-string and stored in the URL hash as #g=<compressed>.
 * Nothing is sent to any server.
 */
import LZString from "lz-string";
import { UTM_FIELDS, type LintSettings, type UtmRow } from "./types";
import { deserializeSpec, type UtmSpec } from "./spec";

export interface SharePayload {
  rows: UtmRow[];
  settings: LintSettings;
  /** Optional UTM Spec — absent in old share links (backward compat: treated as empty/unenforced). */
  spec?: UtmSpec;
}

/**
 * Serialize grid state to a compressed, URL-safe string.
 */
export function encodeSharePayload(payload: SharePayload): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

/**
 * Decode a share hash value (the part after #g=) back to a SharePayload.
 * Returns null if the value is missing, malformed, or undecompressable.
 */
export function decodeSharePayload(compressed: string): SharePayload | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    const parsed = JSON.parse(json) as unknown;
    if (!isSharePayload(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Parse the current window.location.hash and return the share payload if present.
 */
export function parseShareHash(hash: string): SharePayload | null {
  if (!hash.startsWith("#g=")) return null;
  return decodeSharePayload(hash.slice(3));
}

/**
 * Build the shareable URL for the current page + grid state.
 */
export function buildShareUrl(payload: SharePayload): string {
  const compressed = encodeSharePayload(payload);
  const url = new URL(window.location.href);
  url.hash = `g=${compressed}`;
  return url.toString();
}

/**
 * Write text to clipboard. Falls back to an execCommand textarea approach
 * when navigator.clipboard is unavailable (e.g. HTTP or blocked context).
 */
export async function writeClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // fall through to execCommand fallback
    }
  }
  // execCommand fallback
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.top = "-9999px";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

/**
 * Returns true if the provided raw JSON string (the serialized UtmRow[])
 * contains any row with a non-empty baseUrl or utm_* field.
 * Accepts the raw localStorage value so it can be called from unit tests
 * without a DOM.  Returns false on null, empty string, or parse errors.
 */
export function rawStoredHasContent(raw: string | null): boolean {
  if (!raw) return false;
  try {
    const rows = JSON.parse(raw) as unknown;
    if (!Array.isArray(rows) || rows.length === 0) return false;
    return (rows as UtmRow[]).some(
      (r) =>
        typeof r === "object" &&
        r !== null &&
        (String(r.baseUrl ?? "").trim() !== "" ||
          UTM_FIELDS.some((f) => String(r[f] ?? "").trim() !== ""))
    );
  } catch {
    return false;
  }
}

/**
 * Reads the stored working grid directly from localStorage (bypassing React
 * state) and returns true if any row has a non-empty baseUrl or any utm_*
 * field.  Safe to call inside a client useEffect; never call during SSR render.
 *
 * This is intentionally NOT a React hook — it is a plain function so it can be
 * called inside the share-hash useEffect where the React-state closure may
 * still hold the initial empty value due to useSyncExternalStore SSR safety.
 */
export function storedGridHasContent(storageKey = "utm-grid:rows"): boolean {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return rawStoredHasContent(raw);
  } catch {
    return false;
  }
}

// ── Runtime type guard ────────────────────────────────────────────────────────

function isSharePayload(v: unknown): v is SharePayload {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  if (!Array.isArray(obj.rows)) return false;
  if (!obj.settings || typeof obj.settings !== "object") return false;
  // Light structural check — enough to catch corrupt blobs
  const rows = obj.rows as unknown[];
  if (
    rows.length > 0 &&
    (typeof (rows[0] as Record<string, unknown>).id !== "string" ||
      typeof (rows[0] as Record<string, unknown>).baseUrl !== "string")
  ) {
    return false;
  }
  const s = obj.settings as Record<string, unknown>;
  if (
    typeof s.requiredParams !== "boolean" ||
    typeof s.lowercaseOnly !== "boolean" ||
    typeof s.noSpaces !== "boolean"
  ) {
    return false;
  }
  // spec is optional — old share links without it are valid (backward compat).
  return true;
}

/**
 * Parse a SharePayload's spec field (may be absent in old links).
 * Returns deserializeSpec(payload.spec) — defaults to empty/unenforced on absence.
 */
export function extractSpecFromPayload(payload: SharePayload): UtmSpec {
  return deserializeSpec(payload.spec);
}
