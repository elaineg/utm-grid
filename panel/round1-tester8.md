# Rob — Round 1 (Tester 8) — Campaign Naming Template

**Who I am:** Freelance brand/visual designer. Live in Figma/Photoshop. Occasionally tag
client campaign links and otherwise type query strings by hand. Medium tech, desktop.

**Clarity (Yes):** Headline "Clean UTM links for your whole campaign — in one grid" +
subhead about auto-fixing casing/typos told me in ~10s what this is: a spreadsheet that
builds clean tracking links. I'd tell a friend "it's a grid that stops you typoing your
?utm_source=... links and exports them." The new "Campaign Naming Template" panel is clearly
labeled and explicitly says "The STRUCTURE of utm_campaign... Different from Allowed Values,
which sets allowed values" — that disambiguation answered my exact question. Distinct from
UTM Spec/Allowed values: yes.

**Value (Yes — but qualified):** Today I type the string by hand or copy last campaign's
link and swap words; that's where I fumble casing ("Instagram" vs "instagram") and spaces.
This caught all of it instantly: uppercase + spaces flagged, suggested "spring_sale_2026",
and the template enforce flagged my one-segment value as "Off-template — expected 3, found 1".
For a client who hands me a naming convention (quarter_channel_audience), that guardrail is
genuinely better than my eyeball-it method. CSV export + reusable template = saves me the
repetitive grunt-prep I do weekly. It clears my "I could do this by hand in 4 min" bar
because the value is consistency across 10 links, not one.

**Prior concern (column crowding) — IMPROVED:** Measured at 1440px with sidebar open:
utm_campaign/term/content render at right=701/821/941, inside the ~1022px visible area — no
longer pushed off-screen. The wide Generated-URL column now wraps rather than shoving the
input columns away. All 8 columns present + editable after filling (confirmed in DOM, not a
collapse). Counts as addressed.

**Advocacy: 8** — I'd bring this up to designer friends who tag client links. Not a 9 because
the Naming Template lives at the BOTTOM of the right sidebar (below Campaigns + Allowed
values), so I only found it by scrolling — a first-timer setting up a client convention won't
discover it cold. The composer worked (Build name popover w/ live Preview + Apply), but it's
buried. Tighten discoverability of the template panel and this is a 9.

## Frictions
- P2: Campaign Naming Template panel is at the very bottom of the sidebar; low
  discoverability for a feature meant to be set up first.
- P3: The teal "Enforce naming template" toggle in the panel stays disabled with "add
  segments first" — fine, but no inline "+ Add segment" hint right at the toggle; you must
  scroll past JOIN PARTS WITH to find it.
- P3: Filling a messy value doesn't auto-fix; you must click "Fix" or "Auto-fix naming".
  Reasonable (footer says "source cells left as typed") but a first-timer may expect
  auto-correction.

```json
{ "name": "Rob", "clarity": "Yes", "value": "Yes", "advocacy": 8, "likes": ["Naming-template panel clearly disambiguated from Allowed Values","Off-template warning (expected 3 segments, found 1) is exactly the client-convention guardrail I need","Instant casing/space lint with suggested fix","Build name composer w/ live Preview + Apply","Prior off-screen column crowding now resolved at 1440px"], "frictions": [{"severity":"P2","issue":"Naming Template panel sits at the bottom of the sidebar — low discoverability for a setup-first feature"},{"severity":"P3","issue":"+ Add segment is below JOIN PARTS WITH; the disabled enforce toggle's 'add segments first' hint isn't right next to the add control"},{"severity":"P3","issue":"Messy values are not auto-fixed without clicking Fix/Auto-fix naming; first-timers may expect autocorrect"}], "verdict_sentence": "The new Campaign Naming Template nails the client-convention guardrail I actually need and is clearly distinct from Allowed Values, and my old column-crowding gripe is fixed — but it's buried at the bottom of the sidebar, which is the only thing keeping it off a 9." }
```
