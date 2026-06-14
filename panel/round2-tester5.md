# Dana — Demand-gen marketer — Round 2 (Campaign Naming Template, new preview)

I tag 30+ links every Thursday and hand-police a q3_paid_linkedin convention. Came back to
re-check my two round-1 nits, then re-judged fresh.

## Prior frictions — both VERIFIED FIXED
- R1 #1 (subtle Build-name pill): NOW a solid teal **"⊞ Build name"** filled button right under
  the utm_campaign cell — measured 106×44px, white text on saturated teal. Marquee feature finally
  looks like one; I'd never miss it now.
- R1 #2 (panel collapses/reads empty on reload): after reload the panel stays EXPANDED (▲) and my
  segments restored — inputs read quarter/channel/audience in the structure editor AND reflected
  per-row. No data-loss scare.

## Fresh pass
- Template panel is now at the TOP of the right rail, auto-expands cold, distinct grid icon, sub-
  label "Define your campaign-name structure — its parts and their order", and "Different from
  Allowed Values" inline. The Allowed-values/Campaigns panels sit clearly below — zero confusion.
- Defined 3 segments + `_` separator; per-row Build name composer present on every row. No JS errors.
- Density check (my thing): all editable columns (BASE URL/SOURCE/MEDIUM/CAMPAIGN/TERM/GENERATED/
  ACTIONS) stayed on-screen at 1280px. The fixed right rail (~210px) still leaves BASE URL and
  GENERATED URL cells a bit narrow, but nothing got pushed off — same as R1, no new crowding.

## Verdict
Both UX nits that kept me at 8 are gone, the headline feature is now obvious, and reload is
trustworthy. This is the Thursday convention-grind automated. I'd screenshot it for the team channel.

```json
{ "name":"Dana", "clarity":"Yes", "value":"Yes", "advocacy":9,
  "prior_concerns_addressed":"Yes — Build name is now a 106x44 solid teal button and reload restores the full template into an expanded panel; both verified.",
  "likes":["Build name is now a prominent solid teal 44px button under utm_campaign — marquee feature finally legible",
    "Reload keeps panel expanded and restores quarter/channel/audience segments — no data-loss scare",
    "Naming Template moved to top of rail, auto-expands cold, distinct from Allowed Values via icon+sublabel+inline note",
    "Per-row guided composer on every row; off-template enforcement toggle right in the panel",
    "All editable grid columns stay visible at 1280px — no crowding from the panel"],
  "frictions":[
    {"severity":"P3","issue":"Fixed ~210px right rail still squeezes BASE URL and GENERATED URL cells narrow at 1280px — readable but tight for a data-dense user; a collapse-rail toggle would help"}],
  "verdict_sentence":"Both round-1 nits are fixed — the Build-name button is now an unmissable solid teal 44px control and reload restores the full expanded template — so the convention-policing I do by hand every Thursday is now obvious and trustworthy, earning a 9." }
```
