# Jules — Content & community marketer

**Context:** I tag campaign links across X, LinkedIn, Mastodon and Buffer daily, and I bail the instant something wants a login for a 5-minute job. Today I keep UTM conventions in a Notion table and hand-build links (or Google's old one-at-a-time URL builder). My real burn: `Spring-Sale` vs `spring_sale` splitting one campaign into two in GA4.

## Re-check of my prior complaints (I scored this an 8 last time)
- **"Presets buried two hops behind Tools ▾ → Channel Presets → expand" — FIXED.** Presets are now a visible chip row above the grid on cold load: Email, Paid Social–LinkedIn, Google/CPC, Organic Social, **X / Twitter**, **Mastodon**, + Save preset…, with a "New rows use [preset]" selector. The exact thing I asked for. This is the single change that moves me off an 8.
- **"Crowded toolbar, Audit/Launch-Check/Rules blur" — partly addressed.** Toolbar is cleaner (Add row, Auto-fix, QR codes, Import/Export, Tools/Share/Rules). "Audit URLs / Run Launch Check" overlap is gone from the front; "Rules" still sits next to the new lint rollup, slight conceptual overlap but no longer confusing.

## 1. Clarity — YES
~10 seconds. Headline "Clean campaign links in a grid" + subtitle naming "the casing and spacing that splits a campaign into two in your analytics" is literally my bug. "No login — nothing leaves your browser" sealed it. I'd tell a friend: "No-signup bulk UTM builder that runs in your browser and catches the casing mistakes that double-count campaigns in GA4."

## 2. Value — YES
Beats my Notion + manual-link habit. Presets one-click fill source/medium, grid does 30+ at once, Copy gives the full tagged URL (verified on clipboard), Export CSV is right there. Lint+auto-fix is the upgrade Google's builder never had. Mobile (375px) is real responsive cards with a big Copy URL button — usable on my phone, which is half my day. Weekly-use bookmark for me.

## BURIED-CHECK — found all three on my own, unprompted:
- **Auto-fix diff panel — YES.** Hit Auto-fix → "Auto-fixed 4 cells" panel, each change as `Row 2 · utm_source: "LinkedIn" → "linkedin"` (old struck through, arrow, new). **Undo** in the panel AND toolbar — verified it reverts (`linkedin` → `LinkedIn`). Fixed cells glow green in the grid. This is the trust-maker: it shows its work instead of silently rewriting my links.
- **Lint rollup — YES.** Always visible. Flipped "All clean ✓" → "**5 issues found — jump to first ↓**" the moment I typed messy data, back to "All clean ✓" after auto-fix. Jump-to-first is exactly right for 30 rows.
- **Cold "what we catch" demo — YES.** "We catch near-duplicates like `spring_sale` vs `Spring-Sale` — they split one campaign into two in GA4." On cold load (desktop + mobile); correctly disappeared once I added real rows.
- **Three setup panels:** collapsed, plain subtitles. Naming Template = "STRUCTURE of utm_campaign — segments + separator," Allowed Values = "allowed values per UTM field," and it states "Different from Allowed Values." Bounded jargon, distinction spelled out.

## 3. Advocacy — 9/10
Now I'd bring it up unprompted in my marketing Discord. Prior blocker (hidden presets) is fixed, and the before→after diff with undo is what makes me trust it on 40 rows. Off a 10 only because: Naming-Template vs Allowed-Values is two concepts that take one pass to separate, and I couldn't tell at a glance whether presets/rules persist across sessions without explicitly saving a named preset. Minor; neither stops the recommend.

```json
{"tester": 6, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Naming-Template vs Allowed-Values are two concepts that take one pass to separate", "unclear at a glance whether presets/rules persist across sessions without explicitly saving"], "priorConcernsAddressed": "some"}
```
