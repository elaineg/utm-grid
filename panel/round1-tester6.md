{"name":"Jules","clarity":"Yes","value":"Yes","advocacy":8}

# Jules — Content & community marketer (50/50 desktop/mobile, allergic to logins)

## What I did
Cold-opened on mobile (390px). Built a real link: base myblog.com/spring-launch, source
"LinkedIn", medium "Social", campaign "Spring Launch 2026!". Hit Auto-fix naming, copied
the generated URL. Then opened the seeded Team UTM Style Guide on desktop AND mobile, and
tested the "Share style guide" button on /w/<id>.

## What I saw (good)
- Zero login anywhere — home, workspace, guide all open cold. This is THE thing for me. I'd
  bookmark this for daily X/LinkedIn/Mastodon link tagging.
- Auto-fix nailed it: "LinkedIn"→linkedin, "Social"→social, "Spring Launch 2026!"→
  spring_launch_2026 — lowercased + snake_cased in one click. Copy URL put the real link on
  my clipboard.
- The Style Guide is genuinely excellent: "Why UTM tags matter" with a Newsletter vs
  newsletter example, allowed-values chips per field, a 2-segment naming template with a
  WORKED EXAMPLE (q1_email), and a clean conventions checklist. Renders perfectly on mobile.
  First thing here I'd actually paste into a Notion doc or send to a guest poster/agency
  instead of writing my own "please tag links like this" note. Big value.
- Presets exist (Email, Paid Social–LinkedIn, Google/CPC, Organic Social).

## Friction (honest)
1. "Share style guide" copies the correct /guide URL (verified on clipboard) but gives NO
   confirmation — no "Copied!" label flip, no toast. I clicked and had no idea it worked; I'd
   click 3x. Add a "Copied ✓" state. NOT an env artifact — clipboard read succeeded, the UI
   is just silent.
2. Auto-fix left the trailing "!" (spring_launch_2026!). Convention says no spaces but it
   doesn't strip punctuation, so a "clean" link can still carry a stray "!" that splits GA.
3. My platforms are X and Mastodon; presets cover LinkedIn/Google/Email but not X or
   Mastodon. I can type them, but the whole pitch is "presets per platform," so missing the
   two I post to most is a letdown.
4. Style Guide is keyed to a *workspace* (a team thing). As a solo marketer I'd want a guide
   off my plain localStorage grid too without first thinking "is this a team link?"

## What raises me to 9–10
- Visible "Copied ✓" feedback on Share style guide.
- X (twitter) and Mastodon presets out of the box.
- Auto-fix strips/replaces stray punctuation, not just casing/spaces.
Get those and I'm recommending this unprompted in my marketing Discord.
