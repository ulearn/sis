Issue 38 - BC 25043 Eduardo Roche Diaz (167th check, 14 Aug 2026)

Reporter: PG | Area: Holidays/Bookings | Sheet row: 40

SYMPTOM: Request to restrict course start dates to Mondays/Tuesdays after BH. Ongoing: BC25043 is stale (active past end date).

ROOT CAUSE (DB evidence 14 Aug 2026 ~21:00 UTC):
Booking Course 25043 (Eduardo Roche Diaz, General English PM):
  endDate = 2026-08-14 (today), active = true
  0 class assignments (studentClassAssignment count = 0)
  updatedAt = 2026-08-10
Certificate 566: ISSUED - no blockers for deactivation

FIX RECIPE (NOT YET RUN):

Deactivate BC 25043:
SQL: UPDATE booking_course SET active = false WHERE id = 25043;

Verify after:
SQL: SELECT id, active, end_date FROM booking_course WHERE id = 25043;

RISK: Data hygiene - safe to deactivate (0 SCAs, cert issued). Reversible.

STATUS: Ended today, still active. No change since last check.
Last checked: 2026-08-14 ~21:00 UTC