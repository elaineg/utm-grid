/**
 * Unit tests for lib/namingTemplate.ts
 * Covers: compose, validateCampaignName (matching/wrong-count/bad-token/enforce-off/empty-template),
 * deserializeNamingTemplate (backward compat), previewPattern.
 */

import { describe, expect, it } from "vitest";
import {
  composeCampaignName,
  DEFAULT_NAMING_TEMPLATE,
  deserializeNamingTemplate,
  formatOffTemplateMessage,
  previewPattern,
  serializeNamingTemplate,
  validateCampaignName,
  type NamingTemplate,
} from "./namingTemplate";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const THREE_SEG_TEMPLATE: NamingTemplate = {
  segments: [
    { name: "quarter", allowedTokens: [] },
    { name: "channel", allowedTokens: ["paidsocial", "email"] },
    { name: "audience", allowedTokens: [] },
  ],
  separator: "_",
  enforceTemplate: true,
};

const NO_ALLOWED_TEMPLATE: NamingTemplate = {
  segments: [
    { name: "part1", allowedTokens: [] },
    { name: "part2", allowedTokens: [] },
  ],
  separator: "_",
  enforceTemplate: true,
};

// ── composeCampaignName ────────────────────────────────────────────────────

describe("composeCampaignName", () => {
  it("joins tokens with _ separator", () => {
    expect(composeCampaignName(["2026q3", "paidsocial", "retargeting"], "_")).toBe(
      "2026q3_paidsocial_retargeting"
    );
  });

  it("joins tokens with - separator", () => {
    expect(composeCampaignName(["2026q3", "paidsocial"], "-")).toBe(
      "2026q3-paidsocial"
    );
  });

  it("returns empty string for empty tokens", () => {
    expect(composeCampaignName([], "_")).toBe("");
  });

  it("handles single token", () => {
    expect(composeCampaignName(["spring_sale"], "_")).toBe("spring_sale");
  });

  it("preserves empty segment strings (partial fill)", () => {
    expect(composeCampaignName(["2026q3", "", "retargeting"], "_")).toBe(
      "2026q3__retargeting"
    );
  });
});

// ── validateCampaignName ─────────────────────────────────────────────────────

describe("validateCampaignName — enforce off", () => {
  it("returns null when enforceTemplate is false", () => {
    const template: NamingTemplate = { ...THREE_SEG_TEMPLATE, enforceTemplate: false };
    expect(validateCampaignName("bad_value", template)).toBeNull();
  });
});

describe("validateCampaignName — empty template", () => {
  it("returns null when template has no segments (empty template)", () => {
    const template: NamingTemplate = { ...DEFAULT_NAMING_TEMPLATE, enforceTemplate: true };
    expect(validateCampaignName("anything", template)).toBeNull();
  });
});

describe("validateCampaignName — empty value", () => {
  it("returns null for empty utm_campaign (handled by required-param lint)", () => {
    expect(validateCampaignName("", THREE_SEG_TEMPLATE)).toBeNull();
    expect(validateCampaignName("   ", THREE_SEG_TEMPLATE)).toBeNull();
  });
});

describe("validateCampaignName — matching value", () => {
  it("returns null for a valid 3-segment value with allowed tokens", () => {
    // channel = paidsocial (in allowed list), quarter/audience = any text
    expect(validateCampaignName("2026q3_paidsocial_retargeting", THREE_SEG_TEMPLATE)).toBeNull();
  });

  it("returns null for valid value with email token", () => {
    expect(validateCampaignName("2026q3_email_retargeting", THREE_SEG_TEMPLATE)).toBeNull();
  });

  it("returns null for a valid 2-segment value when template has 2 segments (no allowed)", () => {
    expect(validateCampaignName("hello_world", NO_ALLOWED_TEMPLATE)).toBeNull();
  });
});

describe("validateCampaignName — wrong segment count", () => {
  it("returns wrong-count when fewer segments (2 vs expected 3)", () => {
    const result = validateCampaignName("2026q3_paidsocial", THREE_SEG_TEMPLATE);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe("wrong-count");
    if (result?.kind === "wrong-count") {
      expect(result.expected).toBe(3);
      expect(result.found).toBe(2);
    }
  });

  it("returns wrong-count when more segments (4 vs expected 3)", () => {
    const result = validateCampaignName("2026q3_paidsocial_retargeting_extra", THREE_SEG_TEMPLATE);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe("wrong-count");
    if (result?.kind === "wrong-count") {
      expect(result.expected).toBe(3);
      expect(result.found).toBe(4);
    }
  });

  it("wrong-count message: 'expected 3 segments, found 2'", () => {
    const result = validateCampaignName("2026q3_paidsocial", THREE_SEG_TEMPLATE);
    expect(result).not.toBeNull();
    expect(formatOffTemplateMessage(result!)).toBe(
      "Off-template — expected 3 segments, found 2"
    );
  });
});

describe("validateCampaignName — bad token", () => {
  it("returns bad-token when segment token not in allowed list", () => {
    const result = validateCampaignName("2026q3_organic_retargeting", THREE_SEG_TEMPLATE);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe("bad-token");
    if (result?.kind === "bad-token") {
      expect(result.segmentName).toBe("channel");
      expect(result.allowedTokens).toEqual(["paidsocial", "email"]);
      expect(result.value).toBe("organic");
    }
  });

  it("bad-token message names the segment and allowed tokens", () => {
    const result = validateCampaignName("2026q3_organic_retargeting", THREE_SEG_TEMPLATE);
    expect(result).not.toBeNull();
    expect(formatOffTemplateMessage(result!)).toBe(
      'Off-template — segment "channel" must be one of: paidsocial, email'
    );
  });

  it("bad-token check is case-insensitive", () => {
    // "PAIDSOCIAL" should match "paidsocial" case-insensitively → no warning
    expect(validateCampaignName("2026q3_PAIDSOCIAL_retargeting", THREE_SEG_TEMPLATE)).toBeNull();
  });

  it("any-text segment (no allowed tokens) never triggers bad-token", () => {
    // quarter and audience have no allowed tokens — any value is fine
    const result = validateCampaignName("anything_paidsocial_anything-at-all", THREE_SEG_TEMPLATE);
    expect(result).toBeNull();
  });
});

describe("validateCampaignName — separator change", () => {
  it("validates with dash separator", () => {
    const dashTemplate: NamingTemplate = { ...THREE_SEG_TEMPLATE, separator: "-" };
    expect(validateCampaignName("2026q3-paidsocial-retargeting", dashTemplate)).toBeNull();
    // Underscore separator with dash template → wrong count (not split correctly)
    const result = validateCampaignName("2026q3_paidsocial_retargeting", dashTemplate);
    expect(result?.kind).toBe("wrong-count");
  });
});

// ── deserializeNamingTemplate ─────────────────────────────────────────────────

describe("deserializeNamingTemplate — backward compat", () => {
  it("returns DEFAULT_NAMING_TEMPLATE for null (field absent in old payloads)", () => {
    const result = deserializeNamingTemplate(null);
    expect(result.segments).toHaveLength(0);
    expect(result.enforceTemplate).toBe(false);
    expect(result.separator).toBe("_");
  });

  it("returns DEFAULT_NAMING_TEMPLATE for undefined", () => {
    const result = deserializeNamingTemplate(undefined);
    expect(result.segments).toHaveLength(0);
    expect(result.enforceTemplate).toBe(false);
  });

  it("returns DEFAULT_NAMING_TEMPLATE for a non-object (e.g. a number)", () => {
    expect(deserializeNamingTemplate(42).segments).toHaveLength(0);
  });

  it("deserializes a full template correctly", () => {
    const raw = {
      segments: [
        { name: "quarter", allowedTokens: [] },
        { name: "channel", allowedTokens: ["paidsocial", "email"] },
      ],
      separator: "_",
      enforceTemplate: true,
    };
    const result = deserializeNamingTemplate(raw);
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0].name).toBe("quarter");
    expect(result.segments[1].allowedTokens).toEqual(["paidsocial", "email"]);
    expect(result.enforceTemplate).toBe(true);
    expect(result.separator).toBe("_");
  });

  it("deserializes dash separator", () => {
    const raw = { segments: [], separator: "-", enforceTemplate: false };
    const result = deserializeNamingTemplate(raw);
    expect(result.separator).toBe("-");
  });

  it("defaults separator to _ for invalid separator value", () => {
    const raw = { segments: [], separator: "/", enforceTemplate: false };
    const result = deserializeNamingTemplate(raw);
    expect(result.separator).toBe("_");
  });

  it("skips nameless segments during deserialization", () => {
    const raw = {
      segments: [
        { name: "quarter", allowedTokens: [] },
        { name: "", allowedTokens: ["foo"] }, // empty name → skipped
        { name: "   ", allowedTokens: [] },   // whitespace-only → skipped
        { name: "channel", allowedTokens: ["paidsocial"] },
      ],
      separator: "_",
      enforceTemplate: true,
    };
    const result = deserializeNamingTemplate(raw);
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0].name).toBe("quarter");
    expect(result.segments[1].name).toBe("channel");
  });

  it("strips non-string token values", () => {
    const raw = {
      segments: [{ name: "channel", allowedTokens: ["ok", 42, null, "also-ok"] }],
      separator: "_",
      enforceTemplate: false,
    };
    const result = deserializeNamingTemplate(raw);
    expect(result.segments[0].allowedTokens).toEqual(["ok", "also-ok"]);
  });
});

// ── serializeNamingTemplate round-trip ────────────────────────────────────────

describe("serializeNamingTemplate / deserializeNamingTemplate round-trip", () => {
  it("round-trips an empty template", () => {
    const rt = deserializeNamingTemplate(serializeNamingTemplate(DEFAULT_NAMING_TEMPLATE));
    expect(rt.segments).toHaveLength(0);
    expect(rt.enforceTemplate).toBe(false);
    expect(rt.separator).toBe("_");
  });

  it("round-trips a full template with allowed tokens", () => {
    const rt = deserializeNamingTemplate(serializeNamingTemplate(THREE_SEG_TEMPLATE));
    expect(rt.segments).toHaveLength(3);
    expect(rt.segments[1].name).toBe("channel");
    expect(rt.segments[1].allowedTokens).toEqual(["paidsocial", "email"]);
    expect(rt.enforceTemplate).toBe(true);
    expect(rt.separator).toBe("_");
  });

  it("round-trips via JSON.stringify + JSON.parse (full persistence simulation)", () => {
    const serialized = JSON.stringify(serializeNamingTemplate(THREE_SEG_TEMPLATE));
    const parsed = JSON.parse(serialized) as unknown;
    const rt = deserializeNamingTemplate(parsed);
    expect(rt.segments).toHaveLength(3);
    expect(rt.segments[1].allowedTokens).toEqual(["paidsocial", "email"]);
    expect(rt.enforceTemplate).toBe(true);
  });
});

// ── previewPattern ─────────────────────────────────────────────────────────────

describe("previewPattern", () => {
  it("returns empty string for empty template", () => {
    expect(previewPattern(DEFAULT_NAMING_TEMPLATE)).toBe("");
  });

  it("joins segment names with _ separator", () => {
    expect(previewPattern(THREE_SEG_TEMPLATE)).toBe("quarter_channel_audience");
  });

  it("joins segment names with - separator", () => {
    const dashTemplate: NamingTemplate = { ...THREE_SEG_TEMPLATE, separator: "-" };
    expect(previewPattern(dashTemplate)).toBe("quarter-channel-audience");
  });

  it("uses … for unnamed segments", () => {
    const withEmpty: NamingTemplate = {
      segments: [{ name: "", allowedTokens: [] }, { name: "channel", allowedTokens: [] }],
      separator: "_",
      enforceTemplate: false,
    };
    expect(previewPattern(withEmpty)).toBe("…_channel");
  });
});
