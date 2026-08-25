Issue 24 - Alberto Squillace (Addendum 26 Jul 2026 E) - Week 2 Starts Tomorrow

Reporter: Various | Area: Booking | Sheet row: 25

Root cause (verified Sun 26 Jul 2026 UTC - run 113)
- BC24686 Morning General Jul 20-Sep 18 2026: active=true, fee=null, 0 class assignments - UNCHANGED
- BC1797 Morning General ended Jun 26 2026: active=still true - 30 days stale
- Week 1 Jul 21-25 missed - 5 school days lost
- Week 2 starts Mon 27 Jul 2026 tomorrow

Fix recipe (NOT YET RUN)

Step 1: Confirm fee for BC24686 with AC/KC, then set:
  UPDATE booking_courses SET fee = <confirmed_amount> WHERE id = 24686;
Step 2: SIS admin > Classes > week beginning Mon 27 Jul 2026 > Morning General > assign Alberto Squillace BC24686.
Step 3: Deactivate stale booking course 1797:
  UPDATE booking_courses SET active = false WHERE id = 1797;

Risk: bookings / class attendance; reversible; URGENT - week 2 starts tomorrow, week 1 lost

Status: UNRESOLVED - fix NOT RUN. 5 days lost (week 1). Last checked: Sun 26 Jul 2026 UTC run 113