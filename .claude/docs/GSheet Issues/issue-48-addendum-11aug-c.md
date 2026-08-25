# Issue 48 Addendum 11 Aug 2026-c (94th check)

Tue 11 Aug 2026 UTC. No change since 93rd.

## Current State

- BC 1810 (Academic Year Renewal Morning, Telmuun Enkhsaikhan, student 293): ends 1 Jan 2027, 0 SCAs -- 45 days
- Booking 1624: PARTIAL, confirmed = false, EUR 1,406 paid, EUR 250 open, EUR 1,656 total
- Payments on booking 1624: only Payment 17956 (EUR 100, 31 Mar 2026, xeroPaymentId = null)
  - amountPaid = 1,406 but only EUR 100 payment linked -- EUR 1,306 gap is Fidelo migration artefact
- Student was in class 11 (B1 PM) on previous booking 1466; now switched to morning renewal
- Stale legacy BCs still active: 482, 483, 1609, 1610, 1611, 1612 (ended Mar 2025-May 2026)

## Fix (NOT YET RUN)

1. Assign BC 1810 to a MORNING class matching Telmuun level (was B1 level on PM -- suggest B1 AM or equivalent)
   SIS admin: student 293 -> BC 1810 -> assign class, weekStart 2026-06-29
2. Deactivate stale BCs:
   UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id IN (482,483,1609,1610,1611,1612);
3. EUR 250 open -- confirm whether to request payment or write off as Fidelo closure
4. EUR 1,306 Fidelo gap in amountPaid vs payments -- requires Neil to review historical Fidelo records

Risk: bookings + data-hygiene. Reversible. Blast: low.
Status: Open. 45 days unassigned. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (94th check)