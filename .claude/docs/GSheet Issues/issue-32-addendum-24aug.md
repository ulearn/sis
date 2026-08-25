# Issue 32 — Phantom sheet row

**Area:** Sheet admin  **Sheet row:** 33

## Symptom
Row 33 in the ISSUE LOG sheet contains only the value "278" in column F (Area) and nothing else.

## Root cause (19th check Mon 24 Aug 2026 UTC)
Column F value "278" is Verónica Martín's student ID, accidentally entered in the wrong row/column when adding the accommodation issue that became Issue 37 (row 39).
Issue 37 covers Verónica Martín's Booking Accommodation 11352 (bed 83, ended 11 Jul 2026). This phantom row has no corresponding SIS issue.

## Fix recipe (NOT YET RUN)

Neil: manually delete row 33 from the ISSUE LOG Google Sheet.
No SIS database action required.

## Risk
Sheet admin only — reversible (Google Sheets has version history).

## Status: Open — delete NOT RUN
**Last checked:** 19th check Mon 24 Aug 2026 UTC (no change since 18th Thu 20 Aug)