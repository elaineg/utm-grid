# Dana — Demand-gen marketer — Round 1 (Paste & Audit URLs)

I tag 30+ links every week before Thursday. The casing-typo problem this fixes is the exact
thing that quietly splits my GA4 reports into "LinkedIn" vs "linkedin" garbage. I came in
skeptical but motivated.

## 1. Discoverability — did I notice it?
Yes, instantly. The violet **"Paste & Audit URLs"** chip sits in the top toolbar next to Import
CSV, with a magnifier icon and subtext "Already have tagged links? Paste them to find every
inconsistency at once." In one scroll I knew it was for *auditing existing* links, not building
new ones. No hunting — a real one-scroll win for someone who bounces fast.

## 2. Using it — does it actually work?
Pasted 5 lines: two LinkedIn URLs differing only by casing (LinkedIn/social vs linkedin/Social),
a clean newsletter one, a google one missing utm_medium, and junk "this is not a url".

It nailed everything:
- Parsed each valid URL back into a row (base URL split from utm_* columns). Correct.
- Toolbar summary: **"Audited 4 URLs — 7 cells flagged · 1 line skipped · Undo"**. It told me the
  junk line was skipped instead of crashing or silently eating it. That transparency earns trust.
- Cross-row casing flags: ⚠ "Inconsistent utm_source across rows: 'LinkedIn' vs 'linkedin' — these
  will split campaign data in GA4." Same for social/Social. That sentence is *literally* my value
  prop in my language. It also caught per-cell uppercase and the missing required utm_medium.
- Undo sits right in the toolbar, and the dialog promised it up front. Safe to try on real data.

Beats my real workflow (eyeballing a Google Sheet column, or pasting URLs into GA4's checker one at
a time). 30 links audited in seconds vs ~15 min of squinting. I'd use this every single week.

## 3. Regression on prior value?
None found. Typed a fresh row → generated URL assembled correctly; "Copy all URLs" copied the clean
link to clipboard. Core build-new grid still works.

## Friction / nits (minor)
- "1 line skipped" doesn't say *which* line or *why*. For a QA tool handling 50 links I'd want to see
  what got dropped, so I trust it didn't silently lose a real URL.
- Append is the default and adds to the existing empty row; I had to consciously pick Replace. A
  first-timer could end up with a stray blank row.

## Verdict
Clear, fast, speaks GA4. This is the feature that turns the app from "nice builder" into "thing I
screenshot for the team channel." The skipped-line opacity is the one thing keeping it off a 10.

```json
{"name":"Dana","clarity":"Yes","value":"Yes","advocacy":9}
```
