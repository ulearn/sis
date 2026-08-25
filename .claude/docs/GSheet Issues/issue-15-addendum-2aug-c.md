# Issue 15 -- Saikhantes Shagdarsuren (addendum 2 Aug c)

Reporter: AC  Area: Booking/Class  Sheet row: 16

## Symptom
Course dates / holidays confusing (two courses, one membership). Returns from holiday Mon 24 Aug.
No class assignment exists after Jul 3. Stale legacy BC still active.

## Root cause (14th check Sun 2 Aug 2026 UTC)

- BK 18151: CONFIRMED, confirmed=true, amtPaid=1339.20, amtOpen=0.
- BC 24925 (AY Afternoon, Mar 9 - Oct 2 2026): active=true.
  Last SCA: id 255, class 11, weekStart=Jan 12, weekEnd=Jul 3 2026 (30 days ago).
  HOL 2500: Jul 20 - Aug 21 2026 -- student returns Mon Aug 24 (22 days remaining).
- BC 1982 (AY Morning, Jun 30 - Dec 19 2025): active=true -- 226 days stale.
  BK 1724: amtOpen=null (anomaly -- should be 0 if paid).

## Fix recipe (NOT YET RUN)

Step 1 -- Create SCA on BC 24925:
  In SIS admin: Booking 18151 -> Course 24925 -> Class Assignments -> Add
  Class: 11 (same as last SCA 255)
  Week start: 2026-08-24 (Mon, return from holiday)
  Week end: 2026-10-02 (BC end date)

Step 2 -- Deactivate BC 1982:
  UPDATE booking_courses SET active = false WHERE id = 1982;

Step 3 (optional) -- Investigate BK 1724 amtOpen=null:
  SELECT amount_paid, amount_open FROM bookings WHERE id = 1724;
  If student is fully paid, set amount_open = 0.

## Risk
Category: bookings. Reversible: yes. SCA needed by Aug 24 (22 days).

## Status
OPEN. Fix NOT RUN. Last checked: Sun 2 Aug 2026 UTC (14th check)