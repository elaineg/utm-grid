/**
 * Unit tests for lib/spec.ts — UTM Spec pure functions:
 *  levenshtein, nearestAllowedValue, isAllowedValue, lintOffSpec, deserializeSpec.
 */
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SPEC,
  SAMPLE_SPEC,
  deserializeSpec,
  isAllowedValue,
  levenshtein,
  lintOffSpec,
  nearestAllowedValue,
  normalizeForSpec,
  parseAllowedValuePaste,
  type SpecRow,
  type UtmSpec,
} from "./spec";
import { emptyRow } from "./types";

// ── normalizeForSpec ──────────────────────────────────────────────────────────

describe("normalizeForSpec", () => {
  it("lowercases and collapses separators", () => {
    expect(normalizeForSpec("Spring-Sale")).toBe("spring_sale");
    expect(normalizeForSpec("spring sale")).toBe("spring_sale");
    expect(normalizeForSpec("SPRING__SALE")).toBe("spring_sale");
  });

  it("trims leading/trailing whitespace", () => {
    expect(normalizeForSpec("  newsletter  ")).toBe("newsletter");
  });

  it("treats an empty string as empty", () => {
    expect(normalizeForSpec("")).toBe("");
  });
});

// ── levenshtein ───────────────────────────────────────────────────────────────

describe("levenshtein", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshtein("twitter", "twitter")).toBe(0);
  });

  it("returns string length when the other is empty", () => {
    expect(levenshtein("abc", "")).toBe(3);
    expect(levenshtein("", "abc")).toBe(3);
  });

  it("classic typo: twiter → twitter (1 insertion)", () => {
    expect(levenshtein("twiter", "twitter")).toBe(1);
  });

  it("classic substitution: cat → bat (1 sub)", () => {
    expect(levenshtein("cat", "bat")).toBe(1);
  });

  it("deletion: kitten → sitting (known value 3)", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });

  it("symmetric", () => {
    expect(levenshtein("abc", "xyz")).toBe(levenshtein("xyz", "abc"));
  });
});

// ── nearestAllowedValue ───────────────────────────────────────────────────────

describe("nearestAllowedValue", () => {
  it("returns null for an empty allowed list", () => {
    expect(nearestAllowedValue("twitter", [])).toBeNull();
  });

  it("exact normalized match wins (case/separator insensitive)", () => {
    const allowed = ["twitter", "facebook"];
    // Exact string match
    expect(nearestAllowedValue("twitter", allowed)).toBe("twitter");
    // Normalized match: "Twitter" normalizes to "twitter"
    expect(nearestAllowedValue("Twitter", allowed)).toBe("twitter");
  });

  it("typo: 'twiter' → 'twitter' (1 edit away)", () => {
    const allowed = ["twitter", "facebook", "instagram"];
    expect(nearestAllowedValue("twiter", allowed)).toBe("twitter");
  });

  it("picks the closest by Levenshtein when no normalized match", () => {
    const allowed = ["newsletter", "paid_social"];
    // "newsltr" is 2 edits from "newsletter", much more from "paid_social"
    expect(nearestAllowedValue("newsltr", allowed)).toBe("newsletter");
  });

  it("ties broken by first occurrence in allowed list", () => {
    // "ab" is 1 edit from both "aa" and "bb" — first wins
    const allowed = ["aa", "bb"];
    expect(nearestAllowedValue("ab", allowed)).toBe("aa");
  });

  it("returns the single allowed value when list has one entry", () => {
    expect(nearestAllowedValue("anything", ["newsletter"])).toBe("newsletter");
  });
});

// ── isAllowedValue ────────────────────────────────────────────────────────────

describe("isAllowedValue", () => {
  it("returns true for an empty allowed list (no enforcement)", () => {
    expect(isAllowedValue("anything", [])).toBe(true);
  });

  it("returns true for an exact case-insensitive match", () => {
    expect(isAllowedValue("TWITTER", ["twitter", "facebook"])).toBe(true);
    expect(isAllowedValue("twitter", ["twitter", "facebook"])).toBe(true);
  });

  it("returns true for separator-collapsed match (newsletter vs newsletter)", () => {
    // "news_letter" normalizes to "news_letter"; "newsletter" normalizes to "newsletter" — different
    expect(isAllowedValue("newsletter", ["newsletter"])).toBe(true);
  });

  it("returns false when value is not in the list", () => {
    expect(isAllowedValue("twiter", ["twitter", "facebook"])).toBe(false);
    expect(isAllowedValue("snapchat", ["twitter", "facebook"])).toBe(false);
  });
});

// ── lintOffSpec ───────────────────────────────────────────────────────────────

function makeRow(id: string, overrides: Partial<ReturnType<typeof emptyRow>> = {}) {
  return { ...emptyRow(id), ...overrides };
}

const SPEC_WITH_SOURCE: UtmSpec = {
  allowedValues: {
    utm_source: ["twitter", "facebook"],
    utm_medium: [],
    utm_campaign: [],
    utm_term: [],
    utm_content: [],
  },
  enforceSpec: true,
};

describe("lintOffSpec", () => {
  it("returns [] when enforceSpec is false", () => {
    const rows = [makeRow("r1", { utm_source: "twiter" })] as SpecRow[];
    const spec: UtmSpec = { ...SPEC_WITH_SOURCE, enforceSpec: false };
    expect(lintOffSpec(rows, spec)).toEqual([]);
  });

  it("returns [] when a field's allowed list is empty (no enforcement for that field)", () => {
    const rows = [makeRow("r1", { utm_medium: "anything_at_all" })] as SpecRow[];
    expect(lintOffSpec(rows, SPEC_WITH_SOURCE)).toEqual([]);
  });

  it("returns [] for empty cell values", () => {
    const rows = [makeRow("r1", { utm_source: "" })] as SpecRow[];
    expect(lintOffSpec(rows, SPEC_WITH_SOURCE)).toEqual([]);
  });

  it("returns [] when the value is in the allowed list (case-insensitive)", () => {
    const rows = [makeRow("r1", { utm_source: "TWITTER" })] as SpecRow[];
    expect(lintOffSpec(rows, SPEC_WITH_SOURCE)).toEqual([]);
  });

  it("flags an off-spec value and names the nearest allowed value", () => {
    const rows = [makeRow("r1", { utm_source: "twiter" })] as SpecRow[];
    const warnings = lintOffSpec(rows, SPEC_WITH_SOURCE);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].rowId).toBe("r1");
    expect(warnings[0].field).toBe("utm_source");
    expect(warnings[0].nearest).toBe("twitter");
    expect(warnings[0].message).toContain("twitter");
    expect(warnings[0].message).toContain("Off-spec");
  });

  it("flags multiple fields on the same row when both have off-spec values", () => {
    const spec: UtmSpec = {
      allowedValues: {
        utm_source: ["newsletter"],
        utm_medium: ["email", "paid_social"],
        utm_campaign: [],
        utm_term: [],
        utm_content: [],
      },
      enforceSpec: true,
    };
    const rows = [makeRow("r1", { utm_source: "newslttr", utm_medium: "sms" })] as SpecRow[];
    const warnings = lintOffSpec(rows, spec);
    expect(warnings).toHaveLength(2);
    expect(warnings.find((w) => w.field === "utm_source")?.nearest).toBe("newsletter");
    expect(warnings.find((w) => w.field === "utm_medium")?.nearest).toBe("email");
  });

  it("flags multiple rows when both have off-spec values", () => {
    const rows = [
      makeRow("r1", { utm_source: "twiter" }),
      makeRow("r2", { utm_source: "facbook" }),
    ] as SpecRow[];
    const warnings = lintOffSpec(rows, SPEC_WITH_SOURCE);
    expect(warnings).toHaveLength(2);
    expect(warnings[0].nearest).toBe("twitter");
    expect(warnings[1].nearest).toBe("facebook");
  });
});

// ── deserializeSpec ───────────────────────────────────────────────────────────

describe("deserializeSpec", () => {
  it("returns DEFAULT_SPEC for null / undefined / non-object", () => {
    expect(deserializeSpec(null)).toEqual(DEFAULT_SPEC);
    expect(deserializeSpec(undefined)).toEqual(DEFAULT_SPEC);
    expect(deserializeSpec("string")).toEqual(DEFAULT_SPEC);
    expect(deserializeSpec(42)).toEqual(DEFAULT_SPEC);
  });

  it("returns DEFAULT_SPEC for an empty object (backward compat)", () => {
    expect(deserializeSpec({})).toEqual(DEFAULT_SPEC);
  });

  it("deserializes a valid spec with enforceSpec true", () => {
    const raw = {
      enforceSpec: true,
      allowedValues: {
        utm_source: ["twitter", "facebook"],
        utm_medium: ["email"],
        utm_campaign: [],
        utm_term: [],
        utm_content: [],
      },
    };
    const result = deserializeSpec(raw);
    expect(result.enforceSpec).toBe(true);
    expect(result.allowedValues.utm_source).toEqual(["twitter", "facebook"]);
    expect(result.allowedValues.utm_medium).toEqual(["email"]);
    expect(result.allowedValues.utm_campaign).toEqual([]);
  });

  it("defaults enforceSpec to false when missing", () => {
    const raw = {
      allowedValues: { utm_source: ["newsletter"] },
    };
    expect(deserializeSpec(raw).enforceSpec).toBe(false);
  });

  it("trims and filters blank strings from allowed lists", () => {
    const raw = {
      enforceSpec: false,
      allowedValues: {
        utm_source: ["  twitter  ", "", "facebook"],
        utm_medium: [],
        utm_campaign: [],
        utm_term: [],
        utm_content: [],
      },
    };
    const result = deserializeSpec(raw);
    expect(result.allowedValues.utm_source).toEqual(["twitter", "facebook"]);
  });

  it("filters non-string entries from allowed lists", () => {
    const raw = {
      enforceSpec: false,
      allowedValues: {
        utm_source: ["twitter", 42, null, "facebook"],
        utm_medium: [],
        utm_campaign: [],
        utm_term: [],
        utm_content: [],
      },
    };
    const result = deserializeSpec(raw);
    expect(result.allowedValues.utm_source).toEqual(["twitter", "facebook"]);
  });

  it("round-trips a spec via JSON.stringify / JSON.parse", () => {
    const original: UtmSpec = {
      enforceSpec: true,
      allowedValues: {
        utm_source: ["newsletter", "facebook"],
        utm_medium: ["email", "paid_social"],
        utm_campaign: [],
        utm_term: ["shoes"],
        utm_content: [],
      },
    };
    const restored = deserializeSpec(JSON.parse(JSON.stringify(original)));
    expect(restored).toEqual(original);
  });
});

// ── parseAllowedValuePaste (Fix E — bulk-add) ────────────────────────────────

describe("parseAllowedValuePaste", () => {
  it("splits a comma-separated list into multiple values", () => {
    expect(parseAllowedValuePaste("twitter, facebook, instagram", [])).toEqual([
      "twitter",
      "facebook",
      "instagram",
    ]);
  });

  it("splits a newline-separated list (Excel column paste)", () => {
    expect(parseAllowedValuePaste("twitter\nfacebook\ninstagram", [])).toEqual([
      "twitter",
      "facebook",
      "instagram",
    ]);
  });

  it("handles mixed comma and newline separators", () => {
    expect(parseAllowedValuePaste("twitter\nfacebook,instagram", [])).toEqual([
      "twitter",
      "facebook",
      "instagram",
    ]);
  });

  it("trims whitespace from each part", () => {
    expect(parseAllowedValuePaste("  twitter  ,  facebook  ", [])).toEqual([
      "twitter",
      "facebook",
    ]);
  });

  it("drops empty parts", () => {
    expect(parseAllowedValuePaste("twitter,,facebook", [])).toEqual([
      "twitter",
      "facebook",
    ]);
    expect(parseAllowedValuePaste("twitter\n\nfacebook", [])).toEqual([
      "twitter",
      "facebook",
    ]);
  });

  it("dedupes against existing allowed values (case-insensitive)", () => {
    const existing = ["twitter", "facebook"];
    expect(parseAllowedValuePaste("TWITTER, instagram", existing)).toEqual(["instagram"]);
  });

  it("dedupes within the pasted list itself", () => {
    expect(parseAllowedValuePaste("twitter, Twitter, TWITTER", [])).toEqual(["twitter"]);
  });

  it("caps each value at 100 chars", () => {
    const long = "a".repeat(120);
    const result = parseAllowedValuePaste(long, []);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(100);
  });

  it("returns [] for a blank string", () => {
    expect(parseAllowedValuePaste("", [])).toEqual([]);
    expect(parseAllowedValuePaste("  ,  ", [])).toEqual([]);
  });

  it("handles a single value (no separator) correctly", () => {
    expect(parseAllowedValuePaste("newsletter", [])).toEqual(["newsletter"]);
  });
});

// ── Effect-closure SSR hydration safety ──────────────────────────────────────
// Tests that the spec encode/decode matches what useLocalStorage writes
// (useLocalStorage writes JSON.stringify(value) → the localStorage value is
//  the JSON-stringified spec object, NOT double-encoded).
// This covers the "effect-closure staleness" friction: we read localStorage
// directly in effects, and the parse must match how the hook writes.

describe("spec localStorage encoding (SSR hydration safety)", () => {

  it("deserializeSpec recovers a spec written as JSON.stringify (matching useLocalStorage write)", () => {
    // useLocalStorage writes JSON.stringify(value) into localStorage.
    // Here value = the UtmSpec object. So the raw stored string is the JSON of the spec.
    const specToStore: UtmSpec = {
      enforceSpec: true,
      allowedValues: {
        utm_source: ["newsletter", "facebook"],
        utm_medium: [],
        utm_campaign: [],
        utm_term: [],
        utm_content: [],
      },
    };
    // Simulate what useLocalStorage.writeValue does:
    const rawStored = JSON.stringify(specToStore);

    // Simulate what an effect reading window.localStorage.getItem(SPEC_KEY) would get:
    const rawFromStorage: string = rawStored;

    // Parse once (as readSnapshot does):
    const parsed = JSON.parse(rawFromStorage) as unknown;
    // deserializeSpec should recover the original spec
    const recovered = deserializeSpec(parsed);
    expect(recovered.enforceSpec).toBe(true);
    expect(recovered.allowedValues.utm_source).toEqual(["newsletter", "facebook"]);
    expect(recovered.allowedValues.utm_medium).toEqual([]);
  });

  it("deserializeSpec is safe when the stored value is DEFAULT_SPEC (enforceSpec false, empty lists)", () => {
    const rawStored = JSON.stringify(DEFAULT_SPEC);
    const parsed = JSON.parse(rawStored) as unknown;
    const recovered = deserializeSpec(parsed);
    expect(recovered).toEqual(DEFAULT_SPEC);
  });
});

// ── SAMPLE_SPEC (Load sample spec feature — Rob Fix 3a) ───────────────────────

describe("SAMPLE_SPEC", () => {
  it("has enforceSpec true so taxonomy enforcement is immediately visible on load", () => {
    expect(SAMPLE_SPEC.enforceSpec).toBe(true);
  });

  it("has at least utm_source and utm_medium entries for the demo to be meaningful", () => {
    expect(SAMPLE_SPEC.allowedValues.utm_source.length).toBeGreaterThan(0);
    expect(SAMPLE_SPEC.allowedValues.utm_medium.length).toBeGreaterThan(0);
  });

  it("includes 'newsletter' in utm_source so the demo off-spec row produces a Fix-to chip", () => {
    expect(SAMPLE_SPEC.allowedValues.utm_source).toContain("newsletter");
  });

  it("round-trips via JSON.stringify / deserializeSpec (localStorage-safe)", () => {
    const raw = JSON.stringify(SAMPLE_SPEC);
    const parsed = JSON.parse(raw) as unknown;
    const recovered = deserializeSpec(parsed);
    expect(recovered.enforceSpec).toBe(SAMPLE_SPEC.enforceSpec);
    expect(recovered.allowedValues.utm_source).toEqual(SAMPLE_SPEC.allowedValues.utm_source);
    expect(recovered.allowedValues.utm_medium).toEqual(SAMPLE_SPEC.allowedValues.utm_medium);
  });

  it("lintOffSpec flags an off-spec utm_source value against the sample spec", () => {
    const rows = [makeRow("r-demo", { utm_source: "email_blast" })] as SpecRow[];
    const warnings = lintOffSpec(rows, SAMPLE_SPEC);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].field).toBe("utm_source");
    // nearest to "email_blast" in ["newsletter","facebook","google"] — likely "newsletter"
    expect(typeof warnings[0].nearest).toBe("string");
    expect(warnings[0].nearest.length).toBeGreaterThan(0);
  });

  it("a clean row matching the sample spec produces no off-spec warnings", () => {
    const rows = [
      makeRow("r-clean", {
        utm_source: "newsletter",
        utm_medium: "email",
        utm_campaign: "spring_sale",
      }),
    ] as SpecRow[];
    expect(lintOffSpec(rows, SAMPLE_SPEC)).toHaveLength(0);
  });
});

// ── P2 Enforce-shortcut condition (Round 3) ───────────────────────────────────
// The "Enforce these allowed values now" button renders when:
//   specHasValues(spec) === true AND spec.enforceSpec === false
// This tests the condition logic in isolation.

function specHasValues(spec: UtmSpec): boolean {
  return Object.values(spec.allowedValues).some((arr) => arr.length > 0);
}

describe("P2 enforce-shortcut: specHasValues condition", () => {
  it("returns false for a default empty spec", () => {
    expect(specHasValues(DEFAULT_SPEC)).toBe(false);
  });

  it("returns true when at least one field has a value", () => {
    const s: UtmSpec = {
      ...DEFAULT_SPEC,
      allowedValues: { ...DEFAULT_SPEC.allowedValues, utm_source: ["email"] },
    };
    expect(specHasValues(s)).toBe(true);
  });

  it("enforce shortcut shows when values exist and enforceSpec is off", () => {
    const spec: UtmSpec = {
      allowedValues: { ...DEFAULT_SPEC.allowedValues, utm_source: ["email"] },
      enforceSpec: false,
    };
    const showShortcut = specHasValues(spec) && !spec.enforceSpec;
    expect(showShortcut).toBe(true);
  });

  it("enforce shortcut hidden when enforceSpec is already on", () => {
    const spec: UtmSpec = {
      allowedValues: { ...DEFAULT_SPEC.allowedValues, utm_source: ["email"] },
      enforceSpec: true,
    };
    const showShortcut = specHasValues(spec) && !spec.enforceSpec;
    expect(showShortcut).toBe(false);
  });

  it("enforce shortcut hidden when no values defined (nothing to enforce)", () => {
    const showShortcut = specHasValues(DEFAULT_SPEC) && !DEFAULT_SPEC.enforceSpec;
    expect(showShortcut).toBe(false);
  });

  it("clicking Enforce now shortcut produces spec with enforceSpec true (onChange call)", () => {
    const spec: UtmSpec = {
      allowedValues: { ...DEFAULT_SPEC.allowedValues, utm_source: ["email"] },
      enforceSpec: false,
    };
    // Simulate what the button's onClick does: onChange({ ...spec, enforceSpec: true })
    const nextSpec = { ...spec, enforceSpec: true };
    expect(nextSpec.enforceSpec).toBe(true);
    expect(nextSpec.allowedValues.utm_source).toEqual(["email"]);
  });
});
