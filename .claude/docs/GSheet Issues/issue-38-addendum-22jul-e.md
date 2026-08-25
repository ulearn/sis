# Issue 38 Addendum 22 Jul 2026 e

Reporter: various | Area: Holidays/Bookings | Sheet row: 40
Last checked: Wed 22 Jul 2026 UTC (44th hourly, 117th total)

## Root Cause
School closures table: 9 records (Good Fridays 2026-2030 + Christmas 2026-2029). Zero bank holidays.

Missing:
- August Bank Holiday Mon 3 Aug 2026 --- 12 days away --- URGENT
- October Bank Holiday Mon 26 Oct 2026

Impact: approx 202 booking courses affected by Aug BH; approx 114 by Oct BH.
Confirmed via fresh DB query Wed 22 Jul 2026 UTC. UNCHANGED.

## Fix Recipe (NOT YET RUN)
Step 1: Add Aug BH + Oct BH to school_closure table via SIS admin or SQL (NOT YET RUN).
Step 2: Trigger shunt for approx 202 affected booking courses.
Step 3: Verify sample of affected courses for correct end date extension.

SQL pattern (NOT YET RUN):
  INSERT INTO school_closure (name, start_date, end_date, is_paid_holiday)
  VALUES (Aug Bank Holiday, 2026-08-03, 2026-08-03, true),
         (Oct Bank Holiday, 2026-10-26, 2026-10-26, true);

## Risk
Category: bookings, holidays. Reversible: Yes. Blast radius: ~202 BCs (Aug), ~114 (Oct).
Urgency: CRITICAL - Aug BH 12 days away.

## Status
Open. Fix NOT RUN. Last checked: Wed 22 Jul 2026 UTC