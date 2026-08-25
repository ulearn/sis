Issue 41 - Giampaolo Russo Accommodation Restructured (75th check)
Reporter: Diego | Area: Booking/Accomm | Sheet row 43 | Fri 14 Aug 2026 UTC

Root cause - UPDATED (accommodation restructured today 2026-08-14)
BA 11357 (host family bed 178): Aug 2-Aug 15 fee=EUR 1250 - end date shortened from Sep 6 to Aug 15 today
BA 11396 (NEW bed 44): Aug 15-22 fee=null MISSING FEE created 2026-08-14
BA 11397 (NEW bed 89): Aug 22-Sep 6 fee=null MISSING FEE created 2026-08-14
BA 11392 (apartment bed=null): Sep 6-Sep 14 fee=EUR 415 still no bed (Sep 6 = 23 days)

Bed conflicts:
- Bed 44 (Aug 15-22): clear no conflicts
- Bed 89 (Aug 22-Sep 6): BA 11387 (Vincenzo Gagliano booking 18175) ends Aug 22 same-day checkout/checkin verify housekeeping
- Beds 168 and 194: clear for Sep 6-14

Fix recipe (NOT YET RUN)
1. Confirm fees with Diego then set: UPDATE booking_accommodation SET fee=[X] updatedAt=NOW() WHERE id IN (11396 11397);
2. Assign bed to BA 11392: UPDATE booking_accommodation SET "bedId"=[168 or 194] "updatedAt"=NOW() WHERE id=11392;
3. Verify Aug 22 bed 89 turnaround - confirm Vincenzo checks out and housekeeping can turn room same day.

Risk: bookings+money | Reversible | Blast radius: 3 BAs
Open - fix NOT RUN. Sep 6 check-in 23 days.
Last checked: 2026-08-14 UTC (75th check)