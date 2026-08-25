# Issue 15 Addendum 11 Aug 2026-c (100th check)

Tue 11 Aug 2026 UTC. No change since 99th check.

## Current State (DB confirmed this run)

- Booking 18151 (Saikhantes Shagdarsuren, student 1001): CONFIRMED, EUR 1,339.20 paid, EUR 0 open
- service_end = 2026-08-07 -- 4 days expired (should be 2026-10-02 to match BC 24925)
- Booking Course 24925 (Academic Year Afternoon): active, ends 2 Oct 2026
- Student Class Assignment 255: class 11 (B1 PM), weekEnd = 2026-07-03 -- 39 days ago, no current assignment
- Payment 17872 (EUR 1,339.20, 8 Jun 2026): xeroPaymentId = null -- unreconciled in Xero

## Impact

- service_end in the past may block functions gated on that field
- SCA 255 expired 39 days ago -- 39+ school days attendance unrecorded
- Payment 17872 not in Xero -- financial records incomplete

## Fix Recipe (NOT YET RUN)

Step 1 -- Correct service_end on booking 18151:
  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151; -- NOT YET RUN

Step 2 -- Extend SCA 255 (or create new):
  Option A (extend existing):
  UPDATE student_class_assignments SET week_end = '2026-10-02' WHERE id = 255; -- NOT YET RUN

  Option B (create fresh SCA from week of Jul 6):
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (24925, 11, '2026-07-06', '2026-10-02'); -- NOT YET RUN

Step 3 -- Reconcile payment 17872 in Xero:
  Amount: EUR 1,339.20, bank receipt, date: 8 Jun 2026. Match to invoice in Xero.

## Risk / Category
- Category: bookings / attendance / accounts
- Reversible: yes
- Blast radius: single student; 39 unrecorded school days; 1 unreconciled payment

Status: Open. Fix NOT YET RUN.
Last checked: Tue 11 Aug 2026 UTC (100th check)