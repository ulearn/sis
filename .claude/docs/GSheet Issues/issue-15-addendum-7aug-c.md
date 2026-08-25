Issue 15 — Saikhantes Shagdarsuren (service_end expired)
Reporter: PG | Area: booking/class | Sheet row: 16

Status — Fri 7 Aug 2026 UTC (57th check)
Service_end EXPIRED midnight today. Portal LOCKED. Fix NOT RUN.

Symptom
Booking 18151 service_end = 2026-08-07 (today). Student portal locked since midnight UTC.
Course (BC 24925, Academic Year Afternoon) runs to 2 Oct 2026 — service_end 57 days shorter than BC end.

Root Cause (verified this check — no change from previous check)
- Booking 18151 (student 1001, Saikhantes Shagdarsuren): CONFIRMED, confirmed = true, fully paid EUR 1,339.20
- service_end = 2026-08-07T00:00:00.000Z — EXPIRED; student portal locked NOW
- Booking Course 24925 (Academic Year Afternoon, 9 Mar to 2 Oct 2026): active, correct
- Holiday 2500: Jul 20 to Aug 21 2026 — student returns Mon 24 Aug 2026
- Last class assignment (id 255): class 11 (B1 PM), week_end 2026-07-03

Fix Recipe (NOT YET RUN)

Step 1 — Restore portal access (IMMEDIATE):
  UPDATE bookings SET service_end = 2026-10-02, updated_at = NOW() WHERE id = 18151;

Step 2 — Assign class for return from holiday (before Mon 24 Aug):
  In SIS Admin: assign student 1001 to class 11 (B1 PM) for week starting 2026-08-24.

Step 3 — Verify:
  SELECT id, service_end, updated_at FROM bookings WHERE id = 18151;
  SELECT id, class_id, week_start FROM student_class_assignments WHERE student_id = 1001 ORDER BY week_end DESC LIMIT 3;

Risk: booking | reversible | single student | CRITICAL — portal locked NOW
Status: Fix NOT RUN. service_end expired midnight 7 Aug 2026. Last checked: Fri 7 Aug 2026 UTC (57th hourly check).