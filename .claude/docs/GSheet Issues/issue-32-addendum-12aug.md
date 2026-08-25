# Issue 32 — Phantom Row (10th check, Wed 12 Aug 2026)

**Reporter:** Cron  **Area:** Sheet admin  **Sheet row:** 33

## Symptom
Row 33 in the Google Sheet contains only the value "278" in column F. No issue text, no student, no cause.

## Root cause
- No database record involved — this is a Google Sheets admin issue only
- Column F value "278" appears to be Veronica Martin student ID (legacy entry)
- Veronica Martin accommodation issues tracked in Issue 37 (row 39)
- Unchanged for approximately 124 days

## Fix recipe (NOT YET RUN)

### Step 1 — Delete row 33 in Google Sheets
Open the SIS Cleanup Google Sheet, navigate to row 33, right-click, Delete row.
No database action required.

## Risk / category
- Data-hygiene (sheet only). No DB record. No risk.
- Blast radius: zero — sheet cosmetic only.

## Status
Open — awaiting Neil to delete manually (~124 days).

**Last checked:** 2026-08-12 UTC