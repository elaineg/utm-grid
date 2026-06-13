{"name":"Priya","clarity":"Yes","value":"Yes","advocacy":9}

# Priya — Senior backend engineer, keyboard-first, hates signups (Round 2)

## Prior concerns — re-checked first
Last round (advocacy 8) I asked for two things:
1. **One-pass collapse of case/separator variants.** Mostly addressed. "Match case" now
   exists and defaults OFF (aria: "Match case (off = case-insensitive)"). I set 4 rows to
   `Spring-Sale / spring_sale / SPRING-SALE / spring-sale`, ran one F&R of
   `spring-sale → spring-sale`, and it hit 3 rows in ONE pass ("Replaced in 3 rows — Undo")
   — every casing variant collapsed. That's the move I wanted; last round casing was its own
   pass. Caveat: the SEPARATOR variant `spring_sale` still needed a second pass, since
   case-insensitivity doesn't equate `-` and `_`. So the changelog's "Spring-Sale and
   spring_sale collapse in ONE pass" is only true via two find strings — casing is one-pass,
   separators aren't. Honest, but minor.
2. **Keyboard reachability of the bulk toolbar.** FIXED, cleanly. From "Value to set", one
   Tab lands on "Set column" and Enter applied to all rows. Tab order is sane: Value → Set
   column → Find → Replace → Find & replace → Match case → row checkboxes. I ran a full F&R
   (Find→Tab→Replace→Tab→button→Enter) without the mouse — 3 rows replaced. For a home-row
   person this is the difference between "I'll use it" and "I won't."

## 1. CLARITY — Yes
Headline + "Edit links in a grid, fix naming automatically, export clean CSV — no account"
still nails what/who/no-signup in under 5s. Bulk toolbar reads left-to-right as before.

## 2. VALUE — Yes
Still beats hand-editing query strings in neovim or a throwaway sheet; the case-insensitive
default removes the most error-prone part of consistency cleanup. Suspicion checks held:
0 network requests after page load, 0 console errors — all local, as advertised.

## 3. ADVOCACY — 9
Both asks landed and keyboard-drivability pushes it over my bar — I'd bring it up unprompted
to anyone doing a launch post. Not a 10 only because separator+casing collapse still isn't
a single canonical-normalize action (I'd still reach for the per-row "Fix" on mixed `-`/`_`),
and there's no shortcut to jump focus from the grid into the toolbar (I Tab a while or click).

## ONE change to raise advocacy to 10
A single "Normalize column" action that collapses BOTH casing AND separator variants to one
canonical value in one click (treat `-`/`_`/space as equivalent). That kills my last manual pass.

Evidence: /Users/elaine/app-factory/validator-workspace/round2-tester1/ (r2-01-variants,
r2-02-pass1, r2-03-pass2 .png + step3/step4.mjs logs)

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["separator variants (spring_sale vs spring-sale) still need a second F&R pass — no single canonical-normalize action", "no keyboard shortcut to jump focus from grid into the bulk toolbar"], "priorConcernsAddressed": "all"}
```
