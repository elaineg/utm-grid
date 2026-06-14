# Round 1 (re-test) — Tester 4 (Tomás, Ops analyst, Edge on corporate laptop)

I remember this app (last round I was a 9). This round I went straight for the
batch-checker + its CSV report, the thing my job lives on.

## Prior concerns: priorConcernsAddressed = all
My R5/R6 cap (no in-place Rename) was fixed last round and there's still zero
data-carrying network traffic — re-confirmed: NON-GET REQUESTS = [] across a full
build + Launch Check + CSV download session. Safe for company campaign data.

## 1. CLARITY — Yes (<5s)
"Build/clean a whole batch of UTM links in a grid, catch the mistakes before launch,
round-trip to CSV — nothing leaves the browser." H1 + "PRE-LAUNCH QA / Run Launch Check"
spell it out. I'd pitch it to an ops peer in one line.

## 2. VALUE — Yes
Today I do this in Excel: hand-built CONCAT formula + manual eyeballing for casing/space
typos, which always leaks a "LinkedIn" vs "linkedin" that splits GA4. "Run Launch Check"
is the feature I wanted. I fed 3 messy rows; it caught ALL of it: per-field lowercase +
no-spaces flags, a Missing-required on the blank utm_medium, AND two cross-row consistency
warnings ("linkedin" vs "LinkedIn", "june_ops" vs "June Ops" — these will split campaign
data in GA4). My spreadsheet does not catch cross-row inconsistency. That's the win.

## CSV report — well-formed, genuinely Excel-ready
"Download report (CSV)" -> `utm-launch-check.csv`. I read the raw bytes:
- Header: `row #,base URL,field,value,issue type,message` — named, sensible columns.
- One row PER ISSUE (11 rows for 3 grid rows) — correct normalized shape; I can AutoFilter
  on `issue type` (inconsistent/lowercase/no-spaces/required) or pivot by field. Exactly how
  I'd triage.
- RFC-4180 quoting is textbook: messages with commas are quoted, embedded quotes doubled
  (`""june_ops""`). Blank value renders as an empty cell (`,,required`), not "undefined".
  Nothing mangled. This is the part lesser tools burn me on; it's clean here.

## 3. ADVOCACY — 9
Same as last round, now earned on MY core use case, not just rename polish. It does the one
thing I'd switch for (cross-row + casing audit) and exports a CSV I drop into Excel without
cleanup. Strong, specific peer recommend.

### Single biggest thing holding it down (the half-point, honest)
The report CSV has **no UTF-8 BOM**. Messages use an em-dash (—); on Edge/Windows a
double-click open in Excel can guess the wrong codepage and show mojibake, forcing
Data > From Text/CSV. A leading BOM would make double-click "just work" for the exact
Windows-Excel user this tool courts. (LF-only line endings are fine on modern Excel — minor.)
Not a data-mangle, purely an open-experience nit — but it's what sits between 9 and 10 for me.

```json
{"tester": 4, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Report CSV lacks a UTF-8 BOM, so em-dashes in messages can render as mojibake when double-clicked into Excel on Edge/Windows", "Single-purpose tool I reach for 2-4x/month, not an everyone-needs-this daily driver"], "priorConcernsAddressed": "all"}
```
