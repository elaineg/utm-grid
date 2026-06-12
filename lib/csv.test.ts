import { describe, expect, it } from "vitest";
import {
  autoMapHeaders,
  csvToRows,
  EXPORT_HEADERS,
  parseCsv,
  rowsToCsv,
  serializeCsv,
} from "./csv";
import { emptyRow, type UtmRow } from "./types";
import { buildUtmUrl } from "./utm";

describe("parseCsv", () => {
  it("parses simple rows", () => {
    expect(parseCsv("a,b,c\n1,2,3\n")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles quoted fields with commas, quotes, and newlines", () => {
    expect(parseCsv('a,"hello, world","say ""hi""","line1\nline2"')).toEqual([
      ["a", "hello, world", 'say "hi"', "line1\nline2"],
    ]);
  });

  it("handles CRLF and CR line endings", () => {
    expect(parseCsv("a,b\r\n1,2\r3,4")).toEqual([
      ["a", "b"],
      ["1", "2"],
      ["3", "4"],
    ]);
  });

  it("preserves empty cells", () => {
    expect(parseCsv("a,,c\n,,")).toEqual([
      ["a", "", "c"],
      ["", "", ""],
    ]);
  });
});

describe("serializeCsv", () => {
  it("quotes only fields that need it and escapes quotes", () => {
    expect(serializeCsv([["plain", "with,comma", 'with "quote"', "with\nnewline"]])).toBe(
      'plain,"with,comma","with ""quote""","with\nnewline"\n'
    );
  });

  it("round-trips arbitrary cell content", () => {
    const rows = [
      ["a", 'tricky "x", y', ""],
      ["multi\nline", ",", '"'],
    ];
    expect(parseCsv(serializeCsv(rows))).toEqual(rows);
  });
});

describe("autoMapHeaders", () => {
  it("pre-maps exact utm field names and base_url", () => {
    const mapping = autoMapHeaders([...EXPORT_HEADERS]);
    expect(mapping).toEqual({
      baseUrl: 0,
      utm_source: 1,
      utm_medium: 2,
      utm_campaign: 3,
      utm_term: 4,
      utm_content: 5,
    });
  });

  it("pre-maps the spec's short headers url,source,medium,campaign", () => {
    expect(autoMapHeaders(["url", "source", "medium", "campaign"])).toEqual({
      baseUrl: 0,
      utm_source: 1,
      utm_medium: 2,
      utm_campaign: 3,
      utm_term: null,
      utm_content: null,
    });
  });

  it("matches case-insensitively and ignores punctuation", () => {
    expect(autoMapHeaders(["Base URL", "UTM Source"])).toEqual(
      expect.objectContaining({ baseUrl: 0, utm_source: 1 })
    );
  });

  it("leaves unknown headers unmapped", () => {
    const mapping = autoMapHeaders(["foo", "bar"]);
    expect(Object.values(mapping)).toEqual([null, null, null, null, null, null]);
  });
});

describe("export -> import round trip", () => {
  it("reproduces rows exactly, including tricky values", () => {
    const rows: UtmRow[] = [
      {
        ...emptyRow("r1"),
        baseUrl: "https://example.com/sale",
        utm_source: "newsletter",
        utm_medium: "email",
        utm_campaign: "spring_sale",
      },
      {
        ...emptyRow("r2"),
        baseUrl: "https://example.com/a,b",
        utm_source: 'quo"ted',
        utm_campaign: "Spring Sale",
      },
    ];

    const csv = rowsToCsv(rows);
    const parsed = parseCsv(csv);
    const headers = parsed[0];
    expect(headers).toEqual([...EXPORT_HEADERS]);

    let n = 0;
    const mapping = autoMapHeaders(headers);
    const imported = csvToRows(parsed.slice(1), mapping, () => `new-${n++}`);

    const withoutId = (r: UtmRow) => {
      const { id, ...rest } = r;
      void id;
      return rest;
    };
    expect(imported.map(withoutId)).toEqual(rows.map(withoutId));
  });

  it("export includes the generated URL column", () => {
    const r = {
      ...emptyRow("r1"),
      baseUrl: "https://example.com/sale",
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "spring_sale",
    };
    const parsed = parseCsv(rowsToCsv([r]));
    expect(parsed[1][parsed[0].indexOf("generated_url")]).toBe(buildUtmUrl(r));
  });
});

describe("csvToRows", () => {
  it("fills unmapped fields with empty strings and tolerates short rows", () => {
    const mapping = autoMapHeaders(["url", "source"]);
    const rows = csvToRows([["https://a.com", "x"], ["https://b.com"]], mapping, () => "id");
    expect(rows[0].baseUrl).toBe("https://a.com");
    expect(rows[0].utm_source).toBe("x");
    expect(rows[0].utm_medium).toBe("");
    expect(rows[1].utm_source).toBe("");
  });
});
