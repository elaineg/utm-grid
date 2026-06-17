# UTM Grid — Panel SYNTHESIS Round 7

Feature under test: branded BULK QR codes for every UTM link (per-row QR preview+download,
bulk "Download QR codes (ZIP)", PNG 512/1024/2048 + SVG, QR Branding panel with fg/bg color
pickers + low-contrast scannability guard that disables download + optional center-logo upload).
All testers used the live local production build (http://localhost:3100) cold in a browser.

## Per-tester verdicts

| # | Persona | Role | In-audience? | Score | Key point |
|---|---------|------|--------------|-------|-----------|
| 1 | Priya | Senior backend engineer | OUT (non-marketer) | 8 | Feature works end-to-end, provably client-side; bulk ZIP buried in Tools dropdown, no bulk-op bar on row select |
| 2 | Marcus | Frontend engineer | OUT (non-marketer) | 9 | Contrast guard is the standout; bulk ZIP hidden in Tools, no inline bulk-action bar; minor URL-input overflow in popover |
| 3 | Wen | Marketing data analyst | **IN** | 9 | Encoded URL visible, named files, incomplete rows excluded, contrast guard real; bulk action buried in Tools dropdown |
| 4 | Tomás | Operations analyst | OUT (non-marketer) | 8 | Privacy + contrast guard sell it; QR Branding buried in Tools, per-row modal exposes no branding |
| 5 | Dana | Demand-gen marketer | **IN** | 9 | Genuine "this is free?!"; contrast guard + campaign-named files save time; whole feature buried in Tools dropdown |
| 6 | Jules | Content & community marketer | **IN** | 9 | Beats QR Monkey/Bitly; contact sheet is the delight; selected all rows expecting bulk-op bar, none appeared |
| 7 | Aisha | Product designer | OUT (non-marketer) | 9 | Craft holds up; contrast guard blocks via after-click note instead of visibly disabling the bulk item |
| 8 | Rob | Brand/visual designer | OUT (non-marketer) | 8 | Contrast guard + SVG + local logo strong; entire branded-QR system buried in Tools, per-row popover has no branding link |
| 9 | Elena | Engineering manager | OUT (non-marketer) | 6 | Not her workflow; bulk QR + Branding buried in Tools, 30-sec skimmer never sees it |
| 10 | Sam | Product manager | OUT (PM, near-audience) | 9 | "Wait, this is free?!"; contact sheet is deck-ready; discoverability — nearly missed feature under Tools menu |

## Audience-weighted result

IN-AUDIENCE marketers (the personas the exit bar gates on):
- Wen (marketing data analyst): 9
- Dana (demand-gen marketer): 9
- Jules (content & community marketer): 9

**All three in-audience marketers advocate at 9.** Sam (PM) and the designers/engineers
(out-of-audience non-fits) cluster at 8–9 as well; only Elena (eng manager, explicitly
"not for me") sits at 6 and does not gate.

The new QR feature works end-to-end for every tester: per-row QR (Copy/PNG/SVG), live
contrast-ratio readout, a low-contrast guard that genuinely disables download, locally-
composited center logo ("never uploaded"), and a bulk ZIP with campaign-named PNGs + a
bonus contact sheet. It lands as a real "free, no-signup, branded bulk QR — this is free?!"
moment for the in-audience marketers. Zero console/page errors reported across all flows.

## Recurring (non-blocking) defect

**Discoverability of the bulk QR / Branding entry point.** 9 of 10 testers independently
named it: the bulk "Download QR codes (ZIP)" and the QR Branding panel live inside the
"Tools ▼" dropdown, and selecting rows surfaces NO inline bulk-op action bar (the per-row
QR popover also has no link to branding/sizes). Several nearly missed the headline feature.
This is the one thing holding the in-audience marketers at 9 instead of 10 — but they still
advocate at 9, so it does NOT block the exit bar. Recommend (for a future polish pass, not
a gate): surface a "Download QR codes (ZIP)" button in a bulk-op/selection bar near Export
CSV, and a count label ("Download 30 QR codes"). Aisha's narrower nit: make the contrast
guard visibly disable the bulk download item with a tooltip rather than an after-click note.

## Exit bar

**PASS.** All in-audience marketer personas (Wen, Dana, Jules) advocate at 9+, consistent
with how utm-grid passed in prior rounds. Out-of-audience non-fits (engineers, designers,
eng manager) do not gate; their scores (6–9) corroborate that the feature is well-built and
delightful. No blocking defect. The discoverability friction is a unanimous polish signal
worth a quick follow-up but is not a release blocker.
