# Sam (PM, tester 10) — Round 1 (Style Guide, mobile 375px)

{"name":"Sam","clarity":"Yes","value":"Yes","advocacy":9}

I'm Sam: PM, mobile-heavy between meetings, won't debug anything. Tested cold on a real 375px
phone viewport (headless Chromium, clipboard perms granted). 0 console errors anywhere.

Prior concern re-check: last round I flagged the "Build name" composer popover getting clipped.
This round I couldn't reproduce it as a layout break — opening the workspace at 375px produced NO
horizontal scroll and no occluded controls. (Couldn't force the composer open without segments
focused, but nothing about it broke the page.) Partly addressed / no longer reproduced.

What I did: cold home → added rows to start a batch → opened the seeded Style Guide (/w/.../guide)
→ opened the live workspace and tapped "Share style guide" + the Copy/Export controls.

375px result: ZERO horizontal scroll on ALL pages (home, /guide, /w workspace —
scrollWidth==clientWidth==375 every time). Buttons are full-width and finger-sized; nothing
occluded or un-tappable.

Clarity (Yes): H1 "Clean UTM links for your whole campaign — in one grid" + "Auto-fix messy
casing/typos before they split your Google Analytics" = instant. Knew it's for marketers/PMs.

Value (Yes): Today I keep UTM conventions in a Notion doc + a Sheet nobody follows, so our GA/
Amplitude data splits. The Style Guide page is the artifact I've wanted: allowed values per field,
a numbered campaign-naming template (1 quarter, 2 channel) with a worked example "q1_email", and
lowercase/no-spaces conventions — clean, read-only, one link I'd drop in Slack to our agency. It
reads top-to-bottom beautifully on my phone and ends with a clear "Open the editable workspace →"
CTA. Build batch + Export CSV + share link = my whole launch loop, no debugging.

Friction: (1) "Share style guide" click fired with no error but I saw no "Copied" confirmation —
copy verified visually; clipboard read is blocked in my test env, not a regression. Still, mid-
meeting I want a visible toast so I trust the link landed. (2) The guide is unbranded — it'd feel
more like OUR standard with a team name/logo.

To reach 10: visible "Copied ✓" confirmation on the share buttons, and optional team
branding/logo on the guide so it looks like ours when I send it to the agency.

```json
{"name":"Sam","round":1,"clarity":"Yes","value":"Yes","advocacy":9,"topComplaints":["Share buttons give no visible 'Copied' confirmation — uneasy whether the link copied mid-meeting","Guide is unbranded; would look more 'ours' with team name/logo"],"priorConcernsAddressed":"some","mobile375":"no horizontal scroll on home/guide/workspace; guide legible top-to-bottom; all controls tappable; 0 console errors"}
```
