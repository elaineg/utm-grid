{"name":"Wen","clarity":"Yes","value":"Yes","advocacy":9}

# Wen — Marketing data analyst (GA4/BigQuery/Looker) — UTM Spec round

Back to stress-test the new UTM Spec (canonical taxonomy). This is my exact pain: dirty
utm_source splitting campaigns in GA4. I distrust tools that transform data invisibly, so I
hunted for silent rewrites. Found none.

## 1. CLARITY — Yes
Headline nails it: "one stray capital letter never splits your data in Google Analytics."
Right sidebar "UTM Spec — your team's allowed values, enforced on every cell" plus the
"Enforce UTM Spec" toggle by the lint rules read instantly. I'd tell a peer: "bulk UTM
builder that lets you pin a canonical value list and flags anything off-taxonomy, in-browser,
no account."

## 2. VALUE — Yes
Today I police this in a dbt staging model + Sheets find/replace, then re-export — slow and
error-prone. Here I defined utm_source = {newsletter, facebook, google}, enforced, and:
- `fb` (lowercase, passes every lint) → flagged "◆ Off-spec — nearest allowed: facebook /
  Fix to facebook". The fuzzy nearest-match was right. Clicking Fix changed fb→facebook. This
  is the real win: lint catches case/spaces, but only a SPEC catches a valid-looking wrong
  token like fb/fbook. That's the gap my dbt rules exist to close.
- Taxonomy rides the share link: opened it in a clean browser (no localStorage) as a teammate
  — chips arrived, Enforce was already on, and typing `fb` there flagged off-spec too. My
  taxonomy genuinely propagates. That's the part that makes me share it.

## 3. ADVOCACY — 9/10
- No invisible transforms. Before I clicked Fix, the generated URL kept utm_source=fb raw;
  imported CSV kept Facebook/Spring_Sale/fb bit-for-bit. CSV import shows a column-map modal
  + Append/Replace + an Undo promise. Every fix is explicit and opt-in. Honest tooling — the
  thing I most need.
- CSV export clean: real headers, my exact values, generated_url column. Zero console errors
  across every test.

## What holds back the 10
- `Facebook` (capital F) is caught by the Lowercase lint, NOT the spec, and spec-matching is
  case-insensitive — so a teammate who disables lowercase-lint but enforces the spec would let
  `Facebook` pass as the allowed `facebook`. I'd want the spec itself to flag case drift
  (or canonicalize on Fix), independent of the lint toggle.
- No bulk "Fix all off-spec" — I fixed fb one cell at a time. A 3-row dirty import is fine; a
  200-row paste, I'd want one button. Same gap as my earlier ask for a one-click normalize.
- generated_url exports as a plain column; flag it as derived so a teammate doesn't edit it.

```json
{"tester": 3, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["spec match is case-insensitive and leans on the lowercase lint — Facebook slips past spec if lint is off; spec should flag case drift itself", "no bulk 'Fix all off-spec' — off-spec values must be fixed one cell at a time"], "priorConcernsAddressed": "some"}
```
