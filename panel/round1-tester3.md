# Round 1 — Wen (Marketing data analyst, GA4 reporting, lives in data hygiene)
# Focus: NEW "Campaign Naming Template" feature

## Prior concern re-check (I remember this app)
Last time I docked points for warnings REPEATING per-row instead of grouping, and wanting a
one-click fix from the lint. Not re-tested in depth this round (different feature). The paste/
audit + CSV-in/out I relied on before are still intact — no regression seen this pass.

## Clarity — Yes
Cold open, desktop. Headline "Clean UTM links for your whole campaign — in one grid" + subhead
"Auto-fix messy casing and typos before they split your Google Analytics" = for me in <10s. The
right rail has three clearly separated panels: Campaigns, "Allowed values", and "Campaign Naming
Template". The template panel's own copy nails the distinction: "The STRUCTURE of utm_campaign —
its parts and their order. Different from Allowed Values, which sets allowed field values." I
never confused the two. Teal template warnings vs purple allowed-value warnings is a clean split.

## Using the new feature
Added segments (channel, audience), set separator "_", added allowed tokens (paid/organic,
newusers). Per-row "Build name" composer opened over the utm_campaign cell with a live "Preview:"
line; picking tokens built `paid_newusers` and Apply wrote it cleanly into the cell. Toggled
"Enforce naming template" and typed `Summer_Sale_2026` — got a "1 cell off-template" badge plus
TWO precise warnings: "⚠ Off-template — expected 2 segments, found 3" AND "⚠ Contains uppercase
letters — use lowercase only". That casing lint is exactly the bug class that splits my GA4 rows.

## Value — Yes
Today I lint UTM casing with a BigQuery query + a Sheet of allowed values, and dirty campaign
names still slip through and split rows in Looker. This catches both, in-session, and speaks GA4.
CSV export is strict and honest: clean unquoted header `base_url,utm_source,utm_medium,...`,
generated_url matches exactly, footer confirms "source cells left as typed" — no invisible
transforms. That trust is my #1 requirement and it passed.

## Friction
- **P1 — naming template does not hydrate on reload.** Confirmed: localStorage saves it
  (`utm-grid:naming-template` held my 2 segments + tokens), but on load only the `enforceTemplate`
  toggle restores — segment definitions render EMPTY (verified by seeding LS pre-load: enforce ON,
  segments []). As a daily returning analyst I'd come back, find enforce ON but my convention gone,
  and either everything flags or enforcement silently no-ops. Defeats "define once, reuse next
  week" — the whole point of saving a template.
- **P3** — token-add reacts to Enter/blur but the "Add" button isn't always obviously the commit;
  a less technical marketer might not realize Enter commits a token.

## Advocacy — 6
In-session it's the UTM lint tool I've wanted and I'd demo it; but the template silently failing
to restore on reload is the one thing that has to work for a returning user, and it drops me from
a 9 to a 6.

```json
{ "name": "Wen", "clarity": "Yes", "value": "Yes", "advocacy": 6,
 "likes": ["Naming Template panel clearly distinct from Allowed values with explicit 'STRUCTURE vs values' copy", "Build name composer shows live Preview and Apply writes utm_campaign cleanly", "Enforce gives specific warnings: 'expected 2 segments, found 3' AND uppercase casing lint", "Strict honest CSV export — clean header, generated_url matches, source cells untouched", "Teal vs purple visual separation of template vs allowed-value warnings"],
 "frictions": [
   {"severity":"P1","issue":"Naming template segments do not hydrate on reload: localStorage saves segments+tokens, but on load only the enforceTemplate toggle restores — panel shows empty segments (verified by pre-load LS seed: enforce ON, segs []). Returning daily user loses their convention while enforce stays ON; off-template checks then run against an empty template. Breaks 'define once, reuse next week'."},
   {"severity":"P3","issue":"Token-add commits on Enter/blur but the 'Add' button isn't an obvious commit affordance; a less technical marketer may not realize Enter adds the token."}
 ],
 "verdict_sentence": "In a single session this is the UTM lint tool I've wanted — strict CSV, casing checks, and a naming template clearly distinct from allowed values — but the template silently fails to restore on reload, which for a daily returning analyst is the one thing that has to work." }
```
