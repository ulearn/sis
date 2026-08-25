# Issue 15 — Saikhantes Shagdarsuren: URGENT Booking Expiry (35th check Wed 5 Aug 2026 UTC)
Reporter: AC | Area: booking/class | Sheet row: 16

URGENT: Booking 18151 service end = Fri 7 Aug 2026 — expires in 2 days.

Symptom: Student on holiday until Aug 21; booking expires Aug 7 (during holiday); BC runs to Oct 2.

Root Cause (verified 2026-08-05 UTC, 35th check)

Student 1001 (Saikhantes Shagdarsuren)

Current year — Booking 18151 (CONFIRMED, fully paid EUR 1,339.20):
- Service: 2026-01-12 to 2026-08-07 (Fri) — EXPIRES THIS FRIDAY
- Booking course 24925 (Academic Year Afternoon, 2026-03-09 to 2026-10-02): active, 25 weeks + 5-week holiday push
- Last SCA: id 255, weekStart 2026-01-12, weekEnd 2026-07-03 (legacy bulk SCA from Fidelo migration)

Holiday record:
- Holiday 2500 on booking 18151: 2026-07-20 to 2026-08-21 (5 weeks), pushed BC 24925 end by 25 weekdays
- Student expected to return Mon 2026-08-24

ANOMALY — Holiday extended BC 24925 endDate to Oct 2 but did NOT update booking 18151 serviceEnd (still Aug 7).
Gap: booking expires Aug 7; student returns Aug 24 — 17 days after booking expires.

Prior year — Booking 1724:
- Booking course 1982 (Academic Year Morning, 2025-06-30 to 2025-12-19): active — 228 days stale, 0 SCAs

Fix Recipe (NOT YET RUN):

Step 1 — Extend booking 18151 serviceEnd to match BC 24925 [DO BEFORE FRI 7 AUG]:
  UPDATE booking SET service_end = '2026-10-02', updated_at = NOW() WHERE id = 18151;
  OR via SIS admin > Booking 18151 > Edit > Service End = 2 Oct 2026

Step 2 — Add class assignment to BC 24925 for first week back (after Neil confirms class):
  SIS admin > Student 1001 > Booking 18151 > BC 24925 > Add class assignment
  weekEnd = 2026-08-28 (first full week Mon 24 Aug)

Step 3 — Deactivate prior-year BC 1982:
  UPDATE booking_course SET active = false, updated_at = NOW() WHERE id = 1982;

Risk: bookings/classes | Reversible: yes | Blast radius: 1 student
Status: NOT YET RUN | Last checked: 2026-08-05 UTC (35th check) | Deadline: Fri 7 Aug
See also: issue-15-addendum-5aug-b.md
