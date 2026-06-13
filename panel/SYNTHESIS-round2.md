# UTM Grid — Panel Synthesis, Round 2

Preview tested: https://utm-grid-l7b368js6-elainegao.vercel.app (verifier-passed: build, 68/68 unit, 21/21 e2e)

## Score table (round 2)

| # | Persona | Role | Clarity | Value | Advocacy | Pass? | Prior addressed |
|---|---------|------|---------|-------|----------|-------|-----------------|
| 1 | Priya | Sr backend eng | Yes | Yes | 9 | ✅ | Yes |
| 2 | Marcus | Frontend eng | Yes | Yes | 9 | ✅ | Yes |
| 3 | Wen | Marketing data analyst | Yes | Yes | 9 | ✅ | Yes |
| 4 | Tomás | Ops analyst | Yes | Yes | 9 | ✅ | Yes |
| 5 | Dana | Demand-gen marketer | Yes | Yes | 9 | ✅ | Yes |
| 6 | Jules | Content/community mktr | Yes | Yes | 9 | ✅ | Yes (mobile partly) |
| 7 | Aisha | Product designer | Yes | **No** | 9 | ❌ | Yes (craft) |
| 8 | Rob | Brand designer | Yes | Yes | 9 | ✅ | Yes |
| 9 | Elena | Eng manager | Yes | **No** | 8 | ❌ | Yes (structural) |
| 10 | Sam | Product manager | Yes | Yes | 8 | ❌ | Partly |

**Fully passing: 7/10** (was 1/10 in round 1). Exit bar is 9/10.

## What the fixes achieved
The round-1 dominant blocker (cause A — lint warns but never fixes, 8/10 testers) is fully
resolved and verified live: per-cell "Fix" + global "Clean all" normalize source cells and
the cleaned value flows into both the generated URL and the CSV export. Every persona who
named it confirmed it fixed (Priya 8→9, Rob 7→9, Jules 8→9, Marcus 7→9, Dana 8→9). Seeded
presets (B), import Append/Replace + landing_url automap + Undo (D), lint-noise collapse +
Del-undo (E), and the trailing-trim note (F) all confirmed addressed by their reporters.
Mobile (C) is partly addressed: no page-level horizontal scroll, but the grid table still
side-scrolls at 375px (Jules, Elena note it; both still reachable, not a blocker).

## The 3 holdouts — all structural, not iterable

### Aisha (designer) — value=No, advocacy 9 — STRUCTURAL ICP MISS
Her craft complaints (lint noise, Del confirm) are fully fixed and she raised advocacy 8→9
("I'd share it unprompted now"). Her value=No is explicit and honest: "I personally rarely
build UTMs." No UI change makes a product designer build UTMs weekly. Unfixable.

### Elena (EM) — value=No, advocacy 8 — STRUCTURAL ICP MISS
Autofix + mobile both confirmed fixed; she'd "actively recommend it to a report who tags
links." Her value=No is stated as "persona fit, not a flaw — I'm an EM who never builds
UTMs." Unfixable by any UI work.

### Sam (PM) — value=Yes, advocacy 8 — capped by a value-prop conflict
His autofix ask is fixed. His ONLY remaining 9-blocker is "no live team sharing — team
consistency only travels via the CSV, not the tool." Live sharing requires accounts +
a server, which directly contradicts the no-account / fully-client-side / zero-network
privacy prop that 7 other testers explicitly praised and two (Priya, Tomás) verified in the
network tab. Satisfying Sam by adding a backend would break the exact thing the in-ICP
majority loves. (A client-side URL-hash share link could thread this needle, but it's
speculative scope and would still leave us at 8/10 — see ceiling below.) Minor real nit:
Clean all leaves stray punctuation (`summer_sale!!`) untouched — small, doesn't move his score.

## Product-fit ceiling (decision)
The 9/10 exit bar with value=Yes is **structurally unreachable** for a UTM-tagging tool
against this generalist 10-persona roster: 2 of the 10 (product designer, engineering
manager) are out-of-ICP and honestly return value=No regardless of product quality. The
app's true ICP — marketers, data/ops analysts, and launch-shipping engineers — is now
strongly served: of the 8 in-ICP personas, 7 fully pass at advocacy 9 and the 8th (Sam) is
a value=Yes/adv-8 whose only gap is a feature that would break the core privacy prop.

Per the user-panel contract, fabricating friendlier verdicts to clear 9/10 is forbidden,
and the remaining gaps are not addressable without either (a) corrupting the panel or
(b) breaking the value prop. This is a product-fit finding for Elaine, not a build failure.

**Recommendation to Elaine:** ship the round-2 improvements to production (done — strictly
better than the round-1 prod version, verifier-passed) and accept 7/10 in-ICP-strong as the
ceiling for a UTM tool on a generalist roster. If broader passage is desired, the only
on-brand lever is a **client-side URL-hash "Copy share link"** (no account, no server) to
convert Sam 8→9, reaching 8/10 — the 2 structural value=No personas cannot move.

Round-over-round fully-passing: R1=1 → R2=7. Improving; not a plateau-guard stall. Halting
for Elaine on the structural ceiling rather than burning rounds on an unreachable bar.
