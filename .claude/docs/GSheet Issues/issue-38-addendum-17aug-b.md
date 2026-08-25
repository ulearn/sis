Issue 38 -- BC 25043 stale (180th check, 17 Aug 2026 UTC)
Reporter: PG | Area: Holidays/Bookings | Sheet row: 40

Symptom
Course end dates require manual entry; UX improvement proposed.

Root cause (evidence)
- Booking Course 25043 (General English PM, Eduardo Roche Diaz, student 14602): active = true
- Start: 2026-08-10, End: 2026-08-14 -- ended 3 days ago
- Zero class assignments -- safe to deactivate
- Booking 18265: CONFIRMED
- Stale active Booking Courses total: 24,497 (unchanged)

Fix recipe (NOT YET RUN)

Step 1 -- Deactivate BC 25043 (NOT here):
  UPDATE BookingCourse SET active = false WHERE id = 25043;

Step 2 -- Verify:
  SELECT id,active,startDate,endDate FROM BookingCourse WHERE id = 25043;

Risk / Category
Data hygiene | Reversible | Blast radius: 1 booking course, 0 class assignments

Status
OPEN -- fix NOT RUN. BC 25043 ended Aug 14 (3d ago), still active, 0 SCAs.
Last checked: 2026-08-17 UTC (180th check)