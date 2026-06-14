# UTM Grid — Panel SYNTHESIS Round 2

Build under test: utm-grid (latest DEEPEN — My Workspaces moved above grid, friendly names,
inline rename, search-by-name, X/Mastodon presets, share-action sublines). Re-test of the
round-1 holdouts.

## Score table (R1 → R2)

| # | Name   | Persona                          | Clarity | Value | Advocacy | Δ (R1→R2)  |
|---|--------|----------------------------------|---------|-------|----------|------------|
| 1 | Priya  | Senior backend eng, keyboard     | Yes     | Yes   | 8        | 8 → 8 (=)  |
| 2 | Marcus | Eng, devtools-open               | Yes     | Yes   | 9        | 8 → 9 (+1) |
| 3 | Wen    | Analytics / data                 | Yes     | Yes   | 9        | 8 → 9 (+1) |
| 4 | Tomás  | Marketing ops                    | Yes     | Yes   | 9        | 8 → 9 (+1) |
| 5 | Dana   | Marketer, 30–50 links/wk         | Yes     | Yes   | 8        | 9 → 8 (−1) |
| 6 | Jules  | Content & community mktr (mobile)| Yes     | Yes   | 9        | 8 → 9 (+1) |
| 7 | Aisha  | Product designer                 | Yes     | No    | 7        | 6 → 7 (+1) |
| 8 | Rob    | Freelance brand designer         | Yes     | Yes   | 9        | 7 → 9 (+2) |
| 9 | Elena  | Mktg manager, 8 reports          | Yes     | No    | 6        | 5 → 6 (+1) |
|10 | Sam    | PM (mobile)                      | Yes     | Yes   | 10       | 9 → 10 (+1)|

Clarity: 10/10 Yes. Value: 8/10 Yes (Aisha + Elena = No). **Advocacy ≥9: 6/10.**

## Pass set (advocacy ≥9) — 6/10

Marcus 9 · Wen 9 · Tomás 9 · Jules 9 · Rob 9 · Sam 10.

All six confirm the round-1 fixes landed: lowercase-all auto-fix, friendly workspace names,
inline rename (persists across reload), search-by-name, X/Twitter + Mastodon presets, 44px
mobile targets, panel-above-grid, share-action sublines. Zero console errors, no React #185,
no enforceSpec crash reported.

## Complaints behind advocacy<9 or value=No — grouped by cause (with recurrence)

### Cause 1 — Landing density / editable grid buried (the dominant gate) — 5 testers
Dana(8, regressed), Elena(6, value No), Aisha(7, value No); also flagged by Sam & Wen.
- Moving My Workspaces ABOVE the grid pushed the editable grid DOWN: utm_source header now at
  **816px vs round-1's 668px** (Dana, measured).
- On a cold open My Workspaces is an empty "No workspaces yet" card — reads as "one more
  banner" between hero and grid for a first-timer (Dana, Aisha).
- The grid sits behind a stack of full-width banners — Pre-launch QA / Launch Check, Live Team
  Workspace, Presets, Bulk Edit (+ UTM Spec, Naming Template) — so a 30-sec skimmer hits a
  control wall and can't find the ONE primary action. "Above the grid" is technically true but
  it's the 6th block down (Elena, Aisha, Dana). This is the previously-DEFERRED landing pass;
  it now gates the 9-bar for all three non-passers.

### Cause 2 — Dual-render DOM smell — 3 testers
Priya(8), Marcus(9, off-10), Wen(9, off-10).
- My Workspaces panel + grid each render TWICE (desktopOnly + mobileOnly twins): 2
  "My Workspaces" headings, 2 search inputs (one at 36px < 44px), duplicate hidden grid inputs
  (idx 13-18 mirror 5-10), sharing one aria-label. Harmless on screen, trust-nicking to an
  engineer with devtools open; the desktop search input is also under the 44px target.

### Cause 3 — Auto-fix leaves trailing punctuation — 1 tester (credibility bug)
Priya(8). "Launch Day!" → "launch_day!" — the "!" survives. Casing is genuinely fixed, but a
"clean" utm_campaign shouldn't carry a "!".

### Cause 4 — Friendly default name not distinguishable — 4 testers (all passing, flagged)
Marcus(9), Wen(9), Jules(9), Tomás(9).
- Default label uses date/domain, so two same-day or same-domain workspaces both default to
  identical names ("Workspace — Jun 14" / "example.com") until manually renamed. Marcus made
  workspaces with campaigns "blackfriday2026" and "summer_promo" and BOTH defaulted to the
  date. Rename is load-bearing rather than just nice-to-have. Ask: derive default from the
  first row's utm_campaign first.

### Cause 5 — Two share concepts read confusingly similar — ~5 testers across rounds
Marcus, Jules, Tomás, Elena, Sam (recurring nit; all note it's clearer with the sublines).
- "Copy share link" (frozen snapshot) vs "Create shared workspace" (live synced) still cost
  "one beat" — a first-timer must read the fine print to pick. Labeling-only ask.

### Cause 6 — Rename affordance too quiet — 1 tester (craft)
Aisha(7). Low-contrast gray "Rename" chip + a redundant ✏ pencil that looks like a separate
control; she clicked twice before trusting it. Ask: click-the-name to rename, and/or raise
contrast and drop the duplicate pencil.

### Cause 7 — Persona-rooted value=No (accepted holdout) — 1 tester
Aisha(value No). Makes "a handful of UTMs a year"; Notion covers her — she rates her own
recurring use and it doesn't earn a slot. Out of the recurrence ICP; this is the accepted 1
fail. Her advocacy=7 still rose on the naming fix; her craft notes feed Fix A/B/F.

### Non-blocking nits (noted, not gating)
- Live workspace link is still edit-capability; Tomás wants a read-only share before pasting in
  Teams (flagged it stays out of scope, off a 10).
- Overlapping "save/reuse" surfaces (Save as campaign / Campaigns / Allowed values / Naming
  Template / Launch Check) confuse which remembers a client vs a one-off (Rob).
- "THIS device only — not synced" loses the list on a laptop switch (Rob; structural, needs
  accounts; out of scope).
- Easy to spawn near-duplicate workspaces with no dedupe cue (Aisha).

## Read-through to Round 3 plan
6/10 today. The three reachable flips are **Dana (regressed, Cause 1), Priya (Causes 2+3),
Elena (Cause 1+5)**. Aisha's value=No is persona-rooted (Cause 7) and is the accepted single
fail. Round-3 fixes A–F (encoded in UX_BRIEF.md) address every gating cause: A+B de-densify
the landing / un-bury the grid (Cause 1 → flips Dana/Elena, helps Aisha); C kills the
dual-render + trailing punctuation (Causes 2+3 → flips Priya); D distinguishable default name
(Cause 4); E share disambiguation (Cause 5); F discoverable rename (Cause 6 → nudges Aisha).
