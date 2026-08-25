# Issue 15 — Saikhantes Shagdarsuren: URGENT Booking Service End Expiry (36th Check)
Reporter: AC | Area: booking/class | Sheet row: 16 | 36th check Wed 5 Aug 2026 UTC

## Symptom
Booking 18151 service_end = 2026-08-07 (Friday, 2 days). Student on holiday until 21 Aug; course extends to 2 Oct. service_end was never updated to match.

## Root Cause (verified live DB, 36th check)
Student 1001 (Saikhantes Shagdarsuren):
- Booking 18151: CONFIRMED, confirmed=true, EUR 1,339.20 paid / EUR 0 open
- service_start=2026-01-12, service_end=2026-08-07 (EXPIRES FRIDAY)
- Booking Course 24925 (Academic Year Afternoon): 2026-03-09 to 2026-10-02, active=true, 1 SCA
- Holiday 2500: 2026-07-20 to 2026-08-21 (5 weeks), pushed BC end to Oct 2
- Student returns Mon 2026-08-24 — 17 days after service_end
ANOMALY: Holiday shunt extended BC 24925 to Oct 2 but did NOT update booking 18151.service_end.
Payment 17872: EUR 1,339.20, 2025-12-19, xero_payment_id=null (unreconciled)
Prior year BC 1982 (Academic Year Morning, ended 2025-12-19): active=true, 228 days stale, 0 SCAs

## Fix Recipe (NOT YET RUN)
Step 1 — BEFORE FRI 7 AUG: UPDATE bookings SET service_end='2026-10-02', updated_at=NOW() WHERE id=18151;
Step 2 — Assign BC 24925 for return week Mon 24 Aug via SIS admin (after Neil confirms class).
Step 3 — UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=1982;
Step 4 — Reconcile payment 17872 in Xero (EUR 1,339.20, 2025-12-19).

## Risk
Category: Bookings/admin | Severity: URGENT — service_end expires Fri 7 Aug | Reversible: Yes | Blast radius: 1 student
Deadline: Fri 7 Aug 2026 (step 1 only)

## Status
PENDING — NOT YET RUN | Last checked: Wed 5 Aug 2026 UTC (36th check) | See also: issue-15-addendum-5aug-c.md