# Round 8 — Tester 8: Rob (freelance brand/visual designer, medium-tech, desktop)

**My motivation:** I occasionally tag client campaign links and I compare everything to
"I could just type the query string / do it in Photoshop in 4 minutes." I want to know if
the grid + CSV export beats doing it by hand.

## 1. Would you use this? — YES (qualified)
For batches, yes. Typing `?utm_source=...&utm_medium=...&utm_campaign=...` by hand for a
client launch with 10–30 links is genuinely annoying and typo-prone, and the grid + Export
CSV nails that — `Export CSV` gave me `utm-grid.csv` instantly, no login, all local. The
killer for ME (a designer, not an analyst) is the QR ZIP: I clicked **QR codes** → got a
real `utm-qr-codes.zip` with a sensibly-named file `01-spring-sale-2026-newsletter-email.png`
+ a contact-sheet. That's the part I'd actually do in Photoshop, and it'd take me far longer
than 4 minutes to color a QR, drop in a logo, and keep it scannable. The live
**Contrast: 17.7:1 ✓ scannable** check and "logo composited locally" note is exactly the
reassurance I need before sending a client a code that might not scan.
For a ONE-OFF single link, no — I'd still just type it; opening the app isn't worth it.

## 2. Is the purpose and how-to clear? — YES
The H1 "Clean campaign links in a grid" + subhead about batching 30+ links and auto-fixing
casing/spacing "that splits a campaign into two in your analytics" told me what and who in
~10 seconds. "No login — nothing leaves your browser" is right where I look for the catch.
A pre-filled sample row meant I never faced a blank canvas. Minor nit: there's a lot of
chrome (Presets, Campaign Naming Template, Allowed values, Tools/Share/Rules menus) — as a
designer I don't know what "Allowed values" vs "Naming Template" do without clicking, but
the core flow (fill row → Export / QR) was obvious without reading any of it.

## 3. Advocacy: **8/10**
I'd bring the QR-ZIP-with-branding thing up unprompted to other freelancers and social
designers — "free, no login, colored+logo QR codes that are checked-scannable, as a ZIP"
is a real share line. Held back from 9 because: (a) for a single link it's overkill vs.
typing, so it's a batch/QR tool not an everyday one for me; (b) the menu/panel density
(Rules, Allowed values, Naming Template, Presets, Campaigns, Team Workspaces) makes it feel
more like an analyst's power tool than a designer's quick utility — I'd undersell those to
a peer and just pitch grid + QR. Not a 7-to-be-nice: the QR feature genuinely earns the 8.

**Clarity: Y**

## QR discoverability (honest, no hunting)
On the FIRST cold load, with no row selected and no menu digging, **YES — I noticed it.**
There's a teal-outlined **"⊞ QR codes"** button sitting right in the top toolbar next to
Auto-fix / Import CSV / Export CSV, above the fold. The teal outline makes it stand out
from the plain buttons, so it reads as "something special here." I would have clicked it on
my own. What I could NOT have known from the toolbar alone was the depth behind it (color
fg/bg, SVG/PNG, sizes, center-logo upload, contrast check) — that's only revealed after
the click. So: the QR *entry point* is discoverable; the *branding power* is one click
buried but a reasonable one. Verified the ZIP actually downloads (2 PNGs, campaign-named).
(Copy button: clicked, no JS error — copy verified visually; clipboard read blocked in test env.)

```json
{"tester": 8, "round": 8, "clarity": "Yes", "value": "Yes",
 "advocacy": 8, "topComplaints": ["For a single link, typing the query string by hand is still faster than opening the app — it's a batch/QR tool, not an everyday one", "Panel/menu density (Rules, Allowed values, Naming Template, Team Workspaces) reads as analyst power-tool, not a designer quick utility; obscures the QR/CSV core"], "priorConcernsAddressed": "n/a"}
```
