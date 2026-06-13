{"name":"Rob","clarity":"Yes","value":"Yes","advocacy":6}

# Rob — freelance brand/visual designer (UTM Spec + autocomplete round)

I tag client campaign links occasionally and hate re-typing the same source/medium per client.
Today I keep the last link in a scratch text file and copy-paste/hand-edit. Benchmark is always
"I could just type the query string myself in 4 minutes." Went straight at the new UTM Spec panel.

## 1. CLARITY — Yes
Headline "Tag all your campaign links... so one stray capital letter never splits your data in
Google Analytics" + the subline "fix naming automatically, export clean CSV — no account" told me
instantly what it is and that it's free with no login. As a price-sensitive freelancer, "no
account" is the line that made me keep clicking instead of bouncing. The UTM Spec panel subtitle
"Your team's allowed values — enforced on every cell" was clear once I expanded it.

## 2. VALUE — Yes (with caveats)
The new UTM Spec is the thing I'd actually want. I added a client's canonical values as chips
(linkedin/newsletter/google for source, cpc/email/social for medium), flipped "Enforce UTM Spec",
and each cell turned into a dropdown of those allowed values — so I pick instead of re-typing.
Typos are caught: I typed "emial" and it flagged "Off-spec — nearest allowed email" with a "Fix to
email" button that one-click corrected the cell to green and gave me an Undo. I saved it as a
campaign "Acme — Spring"; it survived a full reload, so next week I just reopen that client and the
spec is already loaded. That genuinely beats my copy-paste — copy-paste never catches "emial" or a
stray capital, which is exactly the GA-splitting pain the headline promises to kill.

## 3. ADVOCACY — 6 (honest, not a polite 7)
The core loop works and I'd use it for repeat clients, but a 6 because:
- The cell autocomplete is a plain native browser dropdown (datalist) with NO visible "pick from
  list" cue — my first instinct was to type "lin" and I immediately ate an off-spec warning before
  I noticed there was a caret to pick "linkedin". A peer will think it's nagging them, not helping.
- Defining allowed values is one-at-a-time + Enter. For a client with 8 source values I want to
  paste a comma/line list, not add them one by one.
- First-session setup (expand panel, add 6 values, toggle enforce) is genuinely SLOWER than my
  4-minute copy-paste. The payoff is only on reuse — and nothing on screen sells that. There's no
  "set up a client spec once, reuse it every week" nudge, so I had to discover the value myself.

ONE change that raises this to an 8: make the per-cell dropdown obviously pickable (a real
"choose allowed value" affordance, not bare datalist), allow paste/bulk-add of allowed values, and
add a one-line "set up once per client, reuse weekly" hint by the UTM Spec panel.

```json
{"tester": 8, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 6, "topComplaints": ["cell autocomplete is a bare native datalist with no visible 'pick from list' cue — I typed and hit an off-spec warning before noticing the dropdown", "defining allowed values is one-at-a-time + Enter; no paste/bulk-add for a client's full list", "first-session setup is slower than my copy-paste and nothing sells the 'set up once per client, reuse weekly' payoff"], "priorConcernsAddressed": "n/a"}
```
