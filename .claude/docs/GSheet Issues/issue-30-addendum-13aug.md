# Issue 30 — Giulia Avallone / Milena Vinci (addendum 13 Aug 2026)

**Reporter:** PG | **Area:** booking | **Sheet row:** 31 | **Check:** 126th Thu 13 Aug 2026 UTC

## Symptom
Giulia Avallone mother Milena Vinci listed as a student in SIS (junior student, parent created as student).

## Root cause (unchanged)
- Booking Course 104 (Morning General Plus, bk 94): ended 2026-06-26 — 48 days stale, active = true, 1 class assignment
- Booking 94 (Giulia Avallone): CONFIRMED, confirmed = true, EUR 1,151.50 fully paid
- Payment 17102: EUR 1,151.50, bk 94, 2026-03-13 — xeroPaymentId = null (153 days unreconciled)
- Payment 945: EUR 4,231, bk 79 (Milena Vinci), 2026-01-30 — xeroPaymentId = null (195 days unreconciled)

## Fix recipe (NOT YET RUN)

### Step 1 — Verify BC 104 SCA is historical
SELECT sca.id, co.date FROM StudentClassAssignment sca JOIN ClassOccurrence co ON co.id = sca.classOccurrenceId WHERE sca.bookingCourseId = 104;
If occurrence date < 2026-06-26 then safe to deactivate.

### Step 2 — Deactivate BC 104
UPDATE BookingCourse SET active = false, updatedAt = NOW() WHERE id = 104;

### Step 3 — Reconcile payments 17102 + 945 in Xero

## Risk / category
- Category: bookings / financial
- Reversible: yes
- Blast radius: medium — EUR 5,382.50 unreconciled (195-day max lag)

## Status
Unchanged — BC 104 48d stale, 1 SCA, Xero 153d + 195d. Fix NOT RUN.

**Last checked:** 2026-08-13 UTC