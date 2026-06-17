# Round 8 — Tester 7

**Persona:** Aisha — Product designer, judges craft hard (spacing, copy tone, empty states, lint affordances). Doesn't build UTMs often; came in via a teammate's share to judge whether the grid *feels* considered.

## 1. Would you use this? — Mostly yes (for the rare batch)
I don't tag campaigns weekly, so this won't live in my dock. But the next time I DO have a batch — or when a PM hands me a messy sheet of links — I'd reach for this over the single-link Google builder. What earns the "yes" is the craft, not the frequency: inline per-field lint ("Contains uppercase letters — use lowercase only ('email')", "2 warnings"), an Auto-fix that *only* fixes what it can (it left my invalid base-URL warning standing instead of faking a fix) with a clean "Auto-fixed 2 cells — Undo" toast AND a toolbar Undo. That restraint is rare and it reads as considered.

## 2. Is the purpose/how-to clear? — Yes
The H1 "Clean campaign links in a grid" + sub "Build and tag a whole batch of 30+ campaign links at once — and auto-fix the casing and spacing that splits a campaign into two in your analytics" told me the what AND the why (split-campaign pain) in one read. "No login — nothing leaves your browser" set trust instantly. Toolbar verbs (Add row / Auto-fix / Import CSV / Export CSV / Rules) are legible. The Presets row ("fill source/medium in one click") removed any blank-grid intimidation.

**Craft nits (what keeps it off a 9):** Empty states are competent but a touch flat — "No saved campaigns yet — build a grid, then 'Save as campaign' to reuse it next week" is fine copy, but the three bottom panels (Naming Template / Campaigns / Allowed Values) crowd in at once and compete for a first-timer's attention; I'd hide two behind a "set up rules" affordance until the grid has a few rows. The starter row pre-filled with a truncated `https://acme.co` / `newslette...` placeholder made me unsure if it was real data or a sample for a second.

## 3. Advocacy — 8/10
I'd bring this up unprompted in a design/marketing Slack the next time someone complains about polluted UTM data — the lint affordances and the honest auto-fix are genuinely tasteful. It's not a 9 because (a) it's not a tool *I* personally reach for often, and (b) the bottom-panel density and the ambiguous starter-row placeholder are small craft seams a more polished pass would smooth. But the considered details (contrast check on QR, undo, lowercase-only restraint) are exactly what makes me advocate loudly — so it clears the bar comfortably.

## QR discoverability (honest, cold)
**Discoverable — yes.** On first cold load, before any row selection or menu digging, I noticed the **"⊞ QR codes"** button sitting right in the primary toolbar between Auto-fix and Import CSV, styled in a teal outline that drew my eye. I clicked it on my own. The panel that opened is genuinely well-crafted: "Bulk download + branding controls", a "Download QR codes (ZIP)" button, "Generating for all 1 row", size (512/1024/2048), PNG/SVG, foreground/background color pickers with a LIVE **contrast readout ("17.7:1 ✓ scannable")**, and an optional center-logo upload with a note about bumping error-correction. So yes — the branded bulk-ZIP-with-logo capability was discoverable, not buried, and the panel itself is the most considered surface in the app.

**Clarity: Y**

```json
{"tester": 7, "round": 8, "clarity": "Yes", "value": "Marginal", "advocacy": 8, "topComplaints": ["bottom three setup panels (Naming Template/Campaigns/Allowed Values) crowd a first-timer and should reveal progressively", "pre-filled starter row reads ambiguously between sample data and real input"], "priorConcernsAddressed": "n/a"}
```
