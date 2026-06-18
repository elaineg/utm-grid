# Rob — Brand/visual designer (freelance, OUT-OF-AUDIENCE)

**1. Clarity — YES.** Headline "Clean campaign links in a grid" + the subline "Build and tag a whole batch of 30+ campaign links at once — and auto-fix the casing and spacing that splits a campaign into two in your analytics, then export a clean CSV" told me exactly what it is in ~10s. "No login — nothing leaves your browser" is reassuring. I'd tell a friend: "It's a spreadsheet for building UTM links in bulk, it catches typos that split your data in GA4, and you export a CSV." The "what we catch: spring_sale vs Spring-Sale splits one campaign into two in GA4" demo line nailed the *why* instantly.

**2. Value — MARGINAL (honest, given I'm out-of-audience).** Today I hand-type maybe 2–4 tagged links a campaign, or copy a query string from the last one and tweak it — takes me 4 minutes, no tool. For *me* this is overkill: opening it, picking presets, filling cells is about the same effort as editing one URL by hand. BUT the value is real and obvious for anyone doing 30+ at once — the auto-fix + lint genuinely beats eyeballing casing across rows. If a client ever handed me a batch, I'd reach for this. It's just not my weekly grind.

**3. Advocacy — 6/10.** Solid, fast, no-signup, does what it says. Loses points only because for *my* low-volume use it doesn't save meaningful time over the address bar — and a 6 reflects that I wouldn't bring it up unprompted, but I'd happily send it to a marketer friend who lives in UTMs. Nothing confused or broke me.

## BURIED-FEATURE CHECK — all three found UNAIDED:
- **Auto-fix diff panel: FOUND.** Clicked "Auto-fix" in the top toolbar (always visible). It popped an "Auto-fixed 2 cells" panel showing `Row 2 · utm_medium: ~~"Newsletter"~~ → "newsletter"` style before→after with strikethrough + arrow, fixed cells highlighted green, and BOTH a toolbar "Undo" and an in-panel "Undo". Tested Undo — it correctly reverted to "Newsletter". 
- **Cross-row lint rollup: FOUND.** Always-visible line above the grid: "All clean ✓" on open, flipped to "3 issues found — jump to first ↓" after messy input, dropped to "1 issue found" after auto-fix (the unfixable invalid base URL correctly left for me). Per-cell warnings ("Contains uppercase letters — use lowercase only") with "Fix this value" links.
- **Cold "what we catch" demo: FOUND + behaves correctly.** The spring_sale vs Spring-Sale example shows on a fresh/empty grid with an × to dismiss, and it disappeared on its own once I added a real second row of data.
- **Three setup panels: FOUND**, collapsed by default at the bottom with plain-language subtitles (Campaign Naming Template = "STRUCTURE of utm_campaign"; UTM Spec/Allowed Values = "your taxonomy"; Campaigns = "reopen a past batch").

CSV export verified: clean, lowercased post-autofix, includes a ready generated_url column + Excel BOM. No console errors anywhere. (Team Workspace not tested — DB not provisioned locally, per caveat.)

```json
{"tester": 8, "round": 1, "clarity": "Yes", "value": "Marginal", "advocacy": 6, "topComplaints": ["For low-volume taggers like me it's no faster than editing one URL in the address bar", "Out-of-audience: I tag links occasionally, not 30 at a time, so no weekly habit forms"], "priorConcernsAddressed": "n/a"}
```
