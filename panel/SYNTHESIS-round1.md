# UTM Grid — Panel Round 1 Synthesis (mobile card layout build)

Feature under test: the new **mobile card layout** (≤640px rows render as vertical cards;
≥640px desktop table unchanged), exercised cold-open over HTTP/browser by 10 personas.

## 1. Score table

| # | Tester | Persona | Clarity | Value | Adv | Top friction |
|---|--------|---------|---------|-------|-----|--------------|
| 1 | Priya | Backend SWE, keyboard-first | Yes | Yes | 8 | Too much chrome for the one-link case; auto-fix is a manual click, not lint-on-type |
| 2 | Marcus | Frontend eng, desktop | Yes | Yes | 8 | Presets fill source/medium but leave required utm_campaign blank → every preset row opens in an error state; desktop header truncation ("UTM_MED") |
| 3 | Wen | Marketing data analyst | Yes | Yes | 8 | Flagship "define allowed values" UTM Spec is collapsed, empty by default, paste-your-taxonomy entry buried — most valuable feature is least discoverable |
| 4 | Tomás | Ops analyst, Edge/Win | Yes | Yes | 8 | Bulk "Set column"/"Find & replace" controls styled like inputs (gray outline) — don't read as clickable buttons |
| 5 | Dana | Demand-gen marketer, 375px | **No** | Yes | 8 | Value lives in the subhead, not the 5-line headline wall; "Set column" hidden behind a small "Expand"; "Apply to: 3 selected rows" button clips off right edge at 375px |
| 6 | Jules | Content/community marketer, mobile | **Partially** | Yes | 7 | "Copy share link" STILL no "Copied" on mobile (row "Copy URL" DOES flip) — the main spread action; "team taxonomy" headline almost bounced a solo marketer |
| 7 | Aisha | Product designer, craft-hard | Yes | Yes | 8 | Off-spec violet vs amber case/space lint not glance-distinct on a long grid; clipped desktop headers; thin card icons + bare "–" empty URL state |
| 8 | Rob | Freelance brand designer, desktop | **Partially** | Yes | **6** | Headline + crowded first screen pitch at a marketing-ops team lead, not a freelancer — nearly bounced; win over Sheet feels incremental for low volume |
| 9 | Elena | EM, 8 reports, 375px | **No** | Yes | 7 | Shared-link recipient lands in the full editor with NO banner saying it enforces the team spec; shared row arrives un-fixed; hero is a 5-line wall on a phone |
| 10 | Sam | PM, mobile-heavy | **Partially** | Yes | 7 | Shared link lands on the generic headline + full toolbar — recipient must scroll to find the rows; no "here's the grid Sam shared, 3 links" summary; dense 6-line headline; preset row required-error beside "nothing to fix" |

**Bar check: 0/10 hit the 9-advocacy bar.** All scores 6–8 (one 6, three 7s, six 8s).
**Value = Yes on 10/10.** Clarity: 6 Yes, 3 Partially, 2 No — and 4 of those 5 non-"Yes"
verdicts trace to the SAME hero block.

**The mobile card feature itself tested WELL** — praised unprompted by multiple testers:
Priya ("stacked labeled cards, lint intact, full-width Copy — a teammate on a phone gets a
usable view"), Marcus ("deliberate, not a squished table… no horizontal scroll"), Dana
("the genuine surprise: real stacked cards, 44px touch targets, every field thumb-reachable,
zero horizontal scroll"), Aisha ("the standout: genuinely phone-designed, not a squashed
table"), Elena ("clean stacked cards with inline warnings + a working Fix"). **The blockers
are pre-existing craft/copy exposed by the cold open, not the new card layout.**

## 2. Grouped complaints, by cause (RECUR = ≥2 personas across roles, real; QUIRK = single)

### C1 — Hero too long / jargon-y / mis-pitched — RECUR (6, the clarity blocker, top lever)
Cited by Dana, Jules, Elena, Sam, Rob (+ Priya/Marcus flag "taxonomy" as dev jargon). One
root with three facets: **(a) length** — a "5–6 line wall" at 375px that pushes the grid below
the fold (Dana, Elena, Sam); **(b) jargon** — "UTM taxonomy"/"lint rules" are dev words a
marketer's team wouldn't know (Dana, Sam, Priya); **(c) mis-pitch** — "your TEAM's taxonomy"
reads as enterprise governance, so a solo marketer (Jules) and a freelancer (Rob) nearly
bounced as "not for me". In every case **the grey subhead, not the headline, did the selling.**
4 of the 5 sub-"Yes" clarity verdicts live here — the single biggest lever to the 9-bar.

### C2 — Shared-link landing isn't a clean handoff — RECUR (3, the viral-loop surface)
All on the growth surface. Sam: "recipient lands on the generic headline + full toolbar, must
scroll to find my rows — no 'shared grid' summary at top, the exact moment that'd make me
recommend it; fix the share-landing and I'm at 9." Elena: "lands in the full editor, NO banner
explaining it enforces my team's spec; shared row arrives un-fixed with %20." Dana
(positive control): her share DID surface "Loaded shared grid (3 links)" — so the banner
exists but is inconsistent/insufficient and doesn't supplant the marketing hero. The recipient
should see the SENT grid front-and-center with a pinned summary, not the homepage. Sam and
Elena both gate their 9 here.

### C3 — Power features don't read as usable / are buried — RECUR (across 2 surfaces)
(a) Bulk "Set column" / "Find & replace in column" styled like inputs, not buttons — Tomás
("had to hunt for them"); the bulk toolbar hidden behind a small "Expand" mobile users miss —
Dana ("the exact feature that saves me the most time"). (b) UTM Spec panel collapsed + empty +
paste-entry buried — Wen ("the most valuable feature is the least discoverable"). Two distinct
surfaces, same shape: "the killer feature is hidden / doesn't look clickable."

### C4 — Copy confirmation inconsistent on mobile — RECUR (known friction lesson)
Jules: "Copy share link"/"Copy all URLs" give NO confirmation on mobile while row "Copy URL"
flips to "Copied!" — the inconsistency is glaring and it's the main spread action. This is the
recurring **copy-confirmation-survives-tick-rerender** lesson; recurs across runs even at 1
tester here. Cheap, bundle with the mobile pass.

### Single-persona quirks (note, lower priority)
- **Preset row opens in a contradictory error state** — Marcus + Sam (2, borderline-recur):
  a fresh preset leaves required utm_campaign blank → red "required" beside Auto-fix's
  "Nothing to fix — all cells are clean." Reads broken/contradictory. P2 (guide, don't error).
- **Desktop mid-width header truncation ("UTM_MED")** — Marcus, Aisha (desktop only,
  outside this round's mobile focus).
- **Off-spec violet vs amber not glance-distinct** — Aisha only; already addressed by prior
  UTM Spec Round 2 Fix A — confirm it shipped.
- **Auto-fix should be lint-on-type** — Priya only (product-direction note, not a blocker).
- **Thin card icons + bare "–" empty Generated-URL state** — Aisha only (craft polish).
- **localStorage-only, no real team sync** — Wen, Elena: accepted structural out-of-scope
  (needs accounts/server, blocked on credential). Elena is the accepted out-of-ICP holdout.

## 3. Read for the design response
The product is validated: value=Yes 10/10, the new card view drew unprompted praise, the
share-link round-trip is repeatedly called "the killer feature." Nothing structural is wrong.
The 9-bar is gated by **craft on the cold open**: a hero that's too long/jargon/mis-pitched
(C1, 6 testers — top lever) and a shared-link landing that dumps the recipient on the
marketing homepage (C2, the growth surface). Fix those two plus the C3/C4 affordance polish
and the 8s become 9s. P0 = C1 + C2; P1 = C3 + C4; P2 = preset-row error.
