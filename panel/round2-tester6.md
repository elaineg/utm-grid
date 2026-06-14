# utm-grid — Round 2, Tester 6 (Jules, content & community marketer)

Re-test of "Paste & Audit URLs" on desktop (1280px) and mobile (375px). Cold open
unchanged: the violet "Paste & Audit URLs" chip sits next to Import CSV with subtext naming
it as the audit path. I pasted 5 already-tagged URLs: a Twitter/Social/Spring_Sale row, its
casing-only twin (twitter/social/spring_sale), a LinkedIn row missing utm_campaign, one
garbage line, and a Mastodon row.

## Did my two Round-1 complaints get fixed?

1. **Mobile warning verbosity → FIXED.** There is now a GROUPED SUMMARY panel sitting
   directly above the grid. It lists each field ONCE, deduped, with counts:
   - `utm_source: Inconsistent values (2 cells): "Twitter" vs "twitter" · Contains
     uppercase (3 cells) — Auto-fix can normalize`
   - `utm_medium: …` and `utm_campaign: … · Missing required value (1 row)`
   On my phone I read the whole audit verdict in one compact box at the top — three lines —
   instead of scrolling past a repeated "will split campaign data in GA4" sentence per row.
   That repeated-scroll dread is gone.

2. **"Which line skipped" → FIXED.** The summary spells it out:
   `1 line skipped (no valid URL found): Line 4: "this is not a url at all blah blah" — not
   a valid URL`. The banner now reads `Audited 4 URLs · 1 line skipped — see summary above.
   Undo` and points me up to that detail. For a 40-link paste I'd now know exactly which row
   got dropped. Trust earned.

## Regression check — none
Parse still correct, original casing preserved so the dupe is actually caught, one-tap
Auto-fix, Append/Replace chosen up front, Undo in toolbar. Zero console errors on both
viewports. Grid, presets, Export CSV, Copy share link, shared workspace all intact, no login
wall. Mobile dialog ("Audit 5 URLs", Append/Replace, undo note) fits cleanly at 375px.

## Remaining friction (minor)
The old per-row warning lines still render down inside the grid as well, so the long scroll
technically still exists below — but I no longer NEED to read it, because the summary up top
answers everything. Collapsing those duplicated row lines would be polish, not a blocker.
Nothing here holds me back now.

## Verdict
Both things that kept me at 8 are genuinely resolved, and resolved in marketer language. A
grouped, deduped summary that names the skipped line makes a 40-link audit feel effortless on
a phone — that's the bar where I'd bring this up unprompted in my marketing-ops channels.
Raising to 9.

```json
{"tester": 6, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Per-row GA4 warning lines still duplicate down inside the grid (harmless now that the summary leads, but could be collapsed)", "No native X/Twitter or Mastodon preset — my two top channels still typed by hand"], "priorConcernsAddressed": "all"}
```
