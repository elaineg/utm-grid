# Round 8 — Tester 3

**Persona:** Wen — Marketing data analyst (BigQuery/SQL, Sheets, Looker, dbt, GA4). Lives in data hygiene, distrusts invisible transforms, wants strict CSV in/out + casing lint.

## 1. Would you use this? — YES
This is aimed straight at my recurring pain. I made the exact mess I fight weekly — `Newsletter ` vs `newsletter`, `EMAIL` vs `email`, `Spring_Sale 2026` vs `spring_sale_2026` — and the cross-row lint flagged each one in MY language: *"Inconsistent utm_source across rows: 'Newsletter' vs 'newsletter' — these will split campaign data in GA4."* It also flags per-cell uppercase (`Q3-Launch → q3-launch`) and trailing spaces. Crucially for my trust issues: Auto-fix is NOT silent — it toasts *"Auto-fixed 3 cells — Undo"*, highlights the changed cells green, and is reversible. Import opens a real **Map CSV columns** dialog (auto-mapped, adjustable, Append/Replace, "you can Undo immediately"). Export is clean snake_case `utm_*` headers + generated_url, BOM-prefixed so Sheets/Excel don't mangle it. CSV in AND out, lint that catches the splitters — yes, I'd put this in my weekly workflow.

## 2. Purpose & how-to clear? — YES (clarity: Y)
Headline "Clean campaign links in a grid" + the subhead "auto-fix the casing and spacing that splits a campaign into two in your analytics, then export a clean CSV" told me exactly what it does and that it's for me, within 5 seconds. "No login — nothing leaves your browser" sealed it. The grid + Import/Export/Auto-fix toolbar is self-explanatory.

## 3. Advocacy — 8/10
I'd bring this up unprompted to other GA4/dbt analysts in my team Slack — the GA4-split framing and the trust-respecting Auto-fix/Undo are rare. Held back from 9–10 by: (a) the **cross-row consistency lint is the headline value but is buried until you type a second conflicting row** — nothing on cold load tells me that exists, so a peer skimming might miss the best feature; (b) I'd want to know how it scales to my real 30–80 row pastes and whether "Allowed values" can enforce a controlled vocab I paste in — couldn't tell that depth cold. Both are polish, not dealbreakers.

## QR discoverability (honest, no hunting)
On FIRST cold load I would NOT have discovered branded bulk QR. What I actually saw cold: a teal-outlined **"QR codes"** button in the toolbar and a per-row **"QR"** icon. As a data analyst, QR isn't my mission, so I'd have registered "some QR thing" and never clicked. Only when I deliberately opened it (because you asked) did I find the real depth: **Download QR codes (ZIP)**, size 512/1024/2048, PNG/SVG, FG/BG color pickers with a live **contrast-ratio "17.7:1 ✓ scannable"** readout, and center-logo upload ("composited locally — never uploaded"). All genuinely there and well-built — but **buried**: the label "QR codes" gives zero hint of "branded bulk ZIP + logo + color." A cold user would not learn that capability exists on their own.

```json
{"tester": 3, "round": 8, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Best feature (cross-row GA4-split lint) is invisible on cold load until you type a 2nd conflicting row", "Branded bulk QR (ZIP/color/logo) is buried behind a generic 'QR codes' label — not discoverable cold"], "priorConcernsAddressed": "n/a"}
```
