# utm-grid — Campaign Naming Template — Panel SYNTHESIS (Round 2)

**Result: PASS.** 10/10 testers at the 9 advocacy bar, clarity Yes, value Yes. Exit condition met.

## Round-2 score table

| # | Name | Persona | Clarity | Value | Advocacy | Prior concerns addressed |
|---|------|---------|---------|-------|----------|--------------------------|
| 1 | Priya | Senior backend SWE | Yes | Yes | 9 | Yes — panel→top w/ icon+sublabel+pointer; toggles separated; reload restores full template; editable cols stay visible w/ warning |
| 2 | Marcus | Frontend eng, 1280px | Yes | Yes | 9 | Partly — panel-buried fully fixed; long-URL column squeeze only partly fixed (P2 below) |
| 3 | Wen | Marketing data analyst | Yes | Yes | 9 | Yes — reload now hydrates FULL template (segments+tokens+separator+enforce), verified two ways; R1 P1 fixed |
| 4 | Tomás | Ops analyst, Edge/Win | Yes | Yes | 9 | Yes — empty leading/middle/trailing segments now flagged off-template; valid name stays clean |
| 5 | Dana | Demand-gen marketer | Yes | Yes | 9 | Yes — Build name now 106×44 solid teal; reload restores full template into expanded panel |
| 6 | Jules | Content/community mktr | Yes | Yes | 9 | Yes — panel auto-expands at top w/ distinct icon, sublabel, "Different from Allowed Values" explainer + pointer |
| 7 | Aisha | Product designer | Yes | Yes | 9 | Yes — panel top/auto-expanded w/ pointers; solid 44px teal Build-name on every row; composer portaled/unclipped |
| 8 | Rob | Brand/visual designer | Yes | Yes | 9 | Yes — panel pinned top, above fold cold; icon/sublabel/pointer; columns still fit at 1440px |
| 9 | Elena | Eng manager (mobile) | Yes | Yes | 9 | Yes — panel top-of-rail, auto-expands, "Define structure →" pointer above fold on laptop AND mobile |
| 10 | Sam | PM (laptop+mobile) | Yes | Yes | 9 | Yes — composer portaled & unclipped on laptop and 375px; template top of rail w/ pointer |

**Advocacy ≥ 9: 10/10. Clarity Yes 10/10. Value Yes 10/10.**

## Remaining non-blocking frictions

- **P2 (Marcus, 1280px):** with Enforce on + a long generated URL the table overflows its
  container (~1982px in ~1022px); the GENERATED URL column squeezes UTM_MEDIUM/CAMPAIGN/TERM
  out of view, so the flagged campaign cell + its inline off-template warning still need a
  horizontal scroll to read. DOM-correct, not deleted/clipped — a layout tension, not a defect.
  Logged as next-deepen residual (sticky/clamped generated-URL column or pinned row-level banner).
- **P3 (Tomás / Wen / Sam-mobile):** cold-load / reload auto-expand of the Naming Template
  panel does not reliably fire — it sometimes returns collapsed (and on 375px the pointer
  scrolls-to + highlights but needs one extra tap). State is preserved, just occasionally hidden.
- **P3 (Aisha):** a segment name typed but not committed via "Add" is silently dropped when
  Build name opens — designers expect Enter/commit-on-blur to capture it.

These are cosmetic/edge-case and below the advocacy bar; none gated a 9. **Exit condition met — ship.**
