# Round 2 — Wen (Marketing data analyst, GA4 reporting, lives in data hygiene)

## Prior concern re-check — the reload hydration bug
RIGOROUSLY verified two ways. (1) Defined channel/audience segments + tokens + "_" separator +
Enforce in the UI, reloaded — LS held the full template incl enforceTemplate:true. (2) Seeded LS with a
clean 2-segment template [channel:{paid,organic}, audience:{newusers,retarget}] + "_" + enforce,
reloaded, read inputs with NO clicks: segment-name inputs came back ["channel","audience"] and Enforce
restored checked:true. The FULL template hydrates now — not just the toggle. My round-1 P1 is FIXED.
(My earlier "empty" reads were my own artifact: clicking the panel header collapses an already-expanded
panel; the values were in the DOM the whole time.)

## Clarity — Yes
Same strong cold open. New: Naming Template panel sits at TOP of the rail with a distinct teal block-
icon, header "Campaign Naming Template", sub-label "Define your campaign-name structure — its parts and
their order", and explicit "Different from Allowed Values" copy. Never confused the two. "Build name" is
now a solid teal button on the utm_campaign cell — reads as the primary action.

## Value — Yes
I lint UTM casing in BigQuery + a Sheet of allowed values and dirty names still split my Looker rows.
This catches casing + structure in-session, speaks GA4, strict honest CSV (clean header, generated_url
matches, source cells untouched). With the reload fix, "define my convention once, enforce it next week"
finally holds — the difference between a demo and a tool I'd keep open.

## Friction
- P3 — rail Naming Template panel doesn't reliably auto-expand on reload; sometimes comes back collapsed
  (the down-chevron) and I click the header to reveal my segments. State preserved, just hidden.
- P3 — token-add still commits on Enter/blur; "+ add token (optional)" placeholder is clearer, but a
  less technical marketer may not realize Enter commits.

## Advocacy — 9
The one thing that had to work for a returning daily analyst now works: my template survives reload
intact. With strict CSV, casing lint, and a clearly-distinct naming template, this is the UTM hygiene
tool I've wanted and I'd bring it up unprompted to my analytics team. Only the cosmetic auto-expand nit
keeps it off a 10.

```json
{ "name":"Wen", "clarity":"Yes", "value":"Yes", "advocacy":9,
 "prior_concerns_addressed":"Yes + reload now restores full template (segments+tokens+separator+enforce), verified via UI-define reload AND seed-LS-then-load with no clicks; round-1 P1 fixed",
 "likes":["Naming Template hydrates fully on reload — segments [channel,audience] + tokens + separator + enforce all restore","Template panel promoted to top of rail with distinct teal icon, sub-label, and explicit 'Different from Allowed Values' copy","Build name composer is now a solid teal primary button on the utm_campaign cell","Strict honest CSV unchanged — clean header, generated_url matches, source cells left as typed","Define-once-reuse-next-week promise finally holds"],
 "frictions":[
   {"severity":"P3","issue":"Rail Naming Template panel doesn't reliably auto-expand on reload — sometimes comes back collapsed and I must click the header to see my restored segments; state is preserved, just hidden."},
   {"severity":"P3","issue":"Token commit on Enter/blur is implicit; '+ add token (optional)' helps but a less technical marketer may not realize Enter commits a token."}
 ],
 "verdict_sentence":"The reload hydration bug that dropped me to a 6 is genuinely fixed — my multi-segment template plus tokens, separator, and enforce all survive a reload (verified by both defining-in-UI and seeding localStorage then loading) — so define-once-reuse-next-week finally holds, and this is now the UTM hygiene tool I'd recommend to my analytics team." }
```
