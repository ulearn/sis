Issue 22 — Edite Nunes (BC24991) — Addendum 24 Jul 2026 C
Reporter: AC | Area: Booking / Class | Sheet row: 23

Symptom
BC 24991 (General English AM, 13 Jul – 7 Aug 2026) still has zero class assignments.

Root cause (70th hourly check, 150th total — Fri 24 Jul 2026 UTC):
- BC 24991: active = true, endDate = 2026-08-07, classAssignments = 0 — UNCHANGED
- Booking 18214: confirmed = true, student 1015 (Edith Nunes)
- School days missed: Mon 13 Jul – Fri 24 Jul = 10 school days
- School days remaining: ~9–10 (Mon 27 Jul – Fri 7 Aug)
  Note: system counts Mon 3 Aug as school day (Aug BH not in school_closures — Issue 38)
  If Aug BH added (Issue 38 fixed): 9 school days; course may extend to Mon 10 Aug

Fix recipe — NOT YET RUN

Step 1: Assign BC 24991 to General English AM class
Via SIS admin:
1. Admin → Students → search Edite/Edith Nunes (student 1015)
2. Open Booking 18214 → Booking Course 24991 (General English AM, ends 7 Aug)
3. Click Assign Class → select available General English AM class
4. Save

Step 2 (advisory): Fix Issue 38 first
Add Aug Bank Holiday (3 Aug 2026) to school_closures before assigning, so the system
correctly extends course end dates and excludes 3 Aug from attendance.

Risk / Category
- Category: Bookings — class assignment
- Reversible: Yes
- Blast radius: Single student, ongoing course (ends 7 Aug)
- Urgency: CRITICAL — 10 school days missed, ~9 remaining

Status: NOT YET RUN.
Last checked: Fri 24 Jul 2026 UTC (70th issue check, 150th total hourly run)