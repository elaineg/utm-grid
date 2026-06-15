{"name":"Wen","clarity":"Yes","value":"Yes","advocacy":"10","prior_concerns_addressed":"Yes — both"}

# Wen — Round 2 (marketing data analyst; distrusts tools that transform data invisibly)

My round-1 gap-to-10 was two things: (1) the export was an opaque base64 blob I couldn't
trust, and (2) the device-migration feature was buried under Tools when I'd look under Share.
I re-checked exactly those.

## Gap 1 — "opaque base64 blob; give me a raw-JSON view before I trust the bundle"
RESOLVED. Tools ▾ → IMPORT & MOVE → "Move to another device" now has a `▸ Show what's inside`
disclosure. I saved a campaign ("Wen Q2 Email"), opened the modal, clicked it, and it reveals
the actual pretty-printed, READ-ONLY JSON of my own data — not a base64 string. I read every
field: `campaigns[].name`, each `rows[]` with `baseUrl` + all five utm_* params, `settings`
(requiredParams/lowercaseOnly/noSpaces), `spec.allowedValues`, `namingTemplate`, `version`,
`exportedAt`. It's the literal object that travels. I can diff it, grep it, and confirm nothing
got mangled in transit. The blob is gone. This is the in/out transparency I demand.

## Gap 2 — "migration buried under Tools; I'd look under Share"
ADDRESSED. The Tools menu is now split into three labeled headers — BUILD & REUSE / GOVERN
CONVENTIONS / IMPORT & MOVE — and "Move to another device — export / import your setup" sits
under IMPORT & MOVE. That header is the exact word I'd scan for. It's still under Tools rather
than Share, but the labeled grouping made it findable in one glance; I didn't hunt. Good enough.

## Bonus trust signal that landed
Modal states: "Export and import run fully offline — zero network requests." I don't trust copy,
so I ran a network monitor across the whole session — saving the campaign, opening the modal,
revealing the JSON — and counted ZERO non-asset network requests. The claim is literally true.
For someone who distrusts tools that phone home, that packet check is the seal.

## Single thing most holding back the score
A polish nit, not a blocker: "Show what's inside" only appears once a bundle has content. A cold
user opening Move with an empty grid sees only "Nothing saved yet" and never learns the JSON view
exists — so the transparency feature is invisible to the first-timers who'd be most suspicious.
I'd surface "your data exports as plain readable JSON" even in the empty state. Doesn't cost a point.

## Re-score
Round 1: 9. Round 2: **10.** Both gaps closed and the offline claim survived my packet check. I'd
now tell any analyst who's lost a campaign to a stray capital: "and you can read exactly what it
exports — it's just JSON, and it never leaves your machine." That sentence is my 9→10.

```json
{"tester": 3, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 10, "topComplaints": ["Show what's inside is hidden until a bundle has content, so suspicious first-timers never see the JSON transparency / offline claim", "Move still lives under Tools not Share, though the IMPORT & MOVE label makes it findable"], "priorConcernsAddressed": "all"}
```
