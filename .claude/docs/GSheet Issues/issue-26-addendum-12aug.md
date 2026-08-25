# Issue 26 — Ivan Rodriguez Solares: Stale BCs + Open Balance + Xero Lag (62nd check, Wed 12 Aug 2026 UTC)
Reporter: PG | Area: Booking / Class | Sheet row: 27

## Status
Unchanged from 61st check (Tue 11 Aug 2026).

## Root Cause
Symptom: Intensive students only appear once in to-be-assigned list.
- Booking Course 23 (Intensive General 30, booking 22): ended 2026-05-22 — 82 days stale, active = true, 2 class assignments (ids 122, 376)
- Booking Course 24826 (2 weeks Intensive General 30, booking 18034): ended 2026-06-19 — 54 days stale, active = true, 0 class assignments
- Booking 22 (student 18, Ivan Rodriguez Solares): CONFIRMED, confirmed = true, EUR 1,948 fully paid
- Booking 18034: PARTIAL, confirmed = false, EUR 845 paid, EUR 250 open, EUR 1,095 total
- Payment 17023: EUR 1,698, booking 22, 14 Feb 2026 — xeroPaymentId = null (179 days unreconciled)
- Payment 17237: EUR 250, booking 22, 1 Oct 2025 — xeroPaymentId = null (315 days unreconciled)
- Payment 17683: EUR 845, booking 18034, 23 Apr 2026 — xeroPaymentId = null (111 days unreconciled)

## Fix Recipe (NOT YET RUN)
Step 1 — Deactivate stale Booking Courses:
  UPDATE booking_course SET active = false WHERE id IN (23, 24826);

Step 2 — Chase EUR 250 open balance on booking 18034:
  Verify in HubSpot / Xero whether the EUR 250 was paid or should be written off.
  If paid: add payment and set booking 18034 confirmed = true.

Step 3 — Reconcile payments in Xero via Hub fins/:
  Payment 17023: EUR 1,698, booking 22, transactionId D2025452
  Payment 17237: EUR 250, booking 22, transactionId D2025452
  Payment 17683: EUR 845, booking 18034

## Risk / Category
Data-hygiene + money. Reversible. Blast radius: 2 bookings, 2 Booking Courses, 3 payments. Medium urgency (315d Xero lag on payment 17237).

## Status: Open — fix NOT RUN.
## Last checked: 2026-08-12 UTC