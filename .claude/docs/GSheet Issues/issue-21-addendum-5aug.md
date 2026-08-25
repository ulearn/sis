Issue 21 — Maurivan Kuhl: Stale Booking Course 1604
13th check Wed 5 Aug 2026 UTC
Reporter: pg | Area: Booking/Class | Sheet row: 22

Symptom
Student appears in two class groups due to stale booking course 1604 (ended Jul 3 2026).

Root Cause (verified 2026-08-05, 13th check — UNCHANGED)
- Booking course 1604 (Morning General, booking 1461, student 912 Maurivan Kuhl): active = true — 33 days stale (ended Jul 3 2026).
- Booking 1461: CONFIRMED, confirmed = true, EUR 1,509.60 paid, fully settled.

Fix Recipe (NOT YET RUN)

Step 1 — Deactivate stale booking course:
  UPDATE "BookingCourse" SET active = false, updated_at = NOW() WHERE id = 1604;

Step 2 — Verify:
  SELECT id, active, end_date FROM "BookingCourse" WHERE id = 1604;

Risk / Category
bookings | Reversible: yes | Student 912 only

Status: NOT YET RUN | Last checked: 2026-08-05 UTC (13th check)
BC 1604 stale 33 days.