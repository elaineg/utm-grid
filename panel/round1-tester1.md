{"name":"Priya","clarity":"Yes","value":"Yes","advocacy":8}

I'm Priya — senior backend eng, keyboard-first, skeptical, hand-edits query strings, hates signups. A teammate sent me this for a side-project launch post.

WHAT I DID
- Cold-opened the app (desktop 1440px). H1: "Clean UTM links for your whole campaign — in one grid." Got it in <5s: a spreadsheet-style UTM builder, no login, runs in-browser.
- Built a row: base URL + Twitter/social/Launch Day. App correctly validated ("Not a valid http(s) URL — include https://", "utm_campaign required") and "Auto-fix naming" lowercased + underscored everything. Copied link = `https://myproject.dev/launch?utm_source=twitter&utm_medium=social&utm_campaign=launch_day`. Exactly what I'd have typed by hand, faster and without typos.
- New feature: viewed the seeded style guide (/w/.../guide). Then created my own workspace from scratch, clicked "Share style guide" — it copied the correct /guide link to clipboard. Viewed my empty-state guide too.
- Zero console errors anywhere. Core flow stays client-side (copy verified).

WHAT WORKED
- Core flow genuinely beats hand-editing 5 URLs. Auto-fix is the real value — it catches the casing splits I'd never notice.
- Style guide is a legible, sendable artifact: "WHY UTM TAGS MATTER" explainer, allowed-value chips per field, a campaign naming template WITH a worked example (q1_email), and a checklist of conventions. I'd actually send this to an agency/contractor instead of writing a Notion doc.
- Empty-state guide doesn't render broken — it says "No custom taxonomy defined yet" and still shows universal rules. Thoughtful.
- "Anyone with this secret link can view this page" sets the right trust expectation for a read-only share.

FRICTION
- For a one-off launch post (my actual job), the whole workspace/team/style-guide machinery is overkill. Single-grid + autofix + copy is what I want; the team stuff is noise to me personally.
- Three share concepts — "Copy share link" vs "Create shared workspace" vs "Share style guide". I had to read gray helper text ("Different from Copy share link, which sends a frozen snapshot") to tell them apart. A skeptic skims; this loses people.
- Guide is read-only with no auth — fine for trust, BUT anyone with the guide link can also click "Open the editable workspace" and edit the team standard. That undermines "read-only reference"; a real team wants view-only to NOT expose edit.
- No CLI-speed single-link fast path (paste + keyboard-only + instant copy). Power users want one.

TO GET TO 9-10
- A genuinely fast single-link mode (paste base URL + 3 values, keyboard-only, instant copy) so I'd reach for it over hand-editing every time.
- Separate view-only sharing from edit access — the one-click "Open editable workspace" button contradicts "read-only reference."
- Collapse the three share buttons into one share menu with plain labels; the trio reads as feature-creep.

It works and I'd recommend it to a teammate who tags links weekly. I wouldn't bring it up unprompted because my use is occasional — which is exactly why it's an 8, not a 9.
