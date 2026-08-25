Issue 36b - Pietro Caccianiga (addendum 19 Aug 2026)
Reporter: Staff (Diego) | Area: Booking/Accomm | Sheet row: 38 | Last checked: 2026-08-19 UTC

SYMPTOM
Accommodation dates wrong. Student paid 11 weeks (Jun 28 - Sep 13). System will not let staff change dates.

ROOT CAUSE (live data, 19 Aug 2026)
- Booking 17980 (Pietro Caccianiga, student 14521): CONFIRMED, confirmed=true, paid EUR 5,331
- Booking Course 24772 (General English AM): ends Fri 21 Aug 2026 (2 days), still active
- No second Booking Course after 21 Aug -- confirm with Diego whether course continues
- Accommodation 11311 (bed 84): ends Sat 22 Aug -- checkout Sat (3 days), active, fee EUR 3,850
- Accommodation 11393 (bed 88): starts Sat 22 Aug, ends 13 Sep 2026 -- check-in Sat (3 days), fee = null (URGENT)
- Payment 17733: EUR 5,331, Bank (2 Jun 2026) -- Xero payment ID = null (79 days unreconciled)

FIX RECIPE (NOT YET RUN)

Step 1 (URGENT before Sat 22 Aug) - Set fee on Accommodation 11393:
  Confirm fee with Diego/accounts first.
  UPDATE booking_accommodation SET fee = <confirmed_fee> WHERE id = 11393;

Step 2 (on/after Fri 21 Aug) - Deactivate Booking Course 24772:
  UPDATE booking_course SET active = false WHERE id = 24772;

Step 3 (after Sat 22 Aug checkout) - Deactivate Accommodation 11311:
  UPDATE booking_accommodation SET active = false WHERE id = 11311;

Step 4 - If course continues after 21 Aug:
  Confirm with Diego. If yes, insert new Booking Course for remaining period.

Step 5 - Reconcile Payment 17733 in Xero:
  Match EUR 5,331 to Xero invoice; set xero_payment_id on payment 17733.

RISK
- Category: bookings / accommodation / payments
- Reversible: yes for deactivations; fee needs confirmation
- Blast radius: single student; fee error affects accommodation provider

STATUS: Open. URGENT: fee null, check-in Sat 22 Aug (3d). Course ends Fri 21 Aug (2d). Fix NOT RUN.
Prior addendum: issue-36b-addendum-18aug.md.