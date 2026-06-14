# Round 1 — Tester 8 (Rob, freelance brand/visual designer, desktop)

I tag a handful of client campaign links occasionally. Today I either type the query string
by hand or keep a Google Sheet with a CONCATENATE formula. My reflex is "I could just type
this myself in 4 minutes." I built a small batch and exported CSV to judge if it beats that.

What worked: I typed `Facebook` / `CPC` / `Spring Sale 2026` and Auto-fix corrected them to
`facebook`, `cpc`, `spring_sale_2026` (green highlights + an Undo toast). Copy all URLs and
the CSV exported clean — proper headers, a generated_url column, base URLs intact. No login,
runs locally. The casing/space fixing is the genuine win over my Sheet, which never catches a
stray capital that splits GA4 data. At 375px the toolbar reflows fine; I'd never use it on
mobile but it doesn't break.

What held it back: the headline ("enforces your team's UTM taxonomy — stop policing casing")
is pitched at a marketing-ops team lead, not a freelancer tagging 3 links — I almost bounced
thinking it was enterprise governance. And the first screen is crowded with BULK EDIT, LINT
RULES, "Enforce UTM Spec", presets, and a Campaigns panel, which makes a simple tool look
like a config app. For one link my Sheet ties it; the batch + auto-fix is where it pulls
ahead, but that payoff isn't sold up front.

CLARITY (is the purpose clear in 5s): Partially — grid + Export CSV is obvious, but the headline reads like enterprise team-governance, not a freelancer's link tagger.
VALUE (would it save you real time): Yes — auto-fixing my casing/spaces and a clean CSV beats my Google Sheet on a 5–10 link batch; ties it for a single link.
ADVOCACY (0-10, would you recommend to a peer): 6 — solid engine, real fix for real mistakes, but incremental over my Sheet and dressed up heavier than the simple job it does.
TOP FRICTION: the headline + button-heavy first screen pitch this at a marketing-ops team lead and bury how simple the core flow actually is — a freelancer nearly bounces before reaching the value.

```json
{"tester": 8, "round": 1, "clarity": "Partially", "value": "Yes", "advocacy": 6, "topComplaints": ["Headline ('enforces your team's UTM taxonomy') and crowded first screen pitch at a marketing-ops team lead, not the freelancer using it — almost bounced", "Win over my existing Google Sheet is real but incremental for low-volume tagging; not 'mention it unprompted' territory"], "priorConcernsAddressed": "n/a"}
```
