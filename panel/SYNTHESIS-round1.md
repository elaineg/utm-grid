# My Workspaces — Panel Round 1 Synthesis

Feature under test: **My Workspaces** (device-local index of every `/w/<id>` workspace this
device created/opened, on the main builder `/`).

## Score table

| # | Name   | Clarity | Value | Advocacy |
|---|--------|---------|-------|----------|
| 1 | Priya  | Yes     | Yes   | 8        |
| 2 | Marcus | Yes     | Yes   | 8        |
| 3 | Wen    | Yes     | Yes   | 8        |
| 4 | Tomás  | Yes     | Yes   | 8        |
| 5 | Dana   | Yes     | Yes   | 9        |
| 6 | Jules  | Yes     | Yes   | 8        |
| 7 | Aisha  | Yes     | No    | 6        |
| 8 | Rob    | Yes     | Yes   | 7        |
| 9 | Elena  | Yes     | No    | 5        |
| 10| Sam    | Yes     | Yes   | 9        |

**Clarity: 10/10 Yes. Value: 8/10 Yes** (Aisha & Elena = No, both self-declared out-of-ICP:
Aisha makes a handful of UTMs/year, Elena rates her own recurring use rather than a
marketer's). **Advocacy mean ≈ 7.6.**

**Passing testers (advocacy ≥9 AND clarity=Yes AND value=Yes): Dana (9), Sam (9) = 2/10.**

The feature WORKS end-to-end for everyone — every tester confirmed create → return → panel
remembers it → Open round-trips data → Copy link puts the exact `/w/<id>` URL on the
clipboard → Remove drops it. Zero console errors reported. The gap is craft, not function.

## Complaints grouped by cause

### Cause A — Workspaces are labeled by the raw secret ID; no way to NAME them; search matches only the gibberish ID. (8/10 — REAL, the dominant blocker)
Testers: **Marcus, Wen, Tomás, Jules, Aisha, Rob, Elena, Sam.**
- Entries render as "Workspace HbqwUjvW" / "Workspace gGDwcfNTIB" / "Workspace 2_deQGNL" etc.
  — meaningless once a user has more than one (agency/multi-campaign users hit it hardest:
  Rob, Wen, Tomás, Elena).
- **No working rename.** Rob hunted and found only a faint "+" by the workspace title that
  "doesn't read as rename and produced no name field" — so rename is absent or undiscoverable.
- **Search is actively harmful (Rob):** the panel ships a Search box that matches only the
  random ID, so typing a real client name ("acme"/"zenith") returns 0 results — it HIDES the
  very thing the user wants. Aisha independently called the search "pointless when every item
  is gibberish."
- Surfacing the secret-id prefix as the visible label "feels wrong for a secret-link feature"
  (Marcus, Tomás).
- This is the SINGLE named blocker for Marcus, Wen, Rob, Sam ("let me name it and it's a 9")
  and a top-two for the rest. **Highest-leverage fix by far.**

### Cause B — Landing discoverability: My Workspaces renders BELOW the grid / grid buried behind banners. (4/10 — REAL)
Testers: **Dana, Aisha, Elena, Marcus.**
- Dana & Elena: the panel "sits at the very bottom under the grid, Presets, and Bulk Edit" —
  a skim-budget user (Dana tags 30+ links/wk; Elena reads between meetings) never scrolls
  that far. Dana: "pull My Workspaces up and it's a 10."
- Compounding: the editable grid itself sits ~668px down behind stacked feature banners (Dana
  measured; Aisha & Elena echo "over-stuffed / ~10 controls"). The grid-buried-behind-banners
  debt is broader than this feature.
- NOTE: the current brief §1 ALREADY specifies the panel as the top-most, auto-expanded
  section of the right rail — testers still saw it below the grid, so either the build
  regressed the spec or the rail stacks below the grid at their width. Must be re-verified
  high + above/beside the grid.

### Cause C — "Auto-fix naming" is incomplete: it skips utm_source and leaves trailing punctuation. (2/10 — REAL, two independent personas)
Testers: **Wen, Priya.**
- Wen (the exact pain she came to kill): Auto-fix lowercased utm_medium (CPC→cpc) and
  utm_campaign (Summer Sale→summer_sale) but **left utm_source "Google" capitalized** — the
  cross-field casing split that fragments GA4 survived the one-click marquee fix.
- Priya: Auto-fix left a trailing "!" in "Launch Day!" → "launch_day!" — URL-safe but the
  headline sells "clean".
- Real because it defeats the headline promise; Wen's is the higher-severity (a UTM field
  skipped entirely by the fix).

### Cause D — Mobile tap targets on My Workspaces row actions are ~36px and cramped. (2/10 — REAL)
Testers: **Jules, Sam (both tested at 375px).**
- Open / Copy link / Remove are ~36px tall, under the 44px comfortable thumb target; Sam:
  "Remove sits right next to Open" (mis-tap risk on a destructive action). Otherwise good
  mobile craft (no horizontal scroll, green "Copied!" both verified).

### Cause E — No X/Twitter or Mastodon channel preset. (1/10 — single-persona, on-ICP)
Tester: **Jules** (content & community marketer). Presets cover LinkedIn/Google/Email/Organic
but not the two platforms she posts to most, so she still hand-types them. Single persona, but
squarely in the target ICP and a cheap additive win.

### Single-persona / out-of-scope items (noted, NOT fixed this round)
- **Duplicate DOM render of the panel** (Priya — two "Open" elements, one hidden). Code smell
  that nicks an engineer's trust; matches the recorded `dual-render-global-listener` friction.
  Route to builder as a quick cleanup verify; single-persona.
- **Crowded toolbar / "share-verb soup"** ("Copy share link" vs "Create shared workspace" vs
  "Copy all URLs"): named by Priya, Marcus, Tomás, Dana, Jules, Aisha, Elena — RECURRING and
  real, but it's the broader landing/share-disambiguation debt, not the My Workspaces feature
  under test. Log to BACKLOG, do not redesign this run.
- **Read-only / view-only share mode** (Tomás — "anyone with the link can edit" worries him
  for company data). Single-persona, needs a permissions model; backlog.
- **Cross-device / team sync** (Elena's path to value): needs accounts + server, blocked on a
  missing credential, would regress the zero-network prop. Accepted structural holdout — Elena
  is the lone out-of-ICP non-pass; ceiling for this round is 9/10.
- **Aisha value=No / Elena value=No**: both self-declared out-of-ICP (rare/infrequent UTM
  authors). Not addressable by craft; the panel ceiling is 9/10, not 10/10.

## Fix priority (recurrence-ranked)
1. **A (8/10)** — name workspaces (inline rename) + friendly default label + search-by-name.
   Flips Marcus, Wen, Rob, Sam and lifts the rest. Biggest lever.
2. **B (4/10)** — surface the panel high/discoverable, compact, not below the grid.
3. **C (2/10)** — uniform lowercase across ALL utm_* fields (utm_source included).
4. **D (2/10)** — ≥44px mobile tap targets with spacing so Remove isn't crammed on Open.
5. **E (1/10, on-ICP)** — add X/Twitter + Mastodon presets.
