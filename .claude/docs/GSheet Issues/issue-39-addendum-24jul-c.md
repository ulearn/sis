Issue 39 — Xuezhen Huang (BC24609) — Addendum 24 Jul 2026 C

Reporter: AC | Area: Booking / Accomm | Sheet row: 41

Symptom
Student has no class assigned to booking course 24609. Course ends Fri 31 Jul 2026.

Root cause
BC 24609 (Morning General, 13 Jul – 31 Jul 2026) has zero class assignments. Student 14443 (Xuezhen Huang) has been enrolled for 10 school days with no class. BA 11357 (bed 180) correctly assigned. No DB changes since last check.

Evidence (72nd hourly check, 150th total — Fri 24 Jul 2026 UTC):
- BC 24609: active = true, endDate = 2026-07-31, classAssignments = 0 — UNCHANGED
- Booking 17831: confirmed = true, fully paid EUR 1,396.90
- Student 14443 (Xuezhen Huang)
- BA 11357: bed 180, 12 Jul – 2 Aug 2026, active = true, fee = EUR 900

CRITICAL — WINDOW CLOSING:
- Today (Fri 24 Jul) is the last business day before the weekend
- School days missed: Mon 13 Jul – Fri 24 Jul = 10 school days
- School days remaining: Mon 27 Jul – Fri 31 Jul = 5 school days

Fix recipe — NOT YET RUN

Step 1: Assign BC 24609 to a Morning General class
Via SIS admin:
1. Admin → Students → search Xuezhen Huang (student 14443)
2. Open Booking 17831 → Booking Course 24609 (Morning General, ends 31 Jul)
3. Click Assign Class → select available Morning General class for week 27–31 Jul
4. Save

Step 2: Confirm
Verify classAssignments count > 0 on BC 24609 after assignment.

Risk / Category
- Category: Bookings — class assignment
- Reversible: Yes
- Blast radius: Single student, 5-day course window
- Urgency: CRITICAL — course ends Fri 31 Jul; 5 school days remain from Mon 27 Jul

Status: NOT YET RUN.
Last checked: Fri 24 Jul 2026 UTC (72nd issue check, 150th total hourly run)