# Round (new feature: Paste & Audit URLs) — Tester 8 (Rob, freelance brand/visual designer, desktop)

I tag client campaign links a few times a month; otherwise I hand-type query strings or QA links
someone else dropped into a sheet. "Paste links I already have, tell me what's wrong" is exactly
the chore I'd hand off, so I went straight at the new feature.

PRIOR-FEATURE NOTE: still no way to NAME a workspace (my standing complaint) — unchanged. Not the
focus this round.

## 1. Discoverability — Yes
Spotted it cold in ~5s: violet "Paste & Audit URLs" chip next to Import CSV, subline "Already have
tagged links? Paste them to find every inconsistency at once." That line cleanly separates it from
the build-new flow. No hunting.

## 2. Used it
Pasted 5 lines: two URLs identical except casing (Newsletter/Email/Spring_Sale vs all-lowercase),
one half-tagged (no campaign), one garbage "this is not a url at all", one twitter row.
- Button live-counted "Audit 5 URLs" as I typed. Dialog explains parse + flag plainly. Append/Replace
  toggle with "you can Undo immediately after auditing." Reassuring.
- Result: "Audited 4 URLs — 12 cells flagged · 1 line skipped. Undo." Garbage line correctly SKIPPED;
  4 real ones parsed into rows with base URL split out from utm_* params. Casing dupes both preserved
  as separate correct values (NOT silently merged). Flagged cells get an amber highlight + triangle.
- Best bit: hovered a flag, got one-click "Lowercase + normalize all flagged cells." Clicked it — all
  4 Newsletter/newsletter cells went lowercase, 0 uppercase remained. That's the exact QA fix I want,
  and Undo sits right there. This beats me eyeballing a column of links in a Sheet. Saves real time.

## Friction / bugs
- LAYOUT: after auditing, the editable UTM_SOURCE/MEDIUM/CAMPAIGN cells get shoved into a horizontally
  -scrollable strip and collapse to a sliver labeled "U" between BASE URL and the wide GENERATED URL
  column — the Campaigns sidebar eats the width even at 1500–1800px. The inputs aren't deleted (DOM
  shows full 104px cells, they scroll into view), but on first glance it reads like my parsed values
  vanished. Repro: paste 2 URLs → Audit → look at grid at ≤1500px; UTM columns are off-screen-right
  behind the generated URL. For someone who pasted links specifically to SEE/FIX per-param values,
  that's a rough first impression. Fix: auto-scroll/reveal those columns post-audit, or shrink the
  generated-URL column.
- The amber flag says WHAT (cell is off) but never plainly says WHY ("these rows differ only by
  casing"). I had to infer it. A plain-language note would land better with non-technical designers.

## 3. Regression check — none
Built a fresh row from scratch: generated URL correct
(`...?utm_source=google&utm_medium=cpc&utm_campaign=summer`), zero console errors anywhere across
all tests. Row "Copy" copies share-link state not the single URL — existing behavior, not new
breakage, but it briefly tripped me. (Clipboard read worked in my env.)

CLARITY: Yes
VALUE: Yes
ADVOCACY: 7/10
REASON: The audit job genuinely works and the one-click normalize is the thing I'd reach for every
few weeks. Held below an 8 because the grid layout swallows the parsed UTM columns right when I most
need to read/fix them, and the flags explain what's wrong but not why.

```json
{"tester":8,"round":1,"clarity":"Yes","value":"Yes","advocacy":7,"topComplaints":["Post-audit, the editable UTM_SOURCE/MEDIUM/CAMPAIGN columns collapse off-screen-right behind the wide GENERATED URL column (Campaigns sidebar eats width even at 1800px) — looks like parsed values vanished","Flag highlights show WHAT is off but never plainly state WHY (e.g. 'these rows differ only by casing')"],"priorConcernsAddressed":"n/a"}
```
