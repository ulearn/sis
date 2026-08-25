Issue 36 - Pietro Caccianiga (195th check)
Reporter: KC | Area: Booking/Accomm | Sheet row: 38 | Sun 16 Aug 2026 UTC

Symptom
Accommodation dates wrong; system won't allow date change. Student paid 11 weeks accommodation Jun 28 to Sep 13.

Root Cause (195th check - 16 Aug 2026 UTC)
- Student 14521 Pietro Caccianiga, booking 17980: CONFIRMED, confirmed=true, EUR 5,331 fully paid
- BC 24772 (General English AM): 29 Jun to 21 Aug 2026 (TOMORROW), active=true
  serviceEnd = 2026-08-21 (TOMORROW) -- correct, matches course end date
- BA 11311 (bed 84): 28 Jun to 22 Aug 2026, fee = EUR 3,850, active -- current stay, ends 6 days
- BA 11393 (bed 88, Capel Street): 22 Aug to 13 Sep 2026, fee = NULL, type=null -- check-in 6 days (22 Aug)
- Payment 17733: EUR 5,331, Bank, 3 Jun 2026 -- xeroPaymentId = null (75 days unreconciled)

Note on serviceEnd
serviceEnd = Aug 21 aligns with course end. Student stays in accommodation (Capel St to Sep 13) after course finishes.
Accommodation-only continuity -- no further course booked. serviceEnd does NOT need changing.

Fix Recipe (NOT YET RUN)

Step 1 - URGENT before 22 Aug (6 days): Set fee and type on BA 11393
Fee: EUR 5,331 total - EUR 3,850 for BA 11311 = EUR 1,481 remaining for BA 11393.
Confirm exact amount against invoice.
UPDATE booking_accommodations
SET fee = <confirmed_fee>,
    accommodation_type = <capel_type_code>,
    room_type = <room_type>,
    board = <board_type>
WHERE id = 11393;

Step 2 - Deactivate BA 11311 on or after 22 Aug
UPDATE booking_accommodations SET active = false WHERE id = 11311;

Step 3 - Reconcile payment 17733 in Xero
EUR 5,331 Bank, xeroPaymentId=null, 75 days unreconciled. Check Hub fins/ for Xero match.

Risk
- Category: bookings / accommodation / accounts
- Reversible: yes
- Blast radius: single student, single booking
- URGENCY: BA 11393 check-in 22 Aug = 6 days -- set fee before then

Status: Open -- Fix NOT RUN
Last checked: 2026-08-16 UTC (195th check)
