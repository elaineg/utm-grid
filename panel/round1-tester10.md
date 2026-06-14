# utm-grid — Tester 10 (Sam, Product Manager, mobile-heavy/laptop now) — NEW: Paste & Audit URLs

I coordinate launches: I want the team's UTMs consistent and shareable, export a clean CSV,
look organized, and never debug anything.

## 1. Discoverability — did I notice the audit entry?
Yes, immediately. The violet **"Paste & Audit URLs"** chip sits in the top toolbar next to Import
CSV, with a subtitle directly under it: *"Already have tagged links? Paste them to find every
inconsistency at once."* That subtitle is exactly what told me this is NOT the build-new flow —
it's for links I ALREADY have (the ones a teammate pastes in Slack or a campaign sheet). No
hunting, clear vs "Add row."

## 2. Using it
Pasted 4 lines: two differing only by casing (Newsletter/newsletter, Email/email,
spring_launch/Spring_Launch), one normal blog link, and one garbage line "this is not a url."
- Dialog is clean: "One full URL per line. We'll parse each back into the grid and flag every
  inconsistency," an Append/Replace toggle, and "Either way you can Undo immediately."
- Result banner: **"Audited 3 URLs — 10 cells flagged · 1 line skipped. Undo."** The malformed
  line was skipped and *counted* — no error, no choke. Exactly what I want.
- Casing problems caught in plain English: *"Inconsistent utm_source across rows: 'Newsletter'
  vs 'newsletter' — these will split campaign data in GA4."* That sentence is forwardable straight
  to my team; it says WHY it matters.
- Parse-back is correct. Exported CSV split cleanly: base_url, utm_source/medium/campaign each in
  their own column, plus generated_url. Round-trips into Sheets with zero re-entry.
- Bonus loop: clicked **Auto-fix naming** → "Auto-fixed 3 cells — Undo." So: paste → see what's
  broken → one click to normalize → export. That genuinely beats squinting at a column of links
  in a spreadsheet, which I'd never catch by hand.

Saves time vs today (paste into a Sheet and eyeball, or ping the analyst)? Yes — caught the
casing splits in two seconds and handed me copy to forward. I'd hit this more than once per launch.

## 3. Prior value / regressions
None. Grid, Export CSV, Copy share link, presets, campaigns, shared workspace all still present.
0 console errors. CSV export correct.

## Friction / nits (not blockers)
- The warning list repeats the same inconsistency once per affected row (saw the
  Newsletter/newsletter warning printed twice). Noisy — I'd want it deduped to one line per field.
- "1 line skipped" is reassuring but doesn't say WHICH line was bad. On a real 30-URL paste I'd
  need to know which one to fix, not just that one fell out. As a non-debugger, that bites at scale.

Tough-but-fair: does exactly what it claims, warning copy is unusually clear. Not a 9 only because
the warning noise and the unidentified skipped line would hurt on a real 30-link paste — which is
literally my use case.

```json
{"name":"Sam","clarity":"Yes","value":"Yes","advocacy":8}
```
