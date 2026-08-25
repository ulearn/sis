Issue 36b -- Pietro Caccianiga (addendum 19 Aug 2026 2nd run)
Reporter: Diego (KC) | Sheet row: 38 | Last checked: 2026-08-19 ~10:30 UTC (230th check)

Symptom: Accommodation dates wrong. 11 weeks (Jun 28 - Sep 13).

Root cause (live data 19 Aug ~10:30 UTC):
- Booking 17980 (Pietro, student 14521): CONFIRMED, paid EUR 5,331
- Booking Course 24772 (General English AM): ends Fri 21 Aug 2026 (2 days from Wed 19 Aug), active
- CONFIRMED: no second booking course in DB after 21 Aug. Diego to confirm if course continues.
- Accommodation 11311 (bed 84): Jun 28 - Sat 22 Aug, fee EUR 3,850, active (checkout Sat 22 Aug, 3d)
- Accommodation 11393 (bed 88): Sat 22 Aug - Sep 13, fee = null (URGENT), active (check-in Sat 22 Aug, 3d)
- Payment 17733: EUR 5,331 Bank 2-Jun-2026 -- Xero payment ID = null (80 days)
- Note: 3-week gap between course end (Aug 21) and accomm end (Sep 13) -- may be intentional

Fix recipe (NOT YET RUN):

Step 1 URGENT before Sat 22 Aug -- set fee on Accommodation 11393:
  Ask Diego for fee amount for Aug 22 - Sep 13, then:
  UPDATE booking_accommodation SET fee = <confirmed_fee> WHERE id = 11393;

Step 2 -- confirm course status with Diego:
  Does Pietro continue after Aug 21? If yes, create new BC via SIS UI. If no, Aug 21 is correct finish.

Step 3 -- on/after Fri 21 Aug -- deactivate Booking Course 24772:
  UPDATE booking_course SET active = false WHERE id = 24772;

Step 4 -- after Sat 22 Aug checkout -- deactivate Accommodation 11311:
  UPDATE booking_accommodation SET active = false WHERE id = 11311;

Step 5 -- reconcile Payment 17733 in Xero:
  Match EUR 5,331 to Xero invoice; set xero_payment_id on payment 17733.

Risk: bookings/accommodation/payments. Reversible. Single student blast radius.
Status: Open. URGENT: BA 11393 fee null (check-in Sat 22 Aug, 3d). Course ends Fri 21 Aug (2d). No 2nd BC. Fix NOT RUN.
Prior: issue-36b-addendum-19aug.md