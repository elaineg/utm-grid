# Tomás — Operations analyst

Cold open on corporate-laptop viewport. In-audience: I build tagged ops-campaign links in Excel today.

## 1. Clarity — YES
Headline "Clean campaign links in a grid" + sub "Build and tag a whole batch of 30+ campaign links at once — and auto-fix the casing and spacing that splits a campaign into two in your analytics, then export a clean CSV." nailed it in <15s. "No login — nothing leaves your browser" is exactly the line that gets a tool past my IT-blocked, data-wary brain. I'd tell a friend: "spreadsheet for batch-building UTM links that catches the casing/spacing mistakes that fragment your GA4 reports, runs entirely in the browser, exports CSV."

## 2. Value — YES
Today I hand-build these in Excel with CONCAT formulas and eyeball casing — duplicates like Spring-Sale vs spring_sale split one campaign across two analytics rows and I only find out after the campaign runs. This catches that BEFORE export. The CSV round-trip is the make-or-break for me and it PASSED hard: I imported a file with a comma inside a quoted field ("Q3 Launch, EMEA"), accented values (Boletín, Operación Niño), and a comma in content — every one came back byte-perfect, re-quoted correctly, and exported as UTF-8 with a BOM so Excel won't garble the accents. It did NOT silently rewrite my raw casing on import; it flagged it and left the value alone. That's the trust I needed.

## BURIED-FEATURE CHECK — found all three unaided
- Auto-fix DIFF: YES, found it. After Auto-fix a panel "Auto-fixed 3 cells" listed each change per row/field as strikethrough-before → bold-after (e.g. utm_source "News Letter " → "news_letter"), fixed cells turned green in the grid, and there's an Undo right in the panel AND in the toolbar. As the guy terrified of mangled data, this diff is exactly what flips auto-fix from scary to safe.
- Lint rollup: YES. Always-visible, went "All clean ✓" → "6 issues found — jump to first ↓" as I added/imported messy data; per-cell yellow highlights name the exact offending value ("Contains uppercase letters — use lowercase only (current: 'LinkedIn')") with a "Fix this value" link.
- Cold "what we catch" demo: YES. "We catch near-duplicates like spring_sale vs Spring-Sale — they split one campaign into two in GA4" sits next to the rollup when empty and vanished the moment I had real rows. Clean.
- Three setup panels: collapsed, plain subtitles, and they explicitly disambiguate the two that overlap — Naming Template says "Different from Allowed Values." "taxonomy" is mild jargon but fine for a UTM user.

## 3. Advocacy — 8/10
This earns a real 8, not a polite 7. The diff+undo and the lossless, accent-safe, properly-quoted CSV round-trip are precisely the trust signals that move me from "wary of pasting company data into a random site" to "I'd run my ops batch through this." The import modal's "Either way you can Undo immediately after importing" is a genuinely reassuring touch. Copy-row also works (clipboard got the full tagged URL). What holds it back from 9–10: (1) it's still a random site to my security brain — "nothing leaves your browser" is claimed but I'd want it more prominent / a one-line way to verify it's truly offline before I paste a real campaign list; (2) "UTM Spec / Allowed Values" + "taxonomy" + "STRUCTURE of utm_campaign — segments + separator" is a lot of near-synonymous vocabulary to absorb at once. Fix the trust-verifiability nudge and I bring this up unprompted in our ops channel.

```json
{"tester": 4, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["'nothing leaves your browser' is claimed but not verifiable enough to fully calm a data-wary corporate user before pasting real campaign data", "overlapping vocabulary across setup panels (Allowed Values / taxonomy / Naming Template structure) is dense on first read"], "priorConcernsAddressed": "n/a"}
```
