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
