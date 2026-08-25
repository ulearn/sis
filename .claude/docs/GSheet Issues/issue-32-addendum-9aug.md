# Issue 32 — Phantom sheet row (col F = "278")

Reporter: auto-detected | Area: Sheet admin | Sheet row 33 | 7th check Sun 9 Aug 2026 UTC

## Symptom
Row 33 in ISSUE LOG contains only "278" in column F — not a real issue entry.

## Root cause
- Row 33: only content is "278" in col F — appears to be student ID for Veronica Martin (student 278)
- Veronica Martin accommodation correctly tracked under Issue 37 (row 39)
- Phantom row has persisted ~121 days (since approx Apr 2026)
- No DB record involved — purely a Google Sheet admin issue

## Fix recipe (NOT YET RUN)
In Google Sheets ISSUE LOG tab:
1. Right-click row 33 → Delete row
2. Verify Issue 33 (Shih-Wei Huang) shifts to row 33 — issue# in col A is canonical, not row number

## Risk
Category: data-hygiene (sheet only) | Reversible: yes | Blast radius: cosmetic, zero DB impact

## Status
Pending — phantom row ~121 days. Neil to delete manually in Google Sheets. Fix NOT RUN.
Last checked: Sun 9 Aug 2026 UTC