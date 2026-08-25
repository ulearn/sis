# Issue 24 addendum -- 30th hourly Tue 21 Jul 2026 UTC (107th check)

NEW FINDING: Booking course 24616 (Mia Wehrli) now has class assignment 308 to class 4.
Not present in any previous check. Mia is now assigned; fee is still null on both booking courses.

BC24686 | Alberto Squillace | s1052 | bk1611 | Morning General | 20 Jul-18 Sep 2026
Fee = null. Zero class assignments. Day 2 since start (DB updated 14 May 2026).

BC24616 | Mia Wehrli | bk17842 | General English AM Plus | 20-31 Jul 2026
Fee = null. NEW: class assignment 308 to class 4 confirmed. Day 2 since start. Ends in 8 school days (31 Jul).

BC1797 | Alberto Squillace | bk1611 | Morning General | ended 26 Jun 2026 | active = true (25 days stale)

Fix recipe (NOT YET RUN):
1. Set fee on booking course 24686 (Alberto Squillace, Morning General, booking 1611) -- check HubSpot deal
2. Set fee on booking course 24616 (Mia Wehrli, General English AM Plus, booking 17842)
3. Assign Alberto to a class: SIS > Student 1052 > Booking 1611 > Booking Course 24686 > Assign Class
4. Set active = false on booking course 1797 (ended 26 Jun 2026, 25 days stale)

Risk: booking-course fees / class assignments. Reversible.
Last checked: Tue 21 Jul 2026 UTC (30th hourly, 107th check).