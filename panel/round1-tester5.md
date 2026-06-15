{"name":"Dana","clarity":"Yes","value":"Yes","advocacy":"8","prior_concerns_addressed":"n/a for round 1"}

# Dana — Demand-gen marketer (round: "Move to another device" feature)

## What I did
Cold-opened on my cafe MacBook (1280px). Built a real batch: added rows, typed messy values
(`LinkedIn` / `Social Post` / `Spring Sale 2026`), hit Auto-fix → got
`linkedin` / `social_post` / `spring_sale_2026`. Exported CSV (clean, Excel-safe). Saved a
campaign "Spring Sale Batch". Opened Tools ▾ → "Move to another device" and did a FULL
export→import round-trip on a fresh browser context. Repeated the whole thing at 375px phone.

## NEW feature: Move to another device — verdict
Yes, this matters to me: I save campaigns at the cafe and tweak links from my phone between
meetings, so my presets being stranded on one device is a real annoyance. Tested it and it's good:
- **Does NOT push the grid below the fold.** It's an item inside the Tools ▾ dropdown, so the
  grid stays right at the top. The panel only expands when I open it. My one-scroll bounce test
  passes on desktop.
- **Round-trip works.** Export gave a 1190-char code (Copy code / Download .json). On a fresh
  "device" the import Preview showed "1 added · 0 updated · 0 skipped — Campaigns: 1 added
  'Spring Sale Batch'" with a Confirm import button. The copy "we merge into what's already
  here — we never overwrite your saved campaigns" is the exact trust I need to actually move
  stuff between my two devices.
- **Phone (375px) is real.** Grid becomes stacked cards with a big "Copy URL" button — first
  BASE URL input is visible in the first viewport, toolbar at top. The Move panel stacks
  export/import cleanly and is fully readable. (Prior-round mobile "grid buried" gripe looks
  addressed — it's grid-first enough on phone now.)
- Honest "Coming soon: accounts sync automatically — this manual move is free and always will
  be." Sets expectations without overpromising.

## What worked (core flow = my Thursday grind, gone)
Auto-fix is the whole pitch — casing/spacing cleanup is exactly the 15-min grind I do by hand
in a sheet, and it nukes the whole row in one click. CSV export is BOM-prefixed with a
`generated_url` column that drops straight into my sheet. No console errors anywhere.

## What annoyed / confused me
- **The headline sells the wrong job.** "Clean campaign links… auto-fix casing… export a clean
  CSV" frames this as a CSV-cleanup utility. My actual job is "tag 30 links across channels
  before Thursday." Skimming one scroll, I almost read it as a fix-up tool, not a bulk builder.
- "Move to another device" sits at the BOTTOM of a 9-item Tools menu under "Download QR codes"
  and "Run Launch Check." Discoverable but not obvious — a returning user wanting to sync
  presets might not think to look there.

## Single thing most holding back my score
The headline undersells the real value (fast BULK link-building for a weekly launcher) and
reads as "CSV cleanup." A ruthless-on-time marketer skimming one scroll might not realize this
kills the 30-link Thursday grind. Fix the framing and this is a 9 I'd screenshot for the team.

```json
{"tester":5,"round":1,"clarity":"Yes","value":"Yes","advocacy":8,"topComplaints":["Headline frames it as 'CSV cleanup' not 'build 30 tagged links fast' — undersells the actual bulk-builder value to a one-scroll skimmer","'Move to another device' is buried at the bottom of a 9-item Tools menu; discoverable but not obvious for a returning user wanting to sync presets"],"priorConcernsAddressed":"n/a"}
```
