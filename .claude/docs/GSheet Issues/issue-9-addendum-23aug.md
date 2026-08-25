# Issue 9 Addendum — Suvderdene Bayartsog (student 947)
Reporter: AC | Area: Doc Gen / Certs | Sheet row 10

## Status — 74th check, Sun 23 Aug 2026 UTC

No change from 73rd (Sat 22 Aug).

## Root cause

- Document 171 (booking 1498, template 82 Certificate of Completion): DRAFT v1, created 2026-06-05 — 79 days unissued
- Booking 1498: CONFIRMED, confirmed = false, amountPaid = null — zero payments on record
- Booking Course 1660 (ULearn Renewal Morning): ended 2026-06-05 — 79 days stale, active = true, 0 class assignments

## Fix recipe — NOT YET RUN

1. Confirm payment: SELECT * FROM Payment WHERE bookingId = 1498; (expect empty)
2. If paid: UPDATE Booking SET confirmed = true WHERE id = 1498;
3. Delete draft 171 and regenerate cert via SIS admin UI.
4. Deactivate BC 1660 (0 SCAs safe): UPDATE BookingCourse SET active = false WHERE id = 1660;

## Risk
Category: documents/bookings | Reversible: yes | Blast radius: 1 student, 1 doc, 1 booking flag, 1 BC

## Status
Fix NOT RUN. Confirm payment status before acting.
Last checked: 2026-08-23 UTC (74th check)