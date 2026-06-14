import { describe, expect, it } from "vitest";
import { baseUtmParams, buildUtmUrl, isValidBaseUrl, parseUtmUrl, parseUtmUrls } from "./utm";
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

  it("replaces an existing utm_* param in the base URL instead of duplicating (validator P2 repro)", () => {
    expect(
      buildUtmUrl(
        row({
          baseUrl: "https://example.com/p?utm_source=old",
          utm_source: "src",
          utm_medium: "email",
          utm_campaign: "camp",
        })
      )
    ).toBe("https://example.com/p?utm_source=src&utm_medium=email&utm_campaign=camp");
  });

  it("keeps base utm_* params the row leaves empty", () => {
    expect(
      buildUtmUrl(
        row({ baseUrl: "https://a.com/p?utm_source=old&ref=1", utm_campaign: "c" })
      )
    ).toBe("https://a.com/p?utm_source=old&ref=1&utm_campaign=c");
  });

  it("replaces while preserving non-utm params and fragments", () => {
    expect(
      buildUtmUrl(
        row({ baseUrl: "https://a.com/p?ref=1&utm_medium=x#frag", utm_medium: "email" })
      )
    ).toBe("https://a.com/p?ref=1&utm_medium=email#frag");
  });

  it("replaces when the base utm param is the only query param", () => {
    expect(
      buildUtmUrl(row({ baseUrl: "https://a.com/p?utm_source=old", utm_source: "new" }))
    ).toBe("https://a.com/p?utm_source=new");
  });
});

describe("baseUtmParams", () => {
  it("lists utm_* params present in the base URL, in canonical order", () => {
    expect(baseUtmParams("https://a.com/p?utm_medium=x&utm_source=y&ref=1")).toEqual([
      "utm_source",
      "utm_medium",
    ]);
  });

  it("returns empty for no query string or only non-utm params", () => {
    expect(baseUtmParams("https://a.com/p")).toEqual([]);
    expect(baseUtmParams("https://a.com/p?ref=1&gclid=abc")).toEqual([]);
    expect(baseUtmParams("")).toEqual([]);
  });

  it("ignores anything after the fragment", () => {
    expect(baseUtmParams("https://a.com/p#?utm_source=x")).toEqual([]);
  });
});

describe("parseUtmUrl", () => {
  it("decomposes the spec example URL correctly", () => {
    const result = parseUtmUrl(
      "https://example.com/sale?utm_source=Newsletter&utm_medium=email&utm_campaign=spring_sale"
    );
    expect(result).not.toBeNull();
    expect(result!.ok).toBe(true);
    if (!result || !result.ok) return;
    expect(result.fields.baseUrl).toBe("https://example.com/sale");
    expect(result.fields.utm_source).toBe("Newsletter");
    expect(result.fields.utm_medium).toBe("email");
    expect(result.fields.utm_campaign).toBe("spring_sale");
    expect(result.fields.utm_term).toBe("");
    expect(result.fields.utm_content).toBe("");
  });

  it("decomposes the second spec example URL correctly", () => {
    const result = parseUtmUrl(
      "https://example.com/buy?utm_source=newsletter&utm_medium=Email&utm_campaign=Spring-Sale"
    );
    expect(result).not.toBeNull();
    expect(result!.ok).toBe(true);
    if (!result || !result.ok) return;
    expect(result.fields.baseUrl).toBe("https://example.com/buy");
    expect(result.fields.utm_source).toBe("newsletter");
    expect(result.fields.utm_medium).toBe("Email");
    expect(result.fields.utm_campaign).toBe("Spring-Sale");
  });

  it("preserves non-utm query params (ref) and extracts utm_source", () => {
    const result = parseUtmUrl("https://example.com/x?ref=x&utm_source=fb");
    expect(result).not.toBeNull();
    expect(result!.ok).toBe(true);
    if (!result || !result.ok) return;
    expect(result.fields.baseUrl).toBe("https://example.com/x?ref=x");
    expect(result.fields.utm_source).toBe("fb");
    // Round-trip: buildUtmUrl should reproduce the original URL with ref + utm_source each once
    const rebuilt = buildUtmUrl({ ...emptyRow("r"), ...result.fields });
    expect(rebuilt).toBe("https://example.com/x?ref=x&utm_source=fb");
    const params = new URL(rebuilt).searchParams;
    expect(params.getAll("utm_source").length).toBe(1);
    expect(params.getAll("ref").length).toBe(1);
  });

  it("returns null for a blank line", () => {
    expect(parseUtmUrl("")).toBeNull();
    expect(parseUtmUrl("   ")).toBeNull();
  });

  it("returns error for a malformed string", () => {
    const result = parseUtmUrl("not a url");
    expect(result).not.toBeNull();
    expect(result!.ok).toBe(false);
  });

  it("returns error for a non-http(s) URL", () => {
    const result = parseUtmUrl("ftp://example.com");
    expect(result).not.toBeNull();
    expect(result!.ok).toBe(false);
  });

  it("URL-decodes utm_* values", () => {
    const result = parseUtmUrl(
      "https://example.com/?utm_campaign=50%25%20off%20%26%20more"
    );
    expect(result).not.toBeNull();
    expect(result!.ok).toBe(true);
    if (!result || !result.ok) return;
    expect(result.fields.utm_campaign).toBe("50% off & more");
  });

  it("round-trip: parseUtmUrl(buildUtmUrl(row)) reproduces row fields", () => {
    const original = {
      ...emptyRow("r1"),
      baseUrl: "https://example.com/sale?ref=1",
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "spring_sale",
      utm_content: "banner",
    };
    const built = buildUtmUrl(original);
    const parsed = parseUtmUrl(built);
    expect(parsed).not.toBeNull();
    expect(parsed!.ok).toBe(true);
    if (!parsed || !parsed.ok) return;
    expect(parsed.fields.baseUrl).toBe(original.baseUrl);
    expect(parsed.fields.utm_source).toBe(original.utm_source);
    expect(parsed.fields.utm_medium).toBe(original.utm_medium);
    expect(parsed.fields.utm_campaign).toBe(original.utm_campaign);
    expect(parsed.fields.utm_content).toBe(original.utm_content);
  });

  it("round-trip: buildUtmUrl(parseUtmUrl(url)) reproduces the URL with no dup params", () => {
    const url = "https://example.com/x?ref=x&utm_source=newsletter&utm_medium=email";
    const parsed = parseUtmUrl(url);
    expect(parsed).not.toBeNull();
    expect(parsed!.ok).toBe(true);
    if (!parsed || !parsed.ok) return;
    const rebuilt = buildUtmUrl({ ...emptyRow("r"), ...parsed.fields });
    const u = new URL(rebuilt);
    expect(u.searchParams.getAll("utm_source").length).toBe(1);
    expect(u.searchParams.getAll("utm_medium").length).toBe(1);
    expect(u.searchParams.getAll("ref").length).toBe(1);
  });
});

describe("parseUtmUrls", () => {
  let counter = 0;
  const idGen = () => `row-${++counter}`;

  it("parses multiple valid URLs into rows", () => {
    counter = 0;
    const { rows, skipped } = parseUtmUrls(
      [
        "https://example.com/sale?utm_source=Newsletter&utm_medium=email&utm_campaign=spring_sale",
        "https://example.com/buy?utm_source=newsletter&utm_medium=Email&utm_campaign=Spring-Sale",
      ].join("\n"),
      idGen
    );
    expect(rows.length).toBe(2);
    expect(skipped.length).toBe(0);
    expect(rows[0].utm_source).toBe("Newsletter");
    expect(rows[1].utm_medium).toBe("Email");
  });

  it("skips blank lines silently", () => {
    counter = 0;
    const { rows, skipped } = parseUtmUrls(
      "\nhttps://example.com/?utm_source=x\n\n",
      idGen
    );
    expect(rows.length).toBe(1);
    expect(skipped.length).toBe(0);
  });

  it("records malformed lines in skipped with lineNo and reason", () => {
    counter = 0;
    const { rows, skipped } = parseUtmUrls(
      ["https://example.com/?utm_source=ok", "not a url"].join("\n"),
      idGen
    );
    expect(rows.length).toBe(1);
    expect(skipped.length).toBe(1);
    expect(skipped[0].lineNo).toBe(2);
    expect(typeof skipped[0].reason).toBe("string");
  });

  it("preserves ref param and extracts utm_source (no dup param)", () => {
    counter = 0;
    const { rows } = parseUtmUrls(
      "https://example.com/x?ref=x&utm_source=fb",
      idGen
    );
    expect(rows.length).toBe(1);
    expect(rows[0].baseUrl).toBe("https://example.com/x?ref=x");
    expect(rows[0].utm_source).toBe("fb");
  });

  it("mixes valid and invalid lines, valid still import", () => {
    counter = 0;
    const { rows, skipped } = parseUtmUrls(
      [
        "https://example.com/?utm_source=ok",
        "not a url",
        "https://example.com/b?utm_medium=email",
      ].join("\n"),
      idGen
    );
    expect(rows.length).toBe(2);
    expect(skipped.length).toBe(1);
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
