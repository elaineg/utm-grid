# Round 2 (re-test: Paste & Audit URLs) — Tester 8 (Rob, freelance brand/visual designer, desktop, judges layout craft hard)

Re-opened cold at my normal 1680px AND a tighter 1500px, both with the Campaigns sidebar open, and
re-ran the exact thing that burned me last round: pasted casing-only dupes (Facebook/facebook,
Social/social, Spring_Sale/spring_sale) plus a garbage line.

## Prior concerns — both addressed

1. LAYOUT BUG ("parsed values vanished") — RESOLVED in the way that mattered. After auditing there's
   now a full-width GROUPED SUMMARY panel ABOVE the grid, in normal flow (violet header
   "Audit complete — 4 URLs parsed · 12 cells flagged"), not a side panel. Per field it states:
   `utm_source: Inconsistent values (4 cells): "Facebook" vs "facebook" · Contains uppercase letters`
   for source/medium/campaign, then `1 line skipped (no valid URL found): Line 5: "this is not a url
   at all"`. So before I even look at the grid I can SEE every parsed/flagged value — nothing reads as
   vanished. AND the grid now auto-scrolls to the first flagged column (measured scrollLeft jumped 0→200):
   at 1680px UTM_SOURCE is in view, at 1500px UTM_SOURCE + UTM_MEDIUM are both fully in view with their
   warnings. Last round these collapsed to a sliver labeled "U" behind the GENERATED URL column.

2. Flags say WHY plainly — RESOLVED. Both the summary AND the per-cell warning spell it out:
   "⚠ Inconsistent utm_source across rows: 'Facebook' vs 'facebook' — these will split campaign data in
   GA4." That last clause is exactly the "why it matters" a non-technical designer needs. No more inferring.

## Remaining friction (why not a 9)
- The grid is STILL a horizontal-scroll strip because the GENERATED URL column is very wide; at 1680px
  with the sidebar, UTM_CAMPAIGN/TERM/CONTENT still sit off-screen-right and the 2nd header clips to "UTM_".
  The auto-scroll + summary mean I'm no longer fooled and the values are reachable — but a craft eye still
  sees an overflowing table rather than a grid that fits. Truncating/narrowing the GENERATED URL cell (the
  offender) would make this feel finished. Polish now, not a bug.

## Regression check — none
0 console errors at both widths. Toast correctly reads "Audited 4 URLs · 1 line skipped — see summary
above. Undo." Garbage line skipped, casing dupes preserved as distinct (not silently merged), Undo present.
The one-click normalize I loved last round is intact.

CLARITY: Yes — summary header + subline tell a stranger exactly what happened.
VALUE: Yes — the audit + plain-English "this will split your data in GA4" + one-click fix beats me
eyeballing a column of links in a Sheet; I'd reach for this QA'ing a client's tagged links.
ADVOCACY: 8/10 — up from 7. Both my blockers are genuinely gone; I can read AND fix the data without it
looking broken. Held at 8 (not 9) only because the GENERATED URL column still forces horizontal scroll on
the grid, which a designer notices.

```json
{"name":"Rob","clarity":"Yes","value":"Yes","advocacy":8}
```
