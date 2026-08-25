# Issue (row 39) — Phantom / Stray Cell

Reporter: unknown  Area: unknown  Sheet row: 39  Last checked: 2026-06-16 UTC

Symptom: Row 39 of the ISSUE LOG sheet contains only 278 in column F (Area). All other columns (issue number, student, description) are empty.

Root cause:
- Cannot diagnose: no student name, no issue description, no deal or SIS reference
- 278 in column F could be an invoice number, student ID, booking ID, or accidental key press
- Most likely accidental typing

Fix recipe (NOT YET RUN):
Option A: If accidental, delete row 39 from the sheet.
Option B: If real issue, fill in all required columns (A=issue, B=student, F=area, G=issue description) so it can be diagnosed.

Risk: Data-hygiene. Low risk. Reversible.

Status: Phantom row flagged. Neil must decide.
Last checked: 2026-06-16 UTC hrly(Tue).
Last checked: 2026-06-18 UTC hrly: phantom row still present — F=278 only, no other content (38d total). Neil must decide.
Last checked: 2026-06-19 UTC hrly9: phantom row STILL PRESENT — F=278 only, all other fields empty (39 days total, first seen ~May11). NEIL: delete row 39 or fill in issue#, student, description.

**Jun19 this run (interactive session):** Phantom row still present — F=278 only, all other fields empty. No data to diagnose. Hashes match; re-triggers due to empty issue-number key mismatch in seen.json. Action remains with Neil (delete or fill row 39).


**Jun20 SAT hrly — Phantom row STILL PRESENT. F=278 only, all other fields empty (40+ days since ~May11). No new data. NEIL: delete row 39 or fill in issue number, student name, and description. Last checked: 2026-06-20 UTC hrly.**

**Jun22 hrly — Phantom row STILL PRESENT. F=278 only, all other fields empty (41+ days since ~May11). No new data. NEIL: delete row 39 or fill in issue number, student name, and description. Last checked: 2026-06-22 UTC hrly.**
**2026-07-08 UTC — Phantom STILL PRESENT. Now 88+ days old (est. since ~May 11 2026). Current sheet row is 33 (not 39 — rows have shifted). Student 278 = Veronica Martin; her accomm issue was resolved in Issue 37 row 39. This phantom is unrelated. NEIL: delete row 33 in the current sheet.**
