# Issue 15 — Saikhantes Shagdarsuren Class Assignment (34th check Wed 5 Aug 2026 UTC)
Reporter: AC | Area: booking/class | Sheet row: 16

Symptom: Holiday gap leaves class assignment stale; prior-year booking course still active.

Root Cause (verified 2026-08-05 UTC, 34th check):
Unchanged. Student 1001 (Saikhantes Shagdarsuren) on holiday.

Booking 18151 (current):
- BC 24925 (Academic Year Afternoon, 2026-03-09 to 2026-10-02): active = true
  - Last SCA: 255, class 11, weekEnd 2026-07-03 — 33 days stale
  - Holiday: 2026-07-20 to 2026-08-21; returns Monday 2026-08-24 (19 days)
  - New SCA needed: weekEnd 2026-08-28 (first full week back)

Booking 1724 (prior year):
- BC 1982 (Academic Year Morning, ends 2025-12-19): active = true — 228 days stale

Fix Recipe (NOT YET RUN):
Step 1: SIS admin > Student 1001 > Booking 18151 > BC 24925
  Add class assignment: Class 11 (B1 PM), weekEnd = 2026-08-28

Step 2:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 1982;

Risk: bookings/classes | Reversible: yes | Blast radius: 1 student
Status: NOT YET RUN | Last checked: 2026-08-05 UTC (34th check) | Returns: 2026-08-24
See also: issue-15-addendum-5aug.md