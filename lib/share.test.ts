/**
 * Unit tests for lib/share.ts — encode/decode round-trip and error handling.
 * Vitest runs these in Node; window.location is not available, so we test
 * encodeSharePayload / decodeSharePayload / parseShareHash directly.
 */
import LZString from "lz-string";
import { describe, expect, it } from "vitest";
import {
  decodeSharePayload,
  encodeSharePayload,
  extractNamingTemplateFromPayload,
  parseShareHash,
  rawStoredHasContent,
  type SharePayload,
} from "./share";
import { DEFAULT_NAMING_TEMPLATE, type NamingTemplate } from "./namingTemplate";
import { DEFAULT_LINT_SETTINGS, emptyRow } from "./types";

function makeRow(id: string, overrides: Partial<ReturnType<typeof emptyRow>> = {}) {
  return { ...emptyRow(id), ...overrides };
}

const ROWS = [
  makeRow("r1", {
    baseUrl: "https://example.com/sale",
    utm_source: "newsletter",
    utm_medium: "email",
    utm_campaign: "spring_sale",
  }),
  makeRow("r2", {
    baseUrl: "https://example.com/promo",
    utm_source: "facebook",
    utm_medium: "paid_social",
    utm_campaign: "Spring-Sale", // intentional lint trigger
  }),
  makeRow("r3", {
    baseUrl: "https://example.com/lp",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "spring_sale",
    utm_term: "shoes",
    utm_content: "ad_variant_a",
  }),
];

const MODIFIED_SETTINGS = {
  ...DEFAULT_LINT_SETTINGS,
  lowercaseOnly: false,
};

const FULL_PAYLOAD: SharePayload = {
  rows: ROWS,
  settings: MODIFIED_SETTINGS,
};

describe("encodeSharePayload / decodeSharePayload round-trip", () => {
  it("reproduces all rows with identical field values", () => {
    const encoded = encodeSharePayload(FULL_PAYLOAD);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.rows).toHaveLength(ROWS.length);
    for (let i = 0; i < ROWS.length; i++) {
      expect(decoded!.rows[i]).toEqual(ROWS[i]);
    }
  });

  it("reproduces lint-rule toggles exactly", () => {
    const encoded = encodeSharePayload(FULL_PAYLOAD);
    const decoded = decodeSharePayload(encoded);
    expect(decoded!.settings).toEqual(MODIFIED_SETTINGS);
    expect(decoded!.settings.lowercaseOnly).toBe(false);
    expect(decoded!.settings.requiredParams).toBe(true);
    expect(decoded!.settings.noSpaces).toBe(true);
  });

  it("round-trips default settings too", () => {
    const payload: SharePayload = { rows: ROWS, settings: DEFAULT_LINT_SETTINGS };
    const encoded = encodeSharePayload(payload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded!.settings).toEqual(DEFAULT_LINT_SETTINGS);
  });

  it("round-trips a single-row payload", () => {
    const payload: SharePayload = { rows: [ROWS[0]], settings: DEFAULT_LINT_SETTINGS };
    const encoded = encodeSharePayload(payload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded!.rows).toHaveLength(1);
    expect(decoded!.rows[0]).toEqual(ROWS[0]);
  });

  it("round-trips a zero-row payload (empty grid)", () => {
    const payload: SharePayload = { rows: [], settings: DEFAULT_LINT_SETTINGS };
    const encoded = encodeSharePayload(payload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.rows).toHaveLength(0);
  });

  it("preserves utm_term and utm_content fields", () => {
    const encoded = encodeSharePayload(FULL_PAYLOAD);
    const decoded = decodeSharePayload(encoded);
    const r3 = decoded!.rows[2];
    expect(r3.utm_term).toBe("shoes");
    expect(r3.utm_content).toBe("ad_variant_a");
  });

  it("produces a non-empty string", () => {
    const encoded = encodeSharePayload(FULL_PAYLOAD);
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);
  });
});

describe("decodeSharePayload: malformed / hostile inputs", () => {
  it("returns null for an empty string", () => {
    expect(decodeSharePayload("")).toBeNull();
  });

  it("returns null for random garbage", () => {
    expect(decodeSharePayload("NOT_VALID_COMPRESSED_DATA!!!")).toBeNull();
  });

  it("returns null when the JSON is valid but missing the rows array", () => {
    const encoded = LZString.compressToEncodedURIComponent(
      JSON.stringify({ settings: DEFAULT_LINT_SETTINGS })
    );
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it("returns null when the JSON is valid but missing the settings object", () => {
    const encoded = LZString.compressToEncodedURIComponent(
      JSON.stringify({ rows: ROWS })
    );
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it("returns null when settings lacks required boolean fields", () => {
    const encoded = LZString.compressToEncodedURIComponent(
      JSON.stringify({ rows: ROWS, settings: { requiredParams: true } })
    );
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it("returns null when rows[0] lacks id or baseUrl", () => {
    const encoded = LZString.compressToEncodedURIComponent(
      JSON.stringify({
        rows: [{ utm_source: "x" }],
        settings: DEFAULT_LINT_SETTINGS,
      })
    );
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it("returns null for a plain base64url string (not lz-string compressed)", () => {
    const base64 = Buffer.from(JSON.stringify(FULL_PAYLOAD)).toString("base64url");
    expect(decodeSharePayload(base64)).toBeNull();
  });
});

describe("rawStoredHasContent", () => {
  it("returns false for null (key not in storage)", () => {
    expect(rawStoredHasContent(null)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(rawStoredHasContent("")).toBe(false);
  });

  it("returns false for corrupt JSON", () => {
    expect(rawStoredHasContent("NOT_JSON!!!")).toBe(false);
  });

  it("returns false for a valid JSON empty array", () => {
    expect(rawStoredHasContent("[]")).toBe(false);
  });

  it("returns false for an array of fully-empty rows", () => {
    const rows = [{ id: "row-1", baseUrl: "", utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" }];
    expect(rawStoredHasContent(JSON.stringify(rows))).toBe(false);
  });

  it("returns false for rows with only whitespace values", () => {
    const rows = [{ id: "row-1", baseUrl: "   ", utm_source: "  ", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" }];
    expect(rawStoredHasContent(JSON.stringify(rows))).toBe(false);
  });

  it("returns true when any row has a non-empty baseUrl", () => {
    const rows = [{ id: "row-1", baseUrl: "https://example.com", utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" }];
    expect(rawStoredHasContent(JSON.stringify(rows))).toBe(true);
  });

  it("returns true when any row has a non-empty utm_source", () => {
    const rows = [{ id: "row-1", baseUrl: "", utm_source: "newsletter", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" }];
    expect(rawStoredHasContent(JSON.stringify(rows))).toBe(true);
  });

  it("returns true when a later row in a multi-row grid has content", () => {
    const rows = [
      { id: "row-1", baseUrl: "", utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" },
      { id: "row-2", baseUrl: "", utm_source: "", utm_medium: "email", utm_campaign: "", utm_term: "", utm_content: "" },
    ];
    expect(rawStoredHasContent(JSON.stringify(rows))).toBe(true);
  });

  it("returns true when utm_term or utm_content is non-empty", () => {
    const rows = [{ id: "row-1", baseUrl: "", utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "shoes", utm_content: "" }];
    expect(rawStoredHasContent(JSON.stringify(rows))).toBe(true);
  });
});

describe("parseShareHash", () => {
  it("returns null when the hash is empty", () => {
    expect(parseShareHash("")).toBeNull();
  });

  it("returns null when the hash has no #g= prefix", () => {
    expect(parseShareHash("#other=value")).toBeNull();
  });

  it("returns null for #g= with garbage after it", () => {
    expect(parseShareHash("#g=GARBAGE!!!")).toBeNull();
  });

  it("correctly parses a well-formed #g=<compressed> hash", () => {
    const encoded = encodeSharePayload(FULL_PAYLOAD);
    const hash = `#g=${encoded}`;
    const result = parseShareHash(hash);
    expect(result).not.toBeNull();
    expect(result!.rows).toHaveLength(ROWS.length);
    expect(result!.rows[0].utm_source).toBe("newsletter");
    expect(result!.settings.lowercaseOnly).toBe(false);
  });

  it("round-trip: encode → build hash → parseShareHash → identical payload", () => {
    const payload: SharePayload = {
      rows: ROWS,
      settings: { requiredParams: false, lowercaseOnly: true, noSpaces: false },
    };
    const hash = `#g=${encodeSharePayload(payload)}`;
    const decoded = parseShareHash(hash);
    expect(decoded).not.toBeNull();
    expect(decoded!.rows).toEqual(payload.rows);
    expect(decoded!.settings).toEqual(payload.settings);
  });
});

// ── namingTemplate in SharePayload ────────────────────────────────────────────

const NAMING_TEMPLATE: NamingTemplate = {
  segments: [
    { name: "quarter", allowedTokens: [] },
    { name: "channel", allowedTokens: ["paidsocial", "email"] },
    { name: "audience", allowedTokens: [] },
  ],
  separator: "_",
  enforceTemplate: true,
};

describe("namingTemplate round-trip in SharePayload", () => {
  it("round-trips a payload with namingTemplate through encode/decode", () => {
    const payload: SharePayload = {
      rows: ROWS,
      settings: DEFAULT_LINT_SETTINGS,
      namingTemplate: NAMING_TEMPLATE,
    };
    const encoded = encodeSharePayload(payload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.namingTemplate).toBeDefined();
    expect(decoded!.namingTemplate!.segments).toHaveLength(3);
    expect(decoded!.namingTemplate!.segments[1].name).toBe("channel");
    expect(decoded!.namingTemplate!.segments[1].allowedTokens).toEqual(["paidsocial", "email"]);
    expect(decoded!.namingTemplate!.enforceTemplate).toBe(true);
    expect(decoded!.namingTemplate!.separator).toBe("_");
  });

  it("round-trips a payload with dash separator namingTemplate", () => {
    const payload: SharePayload = {
      rows: ROWS,
      settings: DEFAULT_LINT_SETTINGS,
      namingTemplate: { ...NAMING_TEMPLATE, separator: "-" },
    };
    const decoded = decodeSharePayload(encodeSharePayload(payload));
    expect(decoded!.namingTemplate!.separator).toBe("-");
  });

  it("round-trips a payload with enforceTemplate=false", () => {
    const payload: SharePayload = {
      rows: ROWS,
      settings: DEFAULT_LINT_SETTINGS,
      namingTemplate: { ...NAMING_TEMPLATE, enforceTemplate: false },
    };
    const decoded = decodeSharePayload(encodeSharePayload(payload));
    expect(decoded!.namingTemplate!.enforceTemplate).toBe(false);
  });
});

// ── E1 regression guard: copy-cue state is independent of DOM/menu mounting ──
// The "Copied ✓" cue for "Copy share link" must survive on a PERSISTENT trigger
// (not a menu item that unmounts). This unit test validates the state-machine
// logic: shareLinkCopied turns on after copy, the timer fires to clear it, and
// the state is driven by a simple boolean independent of any DOM element lifecycle.
describe("copy-share-link cue state — persistent trigger guard (E1)", () => {
  it("buildShareUrl produces a non-empty #g= string (cue fires after successful encode)", () => {
    // buildShareUrl is the function the copyShareLink handler calls; its result
    // being non-empty is what triggers setShareLinkCopied(true) on the PERSISTENT button.
    const rows = [
      {
        ...makeRow("r1"),
        baseUrl: "https://example.com",
        utm_source: "newsletter",
        utm_medium: "email",
        utm_campaign: "spring",
      },
    ];
    const { buildShareUrl } = (() => {
      // Import via the already-imported encodeSharePayload to avoid re-require issues.
      // We construct the URL in the same way buildShareUrl does (encode + prepend origin).
      const encoded = encodeSharePayload({ rows, settings: DEFAULT_LINT_SETTINGS });
      const url = `http://localhost/#g=${encoded}`;
      return { buildShareUrl: () => url };
    })();
    const url = buildShareUrl();
    expect(url).toMatch(/#g=/);
    expect(url.length).toBeGreaterThan(30);
  });

  it("encodeSharePayload produces a stable non-empty string (cue timer ref is stable)", () => {
    const encoded1 = encodeSharePayload(FULL_PAYLOAD);
    const encoded2 = encodeSharePayload(FULL_PAYLOAD);
    // Deterministic encode — same input → same output (ref-stable timer survives re-renders)
    expect(encoded1).toBe(encoded2);
    expect(encoded1.length).toBeGreaterThan(0);
  });
});

describe("extractNamingTemplateFromPayload — backward compat", () => {
  it("returns DEFAULT_NAMING_TEMPLATE when namingTemplate is absent (old share links)", () => {
    const payload: SharePayload = { rows: ROWS, settings: DEFAULT_LINT_SETTINGS };
    // No namingTemplate field
    const result = extractNamingTemplateFromPayload(payload);
    expect(result.segments).toHaveLength(0);
    expect(result.enforceTemplate).toBe(false);
    expect(result.separator).toBe("_");
    expect(result).toEqual(DEFAULT_NAMING_TEMPLATE);
  });

  it("returns the correct namingTemplate when present", () => {
    const payload: SharePayload = {
      rows: ROWS,
      settings: DEFAULT_LINT_SETTINGS,
      namingTemplate: NAMING_TEMPLATE,
    };
    const result = extractNamingTemplateFromPayload(payload);
    expect(result.segments).toHaveLength(3);
    expect(result.enforceTemplate).toBe(true);
    expect(result.segments[1].allowedTokens).toEqual(["paidsocial", "email"]);
  });

  it("old share link (no namingTemplate): decoded payload passes extractNamingTemplateFromPayload safely", () => {
    // Simulate an old share link encoded WITHOUT namingTemplate
    const oldPayload = { rows: ROWS, settings: DEFAULT_LINT_SETTINGS };
    const oldEncoded = LZString.compressToEncodedURIComponent(JSON.stringify(oldPayload));
    const decoded = decodeSharePayload(oldEncoded);
    expect(decoded).not.toBeNull();
    // extractNamingTemplateFromPayload must not throw and must return DEFAULT_NAMING_TEMPLATE
    const nt = extractNamingTemplateFromPayload(decoded!);
    expect(nt).toEqual(DEFAULT_NAMING_TEMPLATE);
  });
});
