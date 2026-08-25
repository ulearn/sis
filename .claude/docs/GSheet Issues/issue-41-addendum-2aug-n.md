Issue 41 -- Giampaolo Russo (arrived today Sun 2 Aug; SCA urgently needed before Tue 4 Aug)
Reporter: KC | Area: Booking/Accommodation | Sheet row 43

Root Cause (61st check, 16th today -- Sun 2 Aug 2026 UTC)
- Student 14571 (Giampaolo Russo) ARRIVED TODAY (Sun 2 Aug 2026). First class Tue 4 Aug (after BH shunt).
- Booking 18180: status=CONFIRMED, confirmed=true, amountPaid=EUR 2584.96, xeroId=null (37+ days).
- BC 24956: General English AM, startDate=2026-08-03 (shunts to Aug 4 after Issue 38 fix), ends Sep 11,
  fee=EUR 804.96, 0 class assignments. SCA for week Aug 4 urgently needed.
- BA 11357: Host Family, Individual, Half Board, Aug 2-Sep 6, bed 178, provider 24,
  claimStatus=confirmed, claimedAt=2026-07-01, fee=EUR 1250. Active and correct.
- Capel Street apartment (Sep 6-14, 1wk+1 night): NOT in DB. Only 1 BA exists for student 14571.
- 1 payment on booking 18180.

Fix Recipe (NOT YET RUN)

Step 1 -- Run Issue 38 BH shunt first (BC 24956 startDate: Aug 3 -> Aug 4)

Step 2 -- Create SCA for BC 24956 (URGENT before Tue 4 Aug)
SIS admin: Student 14571, Booking 18180, BC 24956, week Aug 4-8, General English AM class.

Step 3 -- Create Capel Street BA for booking 18180
Confirm with Diego/KC. Type=Apartment (Capel Street), Dates=Sep 6-Sep 14 2026
(check if +1 night = checkout Sep 15). Confirm bed/room with Capel Street coordinator.

Step 4 -- Chase Xero invoice for booking 18180
xeroId=null, amountPaid=EUR 2584.96. Generate via SIS Xero sync or create manually in Xero.

Risk: Bookings + Accommodation + Accounts. Reversible. 1 student. SCA urgent (Tue 4 Aug).
Status: NOT RUN. Last checked: Sun 2 Aug 2026 UTC (61st check, 16th today)
