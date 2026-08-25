# Issue 32 — Phantom Row (addendum 13 Aug 2026)

**Sheet row:** 33 | **Check:** 11th Thu 13 Aug 2026 UTC

## Symptom
Row 33 has no student name or issue description — only value 278 in column F (Veronica Martin student ID).

## Root cause (unchanged)
Sheet admin artifact. Veronica Martin accommodation resolved in Issue 37 (row 39). No DB record involved.

## Fix recipe (NOT YET RUN)
Manually delete row 33 in Google Sheets ISSUE LOG tab. No DB change required.

## Risk / category
- Category: data-hygiene (sheet only)
- Reversible: yes (Sheets version history)
- Blast radius: none

## Status
Unchanged — ~125 days. Awaiting Neil to delete row manually.

**Last checked:** 2026-08-13 UTC