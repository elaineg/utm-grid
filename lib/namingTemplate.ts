/**
 * Campaign Naming Template — pure, client-side, zero network.
 *
 * A NamingTemplate defines the STRUCTURE of utm_campaign values:
 * an ordered list of named segments, each optionally restricted to
 * a list of allowed tokens, plus a separator and an enforce toggle.
 *
 * Distinct from UTM Spec: the Spec governs allowed VALUES per field;
 * the Naming Template governs the COMPOSITION of utm_campaign specifically.
 *
 * Example: segments [quarter, channel, audience] with separator "_"
 *   → a valid campaign might be "2026q3_paidsocial_retargeting"
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NamingSegment {
  /** Human-readable name for the segment (e.g. "quarter", "channel"). */
  name: string;
  /**
   * Optional allowed-token list. An empty array means "any text".
   * When non-empty, a segment value must be one of these tokens.
   */
  allowedTokens: string[];
}

export interface NamingTemplate {
  /** Ordered list of segments defining the campaign name structure. */
  segments: NamingSegment[];
  /** Join separator between segments. Default "_". */
  separator: "_" | "-";
  /**
   * When true: non-empty utm_campaign values that don't match the template
   * structure generate off-template lint warnings.
   * When false (or template has no segments): no warnings.
   */
  enforceTemplate: boolean;
}

export const DEFAULT_NAMING_TEMPLATE: NamingTemplate = {
  segments: [],
  separator: "_",
  enforceTemplate: false,
};

// ── Off-template lint result ──────────────────────────────────────────────────

export type OffTemplateWarning =
  | { kind: "wrong-count"; expected: number; found: number }
  | { kind: "bad-token"; segmentName: string; allowedTokens: string[]; value: string };

/**
 * Validate a single utm_campaign value against a NamingTemplate.
 *
 * Returns null when:
 *   - The template has no segments (nothing to validate).
 *   - enforceTemplate is false.
 *   - The campaign value is empty (empty is handled by required-param lint).
 *   - The value fully matches the template.
 *
 * Returns an OffTemplateWarning describing exactly what's wrong otherwise.
 *
 * Pure function — no side-effects.
 */
export function validateCampaignName(
  campaignValue: string,
  template: NamingTemplate
): OffTemplateWarning | null {
  const { segments, separator, enforceTemplate } = template;

  // No enforcement or no segments → always valid.
  if (!enforceTemplate) return null;
  if (segments.length === 0) return null;

  const value = campaignValue.trim();
  // Empty values are handled by required-param lint, not here.
  if (value === "") return null;

  const parts = value.split(separator);

  // Wrong segment count.
  if (parts.length !== segments.length) {
    return { kind: "wrong-count", expected: segments.length, found: parts.length };
  }

  // Check each part against its segment's allowed tokens (case-insensitive).
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.allowedTokens.length === 0) continue; // "any text" — always valid
    const part = parts[i];
    const isAllowed = seg.allowedTokens.some(
      (t) => t.toLowerCase() === part.toLowerCase()
    );
    if (!isAllowed) {
      return {
        kind: "bad-token",
        segmentName: seg.name,
        allowedTokens: seg.allowedTokens,
        value: part,
      };
    }
  }

  return null; // all segments match
}

/**
 * Format an OffTemplateWarning as a human-readable lint message.
 * Matches the exact wording in the spec's Success checks.
 */
export function formatOffTemplateMessage(warning: OffTemplateWarning): string {
  if (warning.kind === "wrong-count") {
    return `Off-template — expected ${warning.expected} segment${warning.expected === 1 ? "" : "s"}, found ${warning.found}`;
  }
  return `Off-template — segment "${warning.segmentName}" must be one of: ${warning.allowedTokens.join(", ")}`;
}

/**
 * Compose a utm_campaign value from per-segment token values.
 * Joins with the separator. If a token is missing/empty for a segment,
 * that part is left as an empty string (the resulting value will lint
 * as wrong-count if enforceTemplate is on).
 *
 * Pure function — no side-effects.
 */
export function composeCampaignName(
  tokens: string[],
  separator: "_" | "-"
): string {
  return tokens.join(separator);
}

// ── Serialization helpers (backward-compat, null-safe) ────────────────────────

/**
 * Serialize a NamingTemplate to a plain JSON-safe object.
 * Embedded inside SharePayload / Campaign / WorkspacePayload.
 */
export function serializeNamingTemplate(template: NamingTemplate): object {
  return {
    segments: template.segments,
    separator: template.separator,
    enforceTemplate: template.enforceTemplate,
  };
}

/**
 * Deserialize a NamingTemplate from an unknown JSON-parsed value.
 * Returns DEFAULT_NAMING_TEMPLATE on any structural mismatch (backward compat:
 * old campaigns / share links / workspaces that lack a namingTemplate field are
 * treated as having an empty, unenforced template).
 */
export function deserializeNamingTemplate(v: unknown): NamingTemplate {
  if (!v || typeof v !== "object") return DEFAULT_NAMING_TEMPLATE;
  const obj = v as Record<string, unknown>;

  const enforceTemplate =
    typeof obj.enforceTemplate === "boolean" ? obj.enforceTemplate : false;

  const rawSep = obj.separator;
  const separator: "_" | "-" =
    rawSep === "-" ? "-" : "_";

  const segments: NamingSegment[] = [];
  if (Array.isArray(obj.segments)) {
    for (const seg of obj.segments) {
      if (!seg || typeof seg !== "object") continue;
      const s = seg as Record<string, unknown>;
      const name = typeof s.name === "string" ? s.name.trim() : "";
      if (!name) continue; // skip nameless segments
      const allowedTokens: string[] = [];
      if (Array.isArray(s.allowedTokens)) {
        for (const t of s.allowedTokens) {
          if (typeof t === "string" && t.trim()) {
            allowedTokens.push(t.trim());
          }
        }
      }
      segments.push({ name, allowedTokens });
    }
  }

  return { segments, separator, enforceTemplate };
}

/**
 * Return a live pattern preview string for the given template,
 * e.g. "quarter_channel_audience" or "quarter-channel-audience".
 * Shows segment names (not tokens) joined by the separator.
 * Returns an empty string when there are no segments.
 */
export function previewPattern(template: NamingTemplate): string {
  if (template.segments.length === 0) return "";
  return template.segments.map((s) => s.name || "…").join(template.separator);
}
