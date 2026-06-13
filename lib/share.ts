/**
 * Client-side grid sharing via URL hash.
 * State is compressed with lz-string and stored in the URL hash as #g=<compressed>.
 * Nothing is sent to any server.
 */
import LZString from "lz-string";
import type { LintSettings, UtmRow } from "./types";

export interface SharePayload {
  rows: UtmRow[];
  settings: LintSettings;
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
  return true;
}
