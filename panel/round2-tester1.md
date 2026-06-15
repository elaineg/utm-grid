{"name":"Priya","clarity":"Yes","value":"Yes","advocacy":"8","prior_concerns_addressed":"Partly — menu grouping + Naming/Allowed disambiguation + icon clipping all fixed; overall scope still broad but now navigable"}

# Priya — Round 2 re-test (utm-grid)
(My round-1 verdict for this thread: clarity Yes, value Yes, advocacy 7. Blocker: "Tools ▾
packs ~8 power features — the tool is bigger than the problem for occasional use." Also
noted Naming-Template-vs-Allowed-Values confusion and a truncated Generated-URL column.)

## What I re-checked (my three round-1 gripes)

1. **"Tools ▾ junk drawer of ~8 features" — my blocker.** Opened Tools. It's now a grouped,
   labeled menu: **BUILD & REUSE** (Channel Presets, Bulk edit, Campaigns) / **GOVERN
   CONVENTIONS** (UTM Spec, Naming Template, Run Launch Check) / **IMPORT & MOVE** (Audit
   URLs, Move to another device). Each item carries a gray one-line sub-caption ("saved
   channel field sets", "whole-grid compliance report"). I can find the one thing I want
   without reading all eight — it reads as a scannable index, not a flat dump. This changed
   my view: the menu no longer feels overwhelming. Partly resolves the blocker (see score).

2. **Naming-Template vs Allowed-Values confusion — RESOLVED.** Naming Template card now says
   "Define your campaign-name *structure* — its parts and their order… **Different from
   Allowed Values**"; Allowed Values says "Define allowed values per field — catch typos."
   The explicit cross-reference is exactly the disambiguation I asked for.

3. **Truncated Generated-URL column / clipped row icons — icons FIXED.** All four row action
   buttons (Copy, QR, duplicate ⧉, delete 🗑) sit inside the 1280 viewport (rightmost edge
   1267px) — not clipped. The Generated-URL *input* still visually truncates to `…spring-sa…`,
   but the value is complete: Copy yielded the full
   `https://acme.com/spring-sale?utm_source=news_letter&utm_medium=e_mail&utm_campaign=spring_sale_2026`.
   Display-only ellipsis, not data loss. Minor nit.

## Core grid flow
Typed messy values (" News Letter ", "E Mail", "Spring Sale 2026") → Auto-fix normalized to
`news_letter`/`e_mail`/`spring_sale_2026`, highlighted the 3 changed cells green, toast
"Auto-fixed 3 cells — Undo" with a working Undo. Zero console errors, instant. Faster than my
current habit (hand-editing a Google Sheet UTM template then manually lowercasing). Value: Yes.

## Score: 8 (up from 7)
The grouping fixed my actual blocker as a *readability* problem — same surface area, but now
navigable, so the tool no longer feels bigger than the problem. Subhead leading with "build a
batch of 30+ links at once" is the right hook.

**Single thing holding back a 9:** it's still a lot of chrome for an occasional solo user —
three top-level menus (Tools / Share / Rules) plus three persistent cards (Naming Template,
Campaigns, Allowed values) wrapped around a one-row grid. For my weekly batch I touch ~20% of
it; the rest is team/governance I'd never use solo. Well-organized now, not overwhelming — but
a "just the grid" default that collapses the governance cards until invoked would earn the 9.
I'd recommend it to a teammate who manages UTMs, with the caveat "ignore most of the panels."

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Still heavy chrome for occasional solo use — 3 top-level menus + 3 persistent governance cards around a 1-row grid; would prefer a 'just the grid' default that hides governance until invoked", "Generated-URL field still visually truncates (underlying value is complete; display-only)"], "priorConcernsAddressed": "some"}
```
