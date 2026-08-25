Issue 41 -- Giampaolo Russo (arrived today Sun 2 Aug; SCA before Tue 4 Aug)
Reporter: KC | Area: Booking/Accommodation | Sheet row 43

Root Cause (60th check, 1st this hour -- Sun 2 Aug 2026 UTC)
- Student 14571 (Giampaolo Russo) ARRIVED TODAY (Sun 2 Aug 2026).
- BC 24956: General English AM, start 2026-08-03 (-> Aug 4 after BH shunt), ends Sep 11, fee EUR 804.96, 0 SCAs.
- BA 11357: Host Family, Individual, Half Board, Aug 2-Sep 6, bed 178, provider 24, claimStatus=confirmed.
- Capel Street apartment BA: NOT in DB. Only 1 BA exists for student 14571.
- Xero: xeroId null on booking 18180 (37+ days). Booking CONFIRMED, fully paid.

Fix Recipe (NOT YET RUN)

Step 1 -- Run Issue 38 BH shunt first (BC 24956 start: Aug 3 -> Aug 4)

Step 2 -- Create SCA for BC 24956 (URGENT)
Via SIS admin: Student 14571, Booking 18180, BC 24956, week Aug 4-8, General English AM class.

Step 3 -- Clarify Capel Street apartment with KC/Diego
No second BA exists in DB. If apartment was booked: create BA on booking 18180 (type=Apartment, Capel St, confirm dates).
If cancelled or not booked: no action needed on accommodation.

Step 4 -- Issue Xero invoice for booking 18180
Via SIS admin -> Accounts -> push to Xero.

Risk: Bookings + Accommodation + Accounts. Reversible. 1 student. SCA urgent (Tue 4 Aug).
Status: NOT RUN. Last checked: Sun 2 Aug 2026 UTC (60th check, 15th today)