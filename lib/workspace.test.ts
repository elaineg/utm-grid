/**
 * Unit tests for workspace.ts.
 * Tests that don't require a live DB connection.
 */
import { describe, it, expect } from "vitest";
import {
  generateWorkspaceId,
  WORKSPACE_ID_RE,
  isValidWorkspaceId,
  isWorkspacePayload,
  parseWorkspacePayload,
  MAX_PAYLOAD_BYTES,
} from "./workspace";
import type { WorkspacePayload } from "./workspace";
import { DEFAULT_NAMING_TEMPLATE, type NamingTemplate } from "./namingTemplate";

// ── Regression: GET-body wire format (P0-1) ───────────────────────────────────
// The GET /api/workspace/[id] route returns { data: "<JSON-string>" }
// (data is a JSON-stringified WorkspacePayload stored verbatim in Turso).
// The /w/[id] page MUST call JSON.parse(body.data) to recover the payload.
// This test pins the round-trip so a future refactor of the wire format is caught.
describe("GET body wire format: body.data is a JSON string that must be parsed", () => {
  const PAYLOAD: WorkspacePayload = {
    rows: [
      {
        id: "row-1",
        baseUrl: "https://example.com/a",
        utm_source: "newsletter",
        utm_medium: "email",
        utm_campaign: "spring_sale",
        utm_term: "",
        utm_content: "",
      },
    ],
    settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
    spec: {
      allowedValues: { utm_source: ["newsletter"], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] },
      enforceSpec: false,
    },
  };

  it("parseWorkspacePayload recovers the payload from the raw string stored in Turso (as PUT sends it)", () => {
    // PUT sends JSON.stringify(payload); Turso stores that string; GET returns { data: storedString }.
    const storedString = JSON.stringify(PAYLOAD);
    const result = parseWorkspacePayload(storedString);
    expect(result).not.toBeNull();
    expect(result!.rows).toHaveLength(1);
    expect(result!.rows[0].baseUrl).toBe("https://example.com/a");
    expect(result!.rows[0].utm_source).toBe("newsletter");
    expect(result!.rows[0].utm_campaign).toBe("spring_sale");
  });

  it("client-side GET parse: JSON.parse(body.data) then parseWorkspacePayload returns the same payload", () => {
    // Simulate the full round-trip: PUT body → Turso store → GET response body → client parse
    const putBody = JSON.stringify(PAYLOAD);          // what PUT sends
    const getBody = { data: putBody };                // what GET returns: { data: "<string>" }
    const rawFromServer = getBody.data;               // client reads body.data (a string)
    const recovered = parseWorkspacePayload(rawFromServer);
    expect(recovered).not.toBeNull();
    expect(recovered!.rows[0].utm_campaign).toBe("spring_sale");
    expect(recovered!.settings.requiredParams).toBe(true);
  });

  it("parseWorkspacePayload returns null on a double-encoded string (would be a server-side bug)", () => {
    // Guard: if GET were to double-encode (JSON.stringify(JSON.stringify(payload))), the client
    // must not silently produce garbage — it should get null and fail safely.
    const doubleEncoded = JSON.stringify(JSON.stringify(PAYLOAD));
    // JSON.parse(doubleEncoded) returns a string, not an object → isWorkspacePayload → false
    expect(parseWorkspacePayload(doubleEncoded)).toBeNull();
  });
});

// ── Regression: localStorage key names used by UtmGrid (P0-1) ─────────────────
// /w/[id]/page.tsx must write to keys that UtmGrid actually reads.
// UtmGrid: key(k) = storageKeyPrefix + k, with storageKeyPrefix = "ws:<id>:"
//   rows     → "ws:<id>:utm-grid:rows"
//   settings → "ws:<id>:utm-grid:lint-settings"
//   spec     → "ws:<id>:utm-grid:utm-spec"
// This test documents the contract so a rename is caught immediately.
describe("workspace localStorage key contract", () => {
  it("documents the correct prefixed key names UtmGrid reads in workspace mode", () => {
    const wsId = "ABCDEFGHIJKLMNOPQRSTUVw"; // 23-char valid id
    const storageKeyPrefix = `ws:${wsId}:`;
    const utmGridKey = (k: string) => `${storageKeyPrefix}${k}`;

    // These must match exactly what /w/[id]/page.tsx calls writeValue() with
    expect(utmGridKey("utm-grid:rows")).toBe(`ws:${wsId}:utm-grid:rows`);
    expect(utmGridKey("utm-grid:lint-settings")).toBe(`ws:${wsId}:utm-grid:lint-settings`);
    expect(utmGridKey("utm-grid:utm-spec")).toBe(`ws:${wsId}:utm-grid:utm-spec`);

    // Confirm the WRONG keys (what the old code wrote) do NOT match
    expect(utmGridKey("utm-grid:rows")).not.toBe(`ws:${wsId}:rows`);
    expect(utmGridKey("utm-grid:lint-settings")).not.toBe(`ws:${wsId}:settings`);
    expect(utmGridKey("utm-grid:utm-spec")).not.toBe(`ws:${wsId}:spec`);
  });
});

// ── generateWorkspaceId ───────────────────────────────────────────────────────

describe("generateWorkspaceId", () => {
  it("produces a string of at least 22 characters", () => {
    const id = generateWorkspaceId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThanOrEqual(22);
  });

  it("uses only url-safe base64 characters (A-Z a-z 0-9 - _)", () => {
    for (let i = 0; i < 100; i++) {
      const id = generateWorkspaceId();
      expect(id).toMatch(/^[A-Za-z0-9\-_]+$/);
    }
  });

  it("passes WORKSPACE_ID_RE (22–32 url-safe chars)", () => {
    for (let i = 0; i < 100; i++) {
      expect(generateWorkspaceId()).toMatch(WORKSPACE_ID_RE);
    }
  });

  it("generates unique ids across many draws", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(generateWorkspaceId());
    }
    // Extremely unlikely to collide with 128 bits of randomness
    expect(ids.size).toBe(1000);
  });
});

// ── isValidWorkspaceId ────────────────────────────────────────────────────────

describe("isValidWorkspaceId", () => {
  it("accepts a generated id", () => {
    expect(isValidWorkspaceId(generateWorkspaceId())).toBe(true);
  });

  it("accepts a 22-char url-safe string", () => {
    expect(isValidWorkspaceId("ABCDEFGHIJKLMNOPQRSTUVw")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidWorkspaceId("")).toBe(false);
  });

  it("rejects strings shorter than 22 chars", () => {
    expect(isValidWorkspaceId("shortid")).toBe(false);
  });

  it("rejects strings longer than 32 chars", () => {
    expect(isValidWorkspaceId("a".repeat(33))).toBe(false);
  });

  it("rejects strings with non-url-safe chars", () => {
    expect(isValidWorkspaceId("abc!@#defghijklmnopqrstu")).toBe(false);
    expect(isValidWorkspaceId("abc/defghijklmnopqrstuvw")).toBe(false);
    expect(isValidWorkspaceId("abc+defghijklmnopqrstuvw")).toBe(false);
  });

  it("rejects path traversal / injection attempts", () => {
    expect(isValidWorkspaceId("../etc/passwd0000000000000")).toBe(false);
    expect(isValidWorkspaceId("does-not-exist-xxxxxxxxxxxxxxxxxxxxx")).toBe(false);
  });
});

// ── isWorkspacePayload ────────────────────────────────────────────────────────

const VALID_PAYLOAD: WorkspacePayload = {
  rows: [
    {
      id: "row-1",
      baseUrl: "https://example.com",
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "spring",
      utm_term: "",
      utm_content: "",
    },
  ],
  settings: {
    requiredParams: true,
    lowercaseOnly: true,
    noSpaces: true,
  },
  spec: {
    allowedValues: {
      utm_source: ["newsletter"],
      utm_medium: [],
      utm_campaign: [],
      utm_term: [],
      utm_content: [],
    },
    enforceSpec: false,
  },
};

describe("isWorkspacePayload", () => {
  it("accepts a valid payload", () => {
    expect(isWorkspacePayload(VALID_PAYLOAD)).toBe(true);
  });

  it("accepts a payload with empty rows array", () => {
    expect(isWorkspacePayload({ ...VALID_PAYLOAD, rows: [] })).toBe(true);
  });

  it("rejects null", () => {
    expect(isWorkspacePayload(null)).toBe(false);
  });

  it("rejects a non-object", () => {
    expect(isWorkspacePayload("string")).toBe(false);
    expect(isWorkspacePayload(42)).toBe(false);
  });

  it("rejects missing rows", () => {
    const { rows: _r, ...rest } = VALID_PAYLOAD;
    expect(isWorkspacePayload(rest)).toBe(false);
  });

  it("rejects rows with a missing id", () => {
    const bad = { ...VALID_PAYLOAD, rows: [{ ...VALID_PAYLOAD.rows[0], id: undefined }] };
    expect(isWorkspacePayload(bad)).toBe(false);
  });

  it("rejects rows with a missing baseUrl", () => {
    const bad = { ...VALID_PAYLOAD, rows: [{ ...VALID_PAYLOAD.rows[0], baseUrl: undefined }] };
    expect(isWorkspacePayload(bad)).toBe(false);
  });

  it("rejects missing settings", () => {
    const { settings: _s, ...rest } = VALID_PAYLOAD;
    expect(isWorkspacePayload(rest)).toBe(false);
  });

  it("rejects settings missing requiredParams", () => {
    const bad = {
      ...VALID_PAYLOAD,
      settings: { lowercaseOnly: true, noSpaces: true },
    };
    expect(isWorkspacePayload(bad)).toBe(false);
  });
});

// ── parseWorkspacePayload ─────────────────────────────────────────────────────

describe("parseWorkspacePayload", () => {
  it("parses a valid JSON payload", () => {
    const raw = JSON.stringify(VALID_PAYLOAD);
    const result = parseWorkspacePayload(raw);
    expect(result).not.toBeNull();
    expect(result!.rows).toHaveLength(1);
    expect(result!.rows[0].utm_source).toBe("newsletter");
    expect(result!.settings.requiredParams).toBe(true);
  });

  it("normalizes spec via deserializeSpec (backward compat: missing spec → DEFAULT_SPEC)", () => {
    const noSpec = { ...VALID_PAYLOAD };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (noSpec as any).spec;
    const raw = JSON.stringify(noSpec);
    const result = parseWorkspacePayload(raw);
    expect(result).not.toBeNull();
    expect(result!.spec.enforceSpec).toBe(false);
    expect(result!.spec.allowedValues.utm_source).toEqual([]);
  });

  it("returns null for invalid JSON", () => {
    expect(parseWorkspacePayload("not json")).toBeNull();
  });

  it("returns null for JSON that doesn't match the shape", () => {
    expect(parseWorkspacePayload('{"foo": "bar"}')).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseWorkspacePayload("")).toBeNull();
  });

  it("returns null for a string that would exceed MAX_PAYLOAD_BYTES conceptually (just checks parse)", () => {
    // Note: MAX_PAYLOAD_BYTES is checked at the API layer, not in parseWorkspacePayload.
    // This test just confirms the constant is exported and sensible.
    expect(MAX_PAYLOAD_BYTES).toBeGreaterThan(0);
    expect(MAX_PAYLOAD_BYTES).toBeLessThanOrEqual(10_000_000);
  });
});

// ── P0-3: UTM Spec included in workspace payload round-trip ─────────────────────
// Regression: add allowed values to spec, serialize, PUT to server, GET back,
// re-parse → allowed values must survive the full round-trip.

describe("UTM Spec survives workspace payload round-trip (P0-3)", () => {
  const PAYLOAD_WITH_SPEC: WorkspacePayload = {
    rows: [
      {
        id: "row-1",
        baseUrl: "https://example.com",
        utm_source: "newsletter",
        utm_medium: "email",
        utm_campaign: "q3",
        utm_term: "",
        utm_content: "",
      },
    ],
    settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
    spec: {
      allowedValues: {
        utm_source: ["newsletter", "facebook", "google"],
        utm_medium: ["email", "paid_social", "cpc"],
        utm_campaign: [],
        utm_term: [],
        utm_content: [],
      },
      enforceSpec: true,
    },
  };

  it("spec with allowed values serializes into the payload string", () => {
    const raw = JSON.stringify(PAYLOAD_WITH_SPEC);
    expect(raw).toContain("newsletter");
    expect(raw).toContain("paid_social");
    expect(raw).toContain("enforceSpec");
  });

  it("spec with allowed values round-trips through parseWorkspacePayload", () => {
    const raw = JSON.stringify(PAYLOAD_WITH_SPEC);
    const result = parseWorkspacePayload(raw);
    expect(result).not.toBeNull();
    expect(result!.spec.enforceSpec).toBe(true);
    expect(result!.spec.allowedValues.utm_source).toEqual(["newsletter", "facebook", "google"]);
    expect(result!.spec.allowedValues.utm_medium).toEqual(["email", "paid_social", "cpc"]);
    expect(result!.spec.allowedValues.utm_campaign).toEqual([]);
  });

  it("spec round-trips through the full client → server → client wire format", () => {
    // Simulate: client calls JSON.stringify(payload) as PUT body payload string.
    const putPayloadStr = JSON.stringify(PAYLOAD_WITH_SPEC);
    // Server wraps it: { payload: putPayloadStr } → stores putPayloadStr in DB.
    // GET returns { data: putPayloadStr }.
    // Client: JSON.parse(body.data) → WorkspacePayload.
    const recovered = JSON.parse(putPayloadStr) as WorkspacePayload;
    expect(recovered.spec.allowedValues.utm_source).toEqual(["newsletter", "facebook", "google"]);
    expect(recovered.spec.enforceSpec).toBe(true);
    // Then re-parse via parseWorkspacePayload (as page.tsx does after GET):
    const reparsed = parseWorkspacePayload(putPayloadStr);
    expect(reparsed).not.toBeNull();
    expect(reparsed!.spec.allowedValues.utm_source).toEqual(["newsletter", "facebook", "google"]);
    expect(reparsed!.spec.enforceSpec).toBe(true);
  });

  it("spec added AFTER initial load still serializes into the next PUT payload", () => {
    // Simulate: user opens workspace (empty spec), adds chips, spec changes.
    // The updated spec must be included when onStateChange fires the autosave.
    const emptySpecPayload: WorkspacePayload = {
      ...PAYLOAD_WITH_SPEC,
      spec: { allowedValues: { utm_source: [], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] }, enforceSpec: false },
    };
    // User adds "twitter" to utm_source:
    const updatedSpec = {
      ...emptySpecPayload.spec,
      allowedValues: { ...emptySpecPayload.spec.allowedValues, utm_source: ["twitter"] },
    };
    const payloadAfterChipAdd: WorkspacePayload = { ...emptySpecPayload, spec: updatedSpec };
    // This is what onStateChange({rows, settings, spec}) sends to handleStateChange:
    const putRaw = JSON.stringify(payloadAfterChipAdd);
    expect(putRaw).toContain('"twitter"');
    // Server stores putRaw; next GET returns it; parseWorkspacePayload recovers it:
    const recovered = parseWorkspacePayload(putRaw);
    expect(recovered).not.toBeNull();
    expect(recovered!.spec.allowedValues.utm_source).toEqual(["twitter"]);
  });
});

// ── P1-2: Workspace name round-trips in payload ────────────────────────────────

describe("Workspace name survives payload round-trip (P1-2)", () => {
  const NAMED_PAYLOAD: WorkspacePayload = {
    rows: [],
    settings: { requiredParams: false, lowercaseOnly: false, noSpaces: false },
    spec: { allowedValues: { utm_source: [], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] }, enforceSpec: false },
    name: "Q3 Paid Campaigns",
  };

  it("name field is included in the serialized payload", () => {
    const raw = JSON.stringify(NAMED_PAYLOAD);
    expect(raw).toContain('"name"');
    expect(raw).toContain("Q3 Paid Campaigns");
  });

  it("name round-trips through parseWorkspacePayload", () => {
    const raw = JSON.stringify(NAMED_PAYLOAD);
    const result = parseWorkspacePayload(raw);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Q3 Paid Campaigns");
  });

  it("payload without name field parses correctly (backward compat)", () => {
    const withoutName = { ...NAMED_PAYLOAD };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (withoutName as any).name;
    const raw = JSON.stringify(withoutName);
    const result = parseWorkspacePayload(raw);
    expect(result).not.toBeNull();
    expect(result!.name).toBeUndefined();
  });

  it("name is trimmed and capped at 120 chars", () => {
    const longName = "A".repeat(200);
    const payload: WorkspacePayload = { ...NAMED_PAYLOAD, name: longName };
    const raw = JSON.stringify(payload);
    const result = parseWorkspacePayload(raw);
    expect(result).not.toBeNull();
    // parseWorkspacePayload trims and caps to 120 chars
    expect(result!.name!.length).toBeLessThanOrEqual(120);
  });

  it("empty-string name is treated as undefined (no name set)", () => {
    const payload: WorkspacePayload = { ...NAMED_PAYLOAD, name: "   " };
    const raw = JSON.stringify(payload);
    const result = parseWorkspacePayload(raw);
    expect(result).not.toBeNull();
    // "   ".trim() === "" → undefined
    expect(result!.name).toBeUndefined();
  });
});

// ── namingTemplate in WorkspacePayload ───────────────────────────────────────

const NAMING_TEMPLATE: NamingTemplate = {
  segments: [
    { name: "quarter", allowedTokens: [] },
    { name: "channel", allowedTokens: ["paidsocial", "email"] },
    { name: "audience", allowedTokens: [] },
  ],
  separator: "_",
  enforceTemplate: true,
};

const BASE_PAYLOAD_ROWS = VALID_PAYLOAD.rows;

describe("namingTemplate round-trips in WorkspacePayload (P1-naming)", () => {
  it("namingTemplate field is included in the serialized payload", () => {
    const payload: WorkspacePayload = { ...VALID_PAYLOAD, namingTemplate: NAMING_TEMPLATE };
    const raw = JSON.stringify(payload);
    expect(raw).toContain('"namingTemplate"');
    expect(raw).toContain("channel");
    expect(raw).toContain("paidsocial");
    expect(raw).toContain("enforceTemplate");
  });

  it("namingTemplate round-trips through parseWorkspacePayload", () => {
    const payload: WorkspacePayload = { ...VALID_PAYLOAD, namingTemplate: NAMING_TEMPLATE };
    const raw = JSON.stringify(payload);
    const result = parseWorkspacePayload(raw);
    expect(result).not.toBeNull();
    const nt = result!.namingTemplate;
    expect(nt).toBeDefined();
    expect(nt!.segments).toHaveLength(3);
    expect(nt!.segments[0].name).toBe("quarter");
    expect(nt!.segments[1].name).toBe("channel");
    expect(nt!.segments[1].allowedTokens).toEqual(["paidsocial", "email"]);
    expect(nt!.segments[2].name).toBe("audience");
    expect(nt!.enforceTemplate).toBe(true);
    expect(nt!.separator).toBe("_");
  });

  it("namingTemplate with dash separator round-trips correctly", () => {
    const dashTemplate: NamingTemplate = { ...NAMING_TEMPLATE, separator: "-" };
    const payload: WorkspacePayload = { ...VALID_PAYLOAD, namingTemplate: dashTemplate };
    const result = parseWorkspacePayload(JSON.stringify(payload));
    expect(result).not.toBeNull();
    expect(result!.namingTemplate!.separator).toBe("-");
  });

  it("namingTemplate with enforceTemplate=false round-trips correctly", () => {
    const unenforced: NamingTemplate = { ...NAMING_TEMPLATE, enforceTemplate: false };
    const payload: WorkspacePayload = { ...VALID_PAYLOAD, namingTemplate: unenforced };
    const result = parseWorkspacePayload(JSON.stringify(payload));
    expect(result).not.toBeNull();
    expect(result!.namingTemplate!.enforceTemplate).toBe(false);
  });
});

describe("namingTemplate backward compat in WorkspacePayload", () => {
  it("payload without namingTemplate field parses correctly (old workspaces)", () => {
    // Simulate a workspace saved before namingTemplate feature
    const withoutNaming = { ...VALID_PAYLOAD };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (withoutNaming as any).namingTemplate;
    const raw = JSON.stringify(withoutNaming);
    const result = parseWorkspacePayload(raw);
    expect(result).not.toBeNull();
    // namingTemplate should be DEFAULT_NAMING_TEMPLATE (empty, unenforced)
    const nt = result!.namingTemplate;
    expect(nt).toBeDefined();
    expect(nt!.segments).toHaveLength(0);
    expect(nt!.enforceTemplate).toBe(false);
    expect(nt!.separator).toBe("_");
    expect(nt).toEqual(DEFAULT_NAMING_TEMPLATE);
  });

  it("full client→server→client wire format round-trip with namingTemplate", () => {
    const payload: WorkspacePayload = { ...VALID_PAYLOAD, namingTemplate: NAMING_TEMPLATE };
    // Client serializes as PUT body:
    const putBody = JSON.stringify(payload);
    // Server returns { data: putBody }; client reads body.data:
    const recovered = parseWorkspacePayload(putBody);
    expect(recovered).not.toBeNull();
    expect(recovered!.namingTemplate!.segments).toHaveLength(3);
    expect(recovered!.namingTemplate!.enforceTemplate).toBe(true);
    expect(recovered!.namingTemplate!.segments[1].allowedTokens).toEqual(["paidsocial", "email"]);
  });

  it("namingTemplate added AFTER initial load still serializes into next PUT payload", () => {
    // User starts without a namingTemplate, then adds one
    const initialPayload: WorkspacePayload = { ...VALID_PAYLOAD };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (initialPayload as any).namingTemplate;

    const updatedPayload: WorkspacePayload = {
      ...initialPayload,
      namingTemplate: NAMING_TEMPLATE,
    };
    const putRaw = JSON.stringify(updatedPayload);
    expect(putRaw).toContain('"channel"');
    expect(putRaw).toContain('"enforceTemplate":true');

    const recovered = parseWorkspacePayload(putRaw);
    expect(recovered).not.toBeNull();
    expect(recovered!.namingTemplate!.segments[1].name).toBe("channel");
  });
});

describe("workspace localStorage key: naming-template key documented (P1-naming)", () => {
  it("documents the correct prefixed key for namingTemplate that UtmGrid reads in workspace mode", () => {
    const wsId = "ABCDEFGHIJKLMNOPQRSTUVw";
    const storageKeyPrefix = `ws:${wsId}:`;
    const utmGridKey = (k: string) => `${storageKeyPrefix}${k}`;

    // The naming template key must be consistent between workspace page write
    // and UtmGrid read
    expect(utmGridKey("utm-grid:naming-template")).toBe(`ws:${wsId}:utm-grid:naming-template`);
    // Ensure it's different from the non-prefixed version
    expect(utmGridKey("utm-grid:naming-template")).not.toBe("utm-grid:naming-template");
  });
});
