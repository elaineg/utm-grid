# Round 2 — Tester 2 (Marcus, frontend engineer, desktop Chrome 1280px, devtools open)

Re-checked my two round-1 frictions cold, then re-ran the full template→enforce→off-template flow.

**Prior concern 1 (template panel buried at bottom of sidebar):** FIXED. The "Campaign Naming
Template" card is now the TOP of the right rail, teal-bordered, auto-expanded cold, with a
distinct grid icon and a "Define your campaign-name structure — its parts and their order"
sub-label, plus a "Define structure →" pointer right under the top Enforce-naming toggle. I'd
find it by scanning now, not by accident.

**Prior concern 2 (flagged cell hidden when grid collapses on a long URL):** PARTLY fixed. Good:
the off-template warning now renders inline in the row ("⚠ Off-template — expected 3 segments,
found 1", confirmed in the DOM), the composer popover is no longer clipped, columns aren't
deleted. But on my actual 1280px laptop, with Enforce on and a real long generated URL the table
grows to ~1982px inside a ~1022px overflow-x-auto container, so the GENERATED URL column
dominates and squeezes UTM_MEDIUM/UTM_CAMPAIGN/UTM_TERM out of the viewport — even scrolled fully
left I see BASE URL, a truncated UTM_SOURCE, then it jumps straight to GENERATED URL. The flagged
campaign cell + its warning are in the DOM but I still have to horizontal-scroll to read them.
Improved, not fully solved at a standard laptop width.

**Clarity** — Yes. H1 + subhead still land in 5s; the new top template card closes the one
disambiguation gap I had.

**Value** — Yes. Still beats hand-typing query params and a wiki convention nobody follows;
segment-structure enforcement + the Build-name composer is the thing I'd actually adopt.

**Advocacy** — 9. The discoverability fix was my single biggest blocker and it's genuinely
resolved; zero console errors, share link round-trips, polished. I'd drop it in our launch Slack
now. Not a 10 only because the GENERATED URL column still overflows the grid on a normal laptop
width with a long URL, so the flagged cell needs a horizontal scroll to see — a sticky/clamped
generated-URL column or a row-level warning banner pinned left would earn the 10.

```json
{ "name":"Marcus", "clarity":"Yes", "value":"Yes", "advocacy":9,
  "prior_concerns_addressed":"Partly — panel-buried fully fixed (now top, auto-expanded, distinct icon+sub-label+pointer); long-URL column squeeze only partly fixed: warning renders in DOM but GENERATED URL column still overflows the 1280px grid so the flagged utm cell needs horizontal scroll",
  "likes":["Naming Template now top of rail, auto-expanded, teal-bordered, 'Define your campaign-name structure' sub-label + 'Define structure →' pointer from the Enforce toggle","Off-template warning now renders inline in the row ('expected 3 segments, found 1') and is no longer clipped/portaled","Build-name composer is a solid teal ≥44px filled button — easy to hit","Share link round-trips the template, no login, zero console errors, core flow unregressed"],
  "frictions":[
    {"severity":"P2","issue":"At 1280px with Enforce on and a long generated URL the table overflows its container (~1982px in ~1022px); the GENERATED URL column squeezes UTM_MEDIUM/CAMPAIGN/TERM out of view, so the flagged campaign cell + its warning require horizontal scroll to read inline"},
    {"severity":"P3","issue":"JOIN PARTS WITH / separator still only offers _ or - presets; a custom separator (e.g. |) would be nice, not blocking"}
  ],
  "verdict_sentence":"My buried-panel blocker is genuinely fixed — the naming template is now the first thing you see — so this is a 9 I'd share in Slack; the only thing between it and a 10 is that a long generated URL still overflows the desktop grid and pushes the flagged cell out of view until you scroll." }
```
