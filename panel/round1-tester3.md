# Round 1 — Wen (Marketing data analyst, GA4 reporting, lives in data hygiene)
# Focus: NEW "Paste & Audit URLs" feature

## Discoverability — Yes
Cold open, desktop. Headline "Clean UTM links for your whole campaign — in one grid" + subhead
"Auto-fix messy casing and typos before they split your Google Analytics" told me in <10s this
is for me. The **Paste & Audit URLs** violet chip sits right by Import CSV with its own subtext:
"Already have tagged links? Paste them to find every inconsistency at once." Noticed it WITHOUT
hunting; audit-existing vs Add-row (build-new) was immediately distinct.

## Using it
Dialog: "Paste your existing tagged URLs — One full URL per line. We'll parse each back into the
grid and flag every inconsistency." Append/Replace toggle + "Either way you can Undo immediately
after auditing" — the reassurance a transform-paranoid analyst wants.

Pasted 5 lines: two differing only by casing (Facebook/facebook, spring_2026/Spring_2026), cpc
vs CPC on medium, one missing utm_medium, one garbage non-URL.
- Live count "Audit 5 URLs" → after submit: "Audited 4 URLs — 13 cells flagged · 1 line skipped.
  Undo". Transparent about the dropped line — no silent swallow.
- Parse is EXACT, verified per-column via inputValue: row3's missing utm_medium came in as a
  BLANK cell, not a guess; Facebook stays Facebook. No invisible transforms. This is the exact
  thing I distrust other tools for, and it passed.
- Lint speaks MY language: "Inconsistent utm_source across rows: 'Facebook' vs 'facebook' —
  these will split campaign data in GA4." Same for cpc/CPC and spring_2026/Spring_2026.
- Malformed line skipped + counted, not parsed into junk. 0 console errors the whole flow.

## Prior concern re-check (I remember this app)
Last round I flagged Shared UTM taxonomy not persisting server-side. Did NOT re-deep-test sync
this round (out of scope for the audit feature) — leaving that open; not re-verified fixed.

## Value — Yes
Today I dump inherited links into a Sheet, split on &, and write LOWER()/COUNTUNIQUE checks to
catch splits pre-launch. This does it in one paste and speaks GA4. I'd use it for pre-launch QA
more than once a week.

## Friction (not blockers)
- Warning list REPEATS the same pair once per offending row instead of one grouped "Facebook vs
  facebook (2 rows)". With 50 inherited links this gets noisy.
- I want a one-click "normalize / pick canonical" straight FROM a lint warning. Auto-fix naming
  exists separately; tying it to the flagged cells would close the loop.
- CSV in/out present (require it); prior build-new value intact, no regression seen this pass.

clarity: Yes
value: Yes
advocacy: 8 — genuinely good, I'd bring it up to other GA4 owners. Off 9 by repetitive
non-grouped warnings + no one-click fix from the lint itself.

```json
{"name":"Wen","clarity":"Yes","value":"Yes","advocacy":8}
```
