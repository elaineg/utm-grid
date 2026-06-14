# utm-grid — Round 1, Tester 1 (Priya, senior backend eng, keyboard-first, skeptical)

## What I did
Cold-opened the prod URL. Headline "Clean UTM links for your whole campaign — in one grid"
+ the casing/typo subline told me what it is in ~10s. I'm not a marketer — a teammate sent
me this instead of a spreadsheet for a side-project launch, so I'm judging: faster than
hand-editing query strings, and does it leak my data.

## 1. Did I notice the audit feature?
Yes, without hunting. "Paste & Audit URLs" is the only violet/outlined chip in the toolbar
(magnifier icon), next to Import CSV, with the subline "Already have tagged links? Paste
them to find every inconsistency at once." Purpose reads as distinct from the build-new
grid. Good discoverability.

## 2. Audit flow
Pasted 5 lines: two differing only by casing (utm_source Newsletter vs newsletter;
utm_medium email vs Email; utm_campaign Spring-Sale vs spring_sale vs spring-sale), one
clean, one missing utm_medium, one garbage non-URL line. Result chip: "Audited 4 URLs —
13 cells flagged · 1 line skipped. Undo." Exactly right:
- Malformed line was SKIPPED, not crashed (1 skipped). No console errors.
- Casing preserved as-typed — did NOT silently mangle my data (matters to me).
- Lint is precise/actionable, e.g. ⚠ `Inconsistent utm_campaign across rows: "Spring-Sale"
  vs "spring_sale" vs "spring-sale" — these will split campaign data in GA4`, with a "Fix"
  affordance. Same for source and medium; the missing utm_medium row parsed correctly.
- Append vs Replace toggle + "you can Undo immediately after auditing" — sane safety.
Network check (I watched the tab): ZERO POST/PUT requests the whole session. The "nothing
leaves your browser" claim holds — as a skeptic, this is what flipped me. This would
genuinely save me time QA-ing inherited links vs eyeballing query strings or regexing a
sheet column.

## 3. Regression on core build
Typed base + source/medium/campaign in row 1; generated URL assembled live and correct:
`https://mysite.io/launch?utm_source=twitter&utm_medium=social&utm_campaign=launch2026`.
No regression.

## Friction / nits
- After auditing, the default grid shows BASE URL + GENERATED URL columns; the
  utm_source/medium/campaign columns are collapsed off to the right, so per-cell flags
  aren't visible above the fold without horizontal-scrolling the table. The summary chip
  carries the signal and the warnings + Fix exist in the DOM, but I'd want flagged cells
  visible at a glance right after an audit. Minor, not a blocker.
- Toolbar is busy (Add row, Auto-fix, Undo, Import, Paste&Audit, Export, Copy share, Copy
  all) — fine for a power user, slightly crowded on first glance.

## Verdict
clarity: Yes — app + audit purpose both clear inside 30s.
value: Yes — I'd reach for the audit flow to vet inherited/QA links, more than once.
advocacy: 8 — lint is precise, nothing touches the network, input not mangled. Held off a 9
only by the post-audit column-visibility nit and toolbar density.

```json
{"name":"Priya","clarity":"Yes","value":"Yes","advocacy":8}
```
