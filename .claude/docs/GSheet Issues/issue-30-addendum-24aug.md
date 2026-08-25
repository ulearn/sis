# Issue 30 - Giulia Avallone / Milena Vinci
Reporter: AC | Area: Booking | Sheet row 31 | 138th check Mon 24 Aug 2026 UTC

## Root Cause (verified from live DB, 24 Aug 2026)
Stale Booking Courses:
- BC 104 (Morning General Plus, bk 94): ended 26 Jun 2026 - 59 days stale, active = true
- BC 83 (Afternoon General Plus, bk 79): ended 8 May 2026 - 107 days stale, active = true
- BC 82 (Intensive General 30, bk 79): ended 6 Mar 2026 - 171 days stale, active = true

Unreconciled Payments:
- Payment 17102: EUR 1,151.50, Bank Transfer, 13 Mar 2026, bk 94, xero_payment_id = null (164 days)
- Payment 945: EUR 4,231, Bank Transfer, 30 Jan 2026, bk 79, xero_payment_id = null (206 days)

Milena Vinci: not found in students table under those names.

## Fix Recipe (NOT YET RUN)
Step 1 - Check class assignments: SELECT * FROM student_class_assignments WHERE booking_course_id IN (82, 83, 104);
Step 2 - Deactivate: UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id IN (82, 83, 104);
Step 3 - Reconcile in Xero then update xero_payment_id on payments 17102 and 945.
Step 4 - Search SIS admin for Milena Vinci alternate spellings.

## Risk
Category: Bookings / data-hygiene / money. Reversible. Blast radius: bookings 94 and 79.

## Status
Fix NOT RUN. Last checked: 2026-08-24 UTC (138th hourly run).