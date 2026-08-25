# Issue 41 -- Giampaolo Russo Accommodation (76th check -- URGENT)
Reporter: Diego | Area: Booking/Accomm | Sheet row 43 | Fri 14 Aug 2026 UTC

Symptom: BA 11396 (bed 44) check-in TOMORROW (Sat 15 Aug 2026), fee = null.

Root cause: Accommodation restructured 14 Aug. Two new BAs created with fee = null. BA 11392 bedId = null.

Evidence (76th check, 14 Aug 2026 UTC):
- BA 11357 (host family, bed 178): Aug 2-Aug 15, fee EUR 1,250, ends TOMORROW, active
- BA 11396 (bed 44): Aug 15-Aug 22, fee = null, CHECK-IN TOMORROW, created 14 Aug
- BA 11397 (bed 89): Aug 22-Sep 6, fee = null, created 14 Aug
- BA 11392 (apartment): Sep 6-Sep 14, fee EUR 415, bedId = null (23 days to check-in)
- Bed 89 Aug 22: same-day checkout/checkin with Vincenzo Gagliano (BA 11387, bk 18175)

Fix recipe (NOT YET RUN):
1. TODAY: confirm fee for BA 11396 with Diego then:
   UPDATE booking_accommodation SET fee=<AMOUNT>, "updatedAt"=NOW() WHERE id=11396;
2. Before 22 Aug: same for BA 11397 (fee=<AMOUNT> WHERE id=11397)
3. Before 6 Sep: assign bed for BA 11392:
   UPDATE booking_accommodation SET "bedId"=<ID>, "updatedAt"=NOW() WHERE id=11392;
   (beds 168/194 noted as candidates in prior addenda)
4. Verify bed 89 Aug 22 turnaround -- confirm Vincenzo checks out and housekeeping clears room.

Risk: bookings+money | Reversible | Blast radius: 3 BAs
Status: OPEN - fix NOT RUN
Last checked: 2026-08-14 UTC (76th check)