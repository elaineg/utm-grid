# Elena — Engineering manager (8 reports), 30-sec patience, half the day in meetings

I skimmed this because a report asked if our team should standardize on it. My bar: instantly
obvious, zero setup, and it saves my reports time — or I don't recommend it.

Cold open (30s): I got it immediately. Headline "Clean UTM links for your whole campaign — in
one grid" + "Auto-fix messy casing and typos... Share one link anyone can open and reuse — no
login." That's the whole pitch: a spreadsheet for tracking links that catches the typos that
split GA reports.

New feature — Campaign Naming Template: Discoverable. Right-rail panel "Campaign Naming
Template" with copy "The STRUCTURE of utm_campaign — its parts and their order... DIFFERENT
from Allowed Values, which sets allowed values." That one sentence answered "how is this not
the other panel?" before I asked. I added segments quarter/channel/audience; the per-row teal
"Build name" pill opened a composer that live-previewed "q3_newsletter_enterprise" and Apply
dropped it straight into the cell. Toggled "Enforce naming template" (teal, visually separate
from the purple "Enforce allowed values") against an off-template value → teal "1 cell
off-template" badge in the header. Worked first try, no docs, no console errors.

Regression: Auto-fix normalized "News Letter"→news_letter, Copy share link gave a real encoded
URL, mobile loads clean. Nothing broke.

Value vs today: my reports hand-build UTMs in a Google Sheet with CONCATENATE and still fight
casing drift. This replaces the formula AND enforces a shared naming convention via one link —
the part a sheet can't do. Real time saved for my reports.

Holding back a 9: the naming-template power lives in a right-rail panel a hurried person can
scroll past, and on my phone the grid (where Build name lives) is below a long fold — fine on
laptop, fiddly between meetings.

```json
{ "name": "Elena", "clarity": "Yes", "value": "Yes", "advocacy": 8,
  "likes": ["Headline made the job obvious in <10s", "Naming Template panel explicitly says it's DIFFERENT from Allowed Values — killed my confusion", "Build name composer live-previews and Apply lands the value in one click", "teal off-template badge distinct from purple allowed-values warning", "no setup/login, no console errors, no regression in auto-fix or share link"],
  "frictions": [
    {"severity":"P2","issue":"Naming Template + Allowed Values are right-rail panels a 30-sec skimmer may scroll past; the power features aren't above the fold"},
    {"severity":"P3","issue":"On 375px mobile the grid and the Build name pill sit below a long intro fold; usable but not thumb-friendly between meetings"}
  ],
  "verdict_sentence": "Instantly legible, setup-free, and the naming template enforces a team convention my reports can't get from a Google Sheet — I'd recommend it, just shy of unprompted-rave territory." }
```
