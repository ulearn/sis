Issue 32 Phantom Row (278) in ISSUE LOG
Reporter: (sheet artefact) | Area: 278 | Sheet row: 33
Last checked: 10 Aug 2026 UTC (8th hourly check)

Symptom
Row 33 of the ISSUE LOG sheet contains only the value 278 in column F (Veronica Martin student ID). Otherwise empty. Not a real issue.

Root Cause
Phantom sheet row - likely a stray entry from when Veronica Martin accommodation issue (Issue 37, row 39) was being logged. No DB record involved.

Current State (10 Aug 2026)
- Row 33 still present, unchanged (approx 122 days since April 2026)
- Veronica Martin underlying accommodation issue resolved separately (Issue 37)
- No action required in SIS or DB

Fix Recipe - NOT YET RUN
Neil: manually delete row 33 in Google Sheets (SIS Cleanup -> ISSUE LOG tab -> right-click row 33 -> Delete row). Nothing else required.

Risk: Data-hygiene (sheet only). Fully reversible. Zero blast radius.
Status: Open (awaiting manual row deletion by Neil)
Last checked: 10 Aug 2026 UTC