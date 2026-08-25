Issue 38 -- Stale BC 25043 (186th check, Tue 18 Aug 2026 UTC)
Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

Symptom: BC 25043 (General English PM) active 4 days past its end date.

Root cause (verified)
- Student Eduardo Roche Diaz (id 14602), Booking 18265: CONFIRMED
- Booking Course 25043: startDate 2026-08-10, endDate 2026-08-14, active = true
- Today 2026-08-18 -- 4 days past end date, still active
- 0 student class assignments on this booking course; safe to deactivate

Fix recipe (NOT YET RUN)
Step 1: Confirm then deactivate BC 25043
  SELECT id, active, start_date, end_date FROM booking_courses WHERE id = 25043;
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 25043;

Risk: bookings data-hygiene | Reversible | 1 record, 0 SCAs

Status: OPEN -- Fix NOT RUN | Last checked: Tue 18 Aug 2026 UTC (186th check)