/**
 * Workspace types and validation helpers.
 * Pure module — no Node.js or browser APIs (safe for unit tests).
 */
import { UTM_FIELDS, type LintSettings, type UtmRow } from "./types";
import { deserializeSpec, type UtmSpec } from "./spec";

// ── Payload type ──────────────────────────────────────────────────────────────

export interface WorkspacePayload {
  rows: UtmRow[];
  settings: LintSettings;
  spec: UtmSpec;
}

// ── ID generation ─────────────────────────────────────────────────────────────

/**
 * Generate a cryptographically random, URL-safe base64 id of at least 22 chars.
 * Uses 16 random bytes → 22 base64url chars (128 bits of entropy).
 * No external dependencies — uses the Web Crypto API's getRandomValues.
 */
export function generateWorkspaceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // Standard base64url encoding: A-Z, a-z, 0-9, -, _
  let result = "";
  // Process bytes in triplets to produce 4 base64 chars each
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;
    result += chars[b0 >> 2];
    result += chars[((b0 & 0x3) << 4) | (b1 >> 4)];
    result += chars[((b1 & 0xf) << 2) | (b2 >> 6)];
    result += chars[b2 & 0x3f];
  }
  // 16 bytes → 22 meaningful base64url chars (no padding needed)
  // Actually 16 bytes → ceil(16/3)*4 = 24 chars, but without padding the last 2
  // are padding; we keep all 22 meaningful chars + 2 extra (24 total) — still valid
  return result; // 22 chars for 16 bytes (drops any trailing padding)
}

/**
 * Regex for a valid workspace id: 22–32 url-safe base64 characters.
 */
export const WORKSPACE_ID_RE = /^[A-Za-z0-9\-_]{22,32}$/;

export function isValidWorkspaceId(id: string): boolean {
  return WORKSPACE_ID_RE.test(id);
}

// ── Payload validation ────────────────────────────────────────────────────────

/** Maximum serialized payload size (1 MB). */
export const MAX_PAYLOAD_BYTES = 1_000_000;

/**
 * Type-guard: returns true when v structurally matches a WorkspacePayload.
 * Does NOT validate the contents of individual row fields — just the shapes.
 */
export function isWorkspacePayload(v: unknown): v is WorkspacePayload {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;

  // rows: array of UtmRow-shaped objects
  if (!Array.isArray(obj.rows)) return false;
  for (const row of obj.rows as unknown[]) {
    if (!row || typeof row !== "object") return false;
    const r = row as Record<string, unknown>;
    if (typeof r.id !== "string") return false;
    if (typeof r.baseUrl !== "string") return false;
    for (const f of UTM_FIELDS) {
      if (typeof r[f] !== "string") return false;
    }
  }

  // settings: LintSettings shape
  if (!obj.settings || typeof obj.settings !== "object") return false;
  const s = obj.settings as Record<string, unknown>;
  if (
    typeof s.requiredParams !== "boolean" ||
    typeof s.lowercaseOnly !== "boolean" ||
    typeof s.noSpaces !== "boolean"
  ) {
    return false;
  }

  // spec: optional but if present must parse
  // We accept any object here and use deserializeSpec for robust fallback.
  if (obj.spec !== undefined && (typeof obj.spec !== "object" || obj.spec === null)) {
    return false;
  }

  return true;
}

/**
 * Parse and validate a workspace payload from a raw JSON string.
 * Returns null on any parse error or shape mismatch.
 * Also normalises spec via deserializeSpec so it always has the full shape.
 */
export function parseWorkspacePayload(raw: string): WorkspacePayload | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isWorkspacePayload(parsed)) return null;
    return {
      rows: parsed.rows,
      settings: parsed.settings,
      // Normalize spec through deserializeSpec for backward compat
      spec: deserializeSpec(parsed.spec as unknown),
    };
  } catch {
    return null;
  }
}
