# Issue 15 Addendum 11 Aug 2026-b (98th check)

Tue 11 Aug 2026 UTC. No change since 97th.

## Current State

- Booking 18151 (Saikhantes, student 1001): CONFIRMED, EUR 1,339.20 paid, EUR 0 open
- service_end = 2026-08-07 -- 4 days expired (should be 2026-10-02, matching BC 24925)
- BC 24925 (AY Afternoon): active, ends 2 Oct 2026
- SCA 255: class 11 (B1 PM), weekEnd = 3 Jul 2026 -- 39 days ago, no current SCA
- Payment 17872 (EUR 1,339.20, 8 Jun 2026): xeroPaymentId = null

## Fix (NOT YET RUN)

1. Correct service_end: UPDATE Booking SET service_end=2026-10-02 WHERE id=18151;
2. Extend SCA: UPDATE student_class_assignments SET week_end=2026-10-02 WHERE id=255;
   (or create new SCA: class 11, weekStart 2026-07-06, weekEnd 2026-10-02)
3. Reconcile payment 17872 in Xero: EUR 1,339.20, bank, 8 Jun 2026

Risk: bookings/attendance. Reversible. 39 days unrecorded.
Status: Open. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (98th check)