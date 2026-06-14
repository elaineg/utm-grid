# Round 1 — Tomás (Ops analyst, Edge/Windows, Excel power user)

I build tagged links for ops campaigns in Excel; IT blocks installs, so a browser tool that
round-trips my CSV without mangling data is exactly what I want.

**Clarity — Yes.** Headline "Clean UTM links for your whole campaign — in one grid" + the
sub "no login, nothing leaves your browser" told me in 10 seconds what it does and answered
my data-paranoia. The grid looks like Excel. I'd tell a friend: "spreadsheet-style UTM
builder that auto-cleans casing/typos, runs entirely in your browser."

**New feature — Campaign Naming Template.** Found it quickly: a labelled sidebar panel
"Campaign Naming Template" whose helper text literally says "The STRUCTURE of utm_campaign...
Different from Allowed Values, which sets allowed field values." That disambiguation is the
right call — I would NOT have confused it with Allowed Values. I defined ordered segments
quarter/channel/audience, set the "_" join separator, added an `email` token to channel.
Per-row "Build name" popover ("Build campaign name" with QUARTER/CHANNEL/AUDIENCE + live
PREVIEW + Apply) worked. Toggling "Enforce naming template" flagged my off-template row with
a teal "1 cell off-template" badge; building a name cleared it. Discoverable and distinct.

**Value — Yes.** Today I hand-build these in Excel with CONCAT formulas and still get
inconsistent campaign names across the team. This enforces our naming convention AND
auto-fixes casing (Email→email, "q3 ops launch"→q3_ops_launch). CSV export quoted my
comma/ampersand values correctly and encoded the URL — it did NOT mangle my data, which is
the whole reason I'd adopt it over my sheet.

**Friction:** Composer Apply accepted `_email_` (empty quarter/audience) as "on-template" —
enforcement feels loose; I'd expect a partial/empty-segment value to still warn. Minor.

**Advocacy — 8.** I'd recommend it to my ops team for naming consistency. Not a 9 only
because enforcement tolerates empty segments and I'd want an Import-CSV round-trip that
also lints against the template on the way in.

```json
{ "name": "Tomás", "clarity": "Yes", "value": "Yes", "advocacy": 8,
  "likes": ["Naming Template panel is clearly distinct from Allowed Values (explicit helper text)", "Per-row Build name composer with live preview + Apply", "Enforce toggle shows teal '1 cell off-template' badge and clears when fixed", "CSV export quoted comma/ampersand values and encoded URL — no data mangling", "Auto-fix naming cleans casing/spaces exactly as expected", "Runs fully in-browser, no login — matches my data-paranoia"],
  "frictions": [
    {"severity":"P2","issue":"Enforce template accepts values with empty segments (e.g. '_email_') as on-template; partial/empty segments should still flag"},
    {"severity":"P3","issue":"No way to lint imported CSV against the naming template on the way in — I'd want off-template rows flagged after Import CSV too"}
  ],
  "verdict_sentence": "A browser-native, Excel-friendly UTM grid that now also enforces our campaign naming convention without ever touching a server — exactly what an ops analyst behind a locked-down laptop needs, held back only by loose empty-segment enforcement." }
```
