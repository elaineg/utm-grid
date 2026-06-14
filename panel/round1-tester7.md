# Round 1 — Tester 7 (Aisha, Product Designer)

A teammate shared this; I judge craft hard — spacing, copy tone, empty states, lint affordances.

## Clarity — Yes
The H1 "Share one link that enforces your team's UTM taxonomy — stop policing casing and typos
that split your GA4 data" plus the verb subhead (build, tag, fix naming, export CSV, no account)
told me in 5s what it is and who it's for: a growth/marketing team standardizing UTMs. The words
"Auto-fix naming," "Lint Rules," and "Enforce UTM Spec" are what landed for me.

## Value — Yes
Today I'd hand-build UTMs in a Notion table / shared Google Sheet and nag teammates about casing
in Slack. The lint toggles + Auto-fix (LinkedIn→linkedin, Paid Social→paid_social, Q2 Launch→
q2_launch, with an inline "Contains uppercase — use lowercase ('newsletter'). Fix" hint and an
"Undo" toast) do the policing the sheet can't. The shareable link that carries the spec is the part
I'd actually advocate — the taxonomy travels, not just the values.

## Craft notes
Desktop is considered: green-border "fixed" cells, inline "warnings · Fix" affordances, Undo toast,
preset pills, "nothing is sent to any server" reassurance. Nit: column headers clip (UTM_MEDIUM →
"UTM_MED", GENERATED URL cramped). I also couldn't tell at a glance whether the violet "Enforce UTM
Spec" category visually outranks plain amber lint in the grid — off-spec and case warnings read as
the same amber until you click a cell, so a taxonomy violation doesn't pull my eye on a long grid.
Mobile (375px) is the standout: genuinely phone-designed, not a squashed table — vertical cards,
uppercase labels with red required asterisks, full-width inputs, per-card "Copy URL", bulk edit
collapsed to "Expand," "Select #1" row affordance. Nits: duplicate/trash icons are thin wireframe
glyphs that read unpolished, and empty GENERATED URL is a bare "–" instead of a "fill required
fields" hint. (Copy share link verified; clipboard returned the #g= link in my env.)

## Verdict
```
CLARITY (is the purpose clear in 5s): Yes — H1 + verb subhead nail the "stop policing UTM casing" job instantly.
VALUE (would it save you real time): Yes — Auto-fix + lint + spec-in-link replaces my Notion table and Slack nagging.
ADVOCACY (0-10, would you recommend to a peer): 8 — I'd raise it with my growth team; held back by amber/violet lint not being glance-distinct and minor card-icon/header polish.
TOP FRICTION: Off-spec (violet "Enforce UTM Spec") cells read as the same amber as plain case/space lint until you click — on a long grid I can't glance-distinguish a typo from a taxonomy violation, which defeats the separate category; plus clipped desktop column headers ("UTM_MED").
```

```json
{"tester": 7, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Off-spec/taxonomy violations render the same amber as plain case/space lint in the grid — the violet 'Enforce UTM Spec' distinction isn't glanceable, only one click deep", "Desktop column headers clip (UTM_MEDIUM → 'UTM_MED'); mobile duplicate/trash icons + bare '–' empty generated-URL state feel a notch below the otherwise considered craft"], "priorConcernsAddressed": "n/a"}
```
