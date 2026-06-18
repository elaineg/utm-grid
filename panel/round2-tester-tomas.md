# Tomás — round 2

Ops analyst, Excel power user, Edge on locked-down corp laptop. Round 1: Adv 8 (Clarity Y, Value Y).
Cap was (a) three setup panels read as overlapping dense jargon, (b) unverifiable "nothing leaves your browser."

## Prior concerns — re-checked cold
- **Panel distinctness — FIXED.** On one pass the three subtitles now do different jobs and no longer blur:
  "Build consistent campaign names — define parts like quarter_channel_audience" (the shape),
  "Save + reopen a grid — pick up where you left off" (persistence),
  "Block bad values — set which sources, mediums, and campaigns are allowed" (the list). The Naming
  Template even says "Different from Allowed Values — this sets the shape, not the list," which kills
  the exact overlap I complained about. I could tell them apart without reading twice.
- **"Collapsed by default" — NOT done.** On a TRUE fresh load (no prior localStorage) the Campaign
  Naming Template panel is still EXPANDED (full body text visible, teal-highlighted). The team said it'd
  be collapsed; it isn't. Minor, but it's the densest panel and it's the one greeting cold users.
- **Privacy verifiability — partial.** Still just a footer claim. BUT I watched Import + Export run with
  zero network calls, so the client-side story now holds up in practice for the parts I care about.

## Fresh judgment
- **Clarity: Y.** H1 "Clean campaign links in a grid" + subtitle about casing/spacing that "splits a
  campaign into two in your analytics" nails the pain in one read. I'd tell a friend: "batch-build and
  clean UTM links in a spreadsheet-style grid, free, no login."
- **Value: Y.** Today I hand-build tagged links in Excel and eyeball for `Spring Sale` vs `spring_sale`
  drift. Here the Auto-fix diff showed `" Newsletter " -> "newsletter"`, `"Spring Sale" -> "spring_sale"`
  per row with strikethrough + Undo, plus an "All clean ✓" rollup. CSV round-trip is the clincher: I
  imported a file with a quoted-comma field `"q3_sale, big"` and it survived intact and re-exported
  correctly quoted, with the comma/space percent-encoded in the URL. That's the "won't mangle my data"
  proof I needed. The Map-CSV-columns modal (auto-mapped, Append/Replace, "you can Undo immediately")
  is reassuring for someone who pastes company data.
- **Advocacy: 8.** I'd recommend it to my ops/marketing peers. Held below 9 by: (1) the Naming Template
  still opens expanded on cold load, so first impression is still a wall of text in that one card; (2)
  privacy is a claim not a visible signal (no in-app "0 network requests" proof for a wary corp user);
  (3) the QR/preset/Team-Workspace surface is a lot of chrome around the core grid that I didn't need on
  day one. None are dealbreakers — the core clean+round-trip works and it's free with no install.

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Naming Template panel still expanded on true cold load despite 'collapsed by default' fix", "Privacy is footer-claim only — no visible/verifiable signal for a wary corporate user", "Lots of chrome (QR, presets, workspace) around the core grid on first load"], "priorConcernsAddressed": "some"}
```
