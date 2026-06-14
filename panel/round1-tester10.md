# Sam (PM, tester 10) — re-test (Launch Check focus, mobile 375px)

{"name":"Sam","clarity":"Yes","value":"Yes","advocacy":8}

## Prior-concern re-check
Last round my two complaints were: (1) copy/share buttons give NO visible "Copied" confirmation,
and (2) the shared guide is unbranded.
- (1) NOT fixed. I clicked **Copy summary** on the Launch Check report; clipboard DID receive the
  text, but the button stayed "Copy summary" — no "Copied ✓", no toast. Same uneasy feeling as
  before. **Not addressed.**
- (2) Branding: didn't re-exercise the guide this round; leaving as-is. So overall: **some**.

## What I did this round
Cold home (375px) → built a 3-link launch batch (one deliberately messy: "Facebook", blank medium,
"Summer Sale 2026") → found **Run Launch Check** under a "PRE-LAUNCH QA" section → ran it →
tested **Copy summary** and **Download report (CSV)**. 0 console errors.

## 1. CLARITY — Yes
H1 "Clean UTM links for your whole campaign — in one grid" + "before they split your Google
Analytics" = instant. I'd tell a teammate: "builds a whole batch of consistent UTMs, flags the
broken ones, gives you a CSV/summary to hand off — no login."

## 2. VALUE — Yes
Today: a Google Sheet with a formula column nobody checks, so typos split Amplitude. The **Launch
Check** is exactly what I wanted. Messy batch returned "3 links checked / 2 passing / 1 with issues",
grouped by rule (Uppercase letters / Contains spaces / Missing required), per-row, WITH suggested
fixes ("summer_sale_2026"). Artifacts are real:
- Copy summary → clean plaintext, Slack-ready ("Total: 2 links checked | Passing: 1 | With issues: 1"
  + one line per issue).
- Download report → `utm-launch-check.csv`, headers `row #,base URL,field,value,issue type,message`.
  I'd attach this to a launch ticket as-is.
Launch Check vs Audit vs Share is now clearly disambiguated ("Audit URLs — paste finished links from
elsewhere | Launch Check — check every link in this batch before you launch"). That resolves the
exact confusion I'd have had. My sheet can't produce any of this.

## 3. ADVOCACY — 8/10
The Launch Check + handoff artifacts are genuinely the feature that makes me look organized — a real
9-worthy capability. Two things hold it at 8:
1. **Still no "Copied" confirmation on Copy summary** (my repeat complaint). A PM who won't debug
   clicks it 3x unsure it worked. Download at least fires an OS download so I trust it.
2. **Discoverability on mobile:** "Run Launch Check" / "PRE-LAUNCH QA" sit far below the fold, under
   Workspace, Presets, Naming Template, Campaigns, Allowed values, and Bulk Edit. The single most
   valuable action is buried; I scrolled a long way to find it.

### To reach 9–10
1. Add a visible "Copied ✓" state/toast to Copy summary (and all Copy buttons) — this is now my
   two-round-running ask.
2. Promote "Run Launch Check" into the top action cluster (next to Export CSV) on mobile.

```json
{"name":"Sam","round":1,"clarity":"Yes","value":"Yes","advocacy":8,"topComplaints":["Copy summary still gives no 'Copied' confirmation (repeat complaint) — looks like nothing happened","Run Launch Check (the best feature) is buried far below the fold on mobile"],"priorConcernsAddressed":"some","mobile375":"0 console errors; Launch Check report renders clean; CSV + summary artifacts both work"}
```
