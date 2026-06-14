# utm-grid — Round 1, Tester 7 (Aisha, Product Designer)

I gave this a 10 last round. Came back to judge the new "Paste & Audit URLs" feature on craft,
not just utility. It holds.

## 1. Discoverability — Yes
Noticed it in the first 5 seconds: violet chip with a search glyph, parked right after "Import CSV"
where my eye already was. The one-line subhead under it — "Already have tagged links? Paste them to
find every inconsistency at once" — instantly told me this is the *opposite* of build-new (audit
existing vs. create). Purpose vs. build-new is unambiguous. No hunting.

## 2. Using it — Yes
Pasted 5 lines: 3 clean URLs, two of which differed ONLY by casing (newsletter/Newsletter,
email/Email), plus a facebook URL missing utm_medium, plus one garbage line.
- Parse: correct. Base URL split out (https://acme.com), utm_* mapped into the right columns,
  casing preserved verbatim (lowercase row vs Title-Case row).
- Inconsistencies surfaced — the part I love: row 1 reads "Inconsistent utm_source across rows:
  'newsletter' vs 'Newsletter' — these will split campaign data in GA4." It names the *consequence*,
  not a generic "warning." Same for medium. Row 2 collapses to a tidy "2 warnings · Fix" pill with
  an actionable Fix link.
- Missing param: facebook row flags "utm_medium is required" with an amber cell.
- Malformed line: skipped. Status reads "Audited 4 URLs — 12 cells flagged · 1 line skipped. Undo."
  Clear accounting + an Undo right there.
This is genuinely faster than what I do today (eyeballing a campaign sheet or pasting links into a
GA debugger one at a time). I'd reach for it whenever a teammate hands me inherited links to QA.

## 3. Prior value / regression — none found
Build-new flow, generated-URL cell, base-URL validation ("Not a valid http(s) URL"), presets,
bulk edit, workspace, Allowed values — all intact. Zero console errors across every flow.

## Friction / nits (minor, none blocking)
- Submit-count counts RAW lines, not parseable ones. Typed two pure-garbage lines and the button
  said "Audit 2 URLs" (enabled). On submit it correctly skips them, but the pre-submit label
  oversells. I'd label by parseable count (or "Audit up to N"). Copy nit, not a bug.
- (Test-env note, not the app: my driver script mis-indexed a column once due to the row checkbox;
  the app's own validation behaved correctly.)

The audit copy is human, explains *why* an inconsistency matters, and pairs every flag with a Fix
or Undo. That's a considered tool. I'd bring it up unprompted to anyone QA-ing campaign links.

```json
{"name":"Aisha","clarity":"Yes","value":"Yes","advocacy":10}
```
