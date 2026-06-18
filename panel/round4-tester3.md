# Round 4 — Wen (Marketing data analyst) — REGRESSION SENTINEL, HOLD CHECK

**Clarity: Yes.** Cold, the H1 + subhead ("Clean campaign links in a grid" / "auto-fix the
casing and spacing that splits a campaign into two in your analytics, then export a clean
CSV") tells me in 10s it's for analytics owners like me. The always-on "We catch
near-duplicates like spring_sale vs Spring-Sale — they split one campaign into two in GA4"
demo line nails who it's for.

**Value: Yes.** Today I babysit this in Sheets with LOWER()/TRIM() and still miss near-dupes
until they fork a campaign in GA4. This catches them up front, names the exact split risk,
and — critically for me — round-trips CSV byte-clean.

## Prior concern re-check (my round-3 cap was learnability; core had to NOT regress)
- **Auto-fix diff: HELD.** "Auto-fixed 3 cells" with per-cell strikethrough before→after
  ("Newsletter"→"newsletter", "Email"→"email", "Spring-Sale"→"spring_sale") + Undo. Fixed
  cells highlighted green. Nothing transformed invisibly.
- **Lint rollup: HELD.** Seeded a casing near-dup → "5 issues found — jump to first" naming
  '"newsletter" vs "Newsletter" — these will split campaign data in GA4'. Back to "All clean ✓"
  after fix. Always visible.
- **CSV round-trip: HELD — byte-clean.** Torture import (leading zeros 00789/00042/leading0007,
  unicode créme_brûlée/日本語/Größe, embedded quote `"size ""XL"""`, embedded comma `"sale, big"`)
  all round-tripped EXACTLY. Leading zeros NOT coerced, unicode intact, RFC-4180 quote escaping
  correct, no silent casing change on import (only when I clicked Auto-fix). generated_url column
  percent-encoded correctly while raw UTM columns stay human-readable. BOM on export (Excel-safe,
  deliberate). 0 console errors.
- **Three setup panels visual fix: CONFIRMED.** Computed styles of all three collapsed cards are
  byte-identical (border 0px, radius 0, transparent bg, 73px h, 1232px w). UTM Spec panel now a
  true equal peer — no teal border anywhere but the QR toolbar button. The shipped pixel fix is real.

**Advocacy: 9.** Holding. No regression to lint, diff, or CSV round-trip — all three held under a
deliberately nasty test. The visual fix is genuine polish (panels read as equal peers now) but
adds no new capability, so it doesn't move me past 9. Still capped by the same prior, unchanged
thing: the dual-purpose Import dialog + several collapsed panels take a beat to learn cold —
not a defect, just not "frictionless on first open," which is what a 10 needs.

(Did not score Team Workspace — known to need a DB absent in this local env.)

```json
{"name":"Wen","clarity":"Y","value":"Y","advocacy":9,"why":"No regression: auto-fix before/after diff, always-on GA4-split lint, and byte-clean CSV round-trip (leading zeros, unicode, embedded quotes/commas, no invisible transforms) all held under a torture test; 0 console errors. The shipped fix (UTM Spec collapsed panel now pixel-identical to the other two) is confirmed via byte-identical computed styles. Holding at 9, not 10, because import-dialog + collapsed-panel learnability is unchanged from prior — polish, not a new capability."}
```
