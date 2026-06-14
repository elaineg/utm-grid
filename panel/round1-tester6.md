# utm-grid — Round 1, Tester 6 (Jules, content & community marketer)

I juggle links across X, LinkedIn, Mastodon and Buffer all day and I QA tagged links
before they go out, so a "paste what I already have and tell me what's wrong" feature is
the exact chore I dread.

## 1. Discoverability — Yes
I spotted "Paste & Audit URLs" within 5 seconds: it's a violet chip sitting right next to
Import CSV, and the grey subtext under it — "Already have tagged links? Paste them to find
every inconsistency at once." — instantly told me this is the AUDIT path, not the build-new
path. No hunting. The dialog header "Paste your existing tagged URLs / One full URL per
line. We'll parse each back into the grid and flag every inconsistency." removed any doubt.

## 2. Using it — Yes, this saves me real time
Pasted 5 lines including two that differ only by casing
(Twitter/Social/Spring_Sale vs twitter/social/spring_sale) plus a missing-campaign line and
one garbage line.
- Parse is correct: each URL split into BASE URL + utm_source/utm_medium/utm_campaign as
  separate cells, original casing preserved (so it can actually catch the diff).
- Inconsistencies surfaced loudly and in MY language: "Inconsistent utm_source across rows:
  'Twitter' vs 'twitter' — these will split campaign data in GA4." That GA4 framing is
  exactly why I care. Uppercase got a one-tap "Fix". Missing utm_campaign flagged on the
  linkedin row.
- Malformed line handled gracefully: banner said "Audited 4 URLs — 12 cells flagged · 1
  line skipped. Undo" — it skipped the junk instead of crashing or silently eating it, and
  TOLD me it skipped one. That honesty earns trust.
- Undo button appears in the toolbar and fully clears the import. Append/Replace choice up
  front. Zero console errors.
Today I eyeball these in a spreadsheet or paste links into a generic UTM checker one at a
time. Doing the whole batch + cross-row consistency in one paste is a clear win, and I'd hit
this several times a week before campaign launches.

## 3. Prior value / regression — none
Cold open still has the grid, presets, auto-fix naming, Export CSV, Copy share link, shared
workspace — all intact, no login wall. Mobile (iPhone, half my work): the chip is visible,
the dialog and the violet "Audit N URLs" button fit cleanly, and per-row warnings stay
readable. No regression I could find.

## Friction / nits (minor)
- Post-audit warning text is verbose on mobile — each row repeats the full "will split
  campaign data in GA4" sentence, so a 5-URL audit is a long scroll. A collapsed
  "12 issues — tap to expand" per row would be cleaner on a phone.
- "1 line skipped" doesn't say WHICH line. For one junk line it's obvious; for a 40-link
  paste I'd want to know which one got dropped.
Neither blocks me.

## Verdict
A genuinely useful, well-judged feature that nails the exact pain (casing drift splitting
GA data) in language a marketer thinks in, with graceful malformed handling and an undo
safety net. I'd use this and mention it to marketing-ops friends — not quite a 9 because the
mobile warning verbosity and the "which line skipped" gap keep it from feeling effortless.

```json
{"name":"Jules","clarity":"Yes","value":"Yes","advocacy":8}
```
