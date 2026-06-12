import { describe, expect, it } from "vitest";
import { buildUtmUrl, isValidBaseUrl } from "./utm";
import { emptyRow } from "./types";

function row(overrides: Partial<ReturnType<typeof emptyRow>>) {
  return { ...emptyRow("r1"), ...overrides };
}

describe("buildUtmUrl", () => {
  it("builds the spec example exactly", () => {
    expect(
      buildUtmUrl(
        row({
          baseUrl: "https://example.com/sale",
          utm_source: "newsletter",
          utm_medium: "email",
          utm_campaign: "spring_sale",
        })
      )
    ).toBe(
      "https://example.com/sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale"
    );
  });

  it("returns empty string for empty base URL", () => {
    expect(buildUtmUrl(row({ utm_source: "x" }))).toBe("");
  });

  it("returns base URL unchanged when no params are set", () => {
    expect(buildUtmUrl(row({ baseUrl: "https://a.com/p" }))).toBe("https://a.com/p");
  });

  it("skips empty params and keeps canonical order", () => {
    expect(
      buildUtmUrl(
        row({
          baseUrl: "https://a.com",
          utm_content: "banner",
          utm_source: "x",
        })
      )
    ).toBe("https://a.com?utm_source=x&utm_content=banner");
  });

  it("appends with & when base already has a query string", () => {
    expect(
      buildUtmUrl(row({ baseUrl: "https://a.com/p?ref=1", utm_source: "x" }))
    ).toBe("https://a.com/p?ref=1&utm_source=x");
  });

  it("keeps fragments after the params", () => {
    expect(
      buildUtmUrl(row({ baseUrl: "https://a.com/p#section", utm_source: "x" }))
    ).toBe("https://a.com/p?utm_source=x#section");
  });

  it("URL-encodes values", () => {
    expect(
      buildUtmUrl(row({ baseUrl: "https://a.com", utm_campaign: "50% off & more" }))
    ).toBe("https://a.com?utm_campaign=50%25%20off%20%26%20more");
  });
});

describe("isValidBaseUrl", () => {
  it("accepts http(s) URLs", () => {
    expect(isValidBaseUrl("https://example.com/sale")).toBe(true);
    expect(isValidBaseUrl("http://example.com")).toBe(true);
  });

  it("rejects missing protocol, other protocols, and junk", () => {
    expect(isValidBaseUrl("example.com/sale")).toBe(false);
    expect(isValidBaseUrl("ftp://example.com")).toBe(false);
    expect(isValidBaseUrl("not a url")).toBe(false);
    expect(isValidBaseUrl("")).toBe(false);
  });
});
