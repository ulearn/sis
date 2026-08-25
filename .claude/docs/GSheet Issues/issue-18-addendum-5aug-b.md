# Issue 18 — Flavia Nascimento Mariano Visa Status (8th check Wed 5 Aug 2026 UTC)
Reporter: AC | Area: Visa | Sheet row: 19

Symptom: Student shows visa pending, preventing display in class-assignment view.

Root Cause (verified 2026-08-05 UTC, 8th check) — unchanged since 7th check:
- Student 983 (Flavia Nascimento Mariano): visa_status = null, last DB update 2026-07-28
- Booking 1534: CONFIRMED, confirmed = true, service 2026-06-01 to 2026-11-20
- Booking course 1710 (Academic Year Afternoon, Jun 1 to Nov 20 2026): active = true
- SCAs: id 256 (weekEnd 2026-06-14) + id 265 (weekEnd 2026-11-20, terminal)
- Student actively in class — visa null is data quality only

Fix Recipe (NOT YET RUN):
Option A (UI): SIS admin > Student 983 > Edit > Visa Status = Approved > Save
Option B (SQL fallback): UPDATE student SET visa_status = 'Approved', updated_at = NOW() WHERE id = 983;

Risk: data-hygiene/visa | Reversible: yes | Blast radius: 1 student
Status: NOT YET RUN (low priority) | Last checked: 2026-08-05 UTC (8th check)
See also: issue-18-addendum-5aug.md
