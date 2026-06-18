# Sam — Product manager

(Re-test. My three capping gripes this time were: auto-fix had no before/after diff,
cross-row lint was invisible until a 2nd conflicting row, bottom panels read as overlapping
jargon. All three resolved — see below.)

**Prior gripes — all resolved:**
1. Auto-fix had no diff → FIXED. Clicking Auto-fix opens a panel: "Auto-fixed 1 cell" with
   **Undo**, and per-field detail `Row 1 · utm_source: ~~"Newsletter "~~ → "newsle…"`
   (strikethrough old → new), and the fixed cell turns green in the grid. I can see what it
   touched before trusting it across 30 links. No debugging needed.
2. Lint invisible until a 2nd conflicting row → FIXED. With ONE messy row the rollup already
   read **"1 issue found — jump to first ↓"**; clean shows **"All clean ✓"**. Always on, one row.
3. Bottom panels overlapping jargon → FIXED. Collapsed by default with plain subtitles:
   "Campaign Naming Template — the STRUCTURE of utm_campaign", "Campaigns — your saved grids",
   "UTM Spec / Allowed Values — allowed values per UTM field". I can tell them apart now.

**Buried-feature check (found cold, untold):** Auto-fix diff — FOUND. Lint rollup — FOUND
(top of grid). Cold "what we catch" demo — FOUND ("We catch near-duplicates like spring_sale
vs Spring-Sale"); verified it disappears the instant I add a real row.

**1. Clarity (Y):** "Clean campaign links in a grid… auto-fix the casing and spacing that
splits a campaign into two in your analytics… export a clean CSV. No login." My exact job, <30s.

**2. Value (Y):** Today I keep UTMs in a Google Sheet with a CONCAT formula and eyeball
casing — it never catches Spring-Sale vs spring_sale until Amplitude splits the campaign.
This flags it live, auto-fixes with an undoable diff, and exports a clean CSV with a
generated_url column ready to paste into Slack/Notion. Saves real per-launch cleanup.

**3. Advocacy: 9.** Everything that capped me at 8 is gone, and I found each fix cold. I'd
bring this up unprompted to PMs running a launch. Not a 10 only because on mobile the diff
truncates the after-value ("newsle…") and the generated URL cell truncates too — fine for me
on a laptop, but I'd want full before→after readable on phone before evangelizing hard.

```json
{"tester": 10, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["mobile auto-fix diff truncates the after-value ('newsle…') so full before→after isn't readable on phone", "generated_url cell also truncates on mobile"], "priorConcernsAddressed": "all"}
```
