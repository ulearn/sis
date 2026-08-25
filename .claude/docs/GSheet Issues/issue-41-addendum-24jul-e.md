Issue 41 -- Giampaolo Russo: Dual Accommodation + Xero Null -- Addendum 24 Jul (e)

Reporter: ST | Area: Booking / Accomm | Sheet row: 43
Checked: Fri 24 Jul 2026 UTC -- 76th hourly check, 154th total run

SYMPTOM
Student booked Host Family (2 Aug - 6 Sep) and Capel Street premium room (6 Sep - 14 Sep). Only Host Family in SIS. Payment unreconciled in Xero.

ROOT CAUSE (confirmed, unchanged)
Booking 18180 has only BA 11357 (Host Family). Capel Street accommodation never added. Payment 17954 xeroPaymentId = null.

CURRENT STATUS

- Booking 18180: CONFIRMED, fully paid EUR 2,584.96
- Payment 17954: EUR 2,584.96, Bank, 26 Jun 2026 -- xeroPaymentId = STILL null -- 28 days unreconciled -- hubspotPaymentId = 1268783973563
- Accommodation 11357 (Host Family, 2 Aug - 6 Sep, bed 178, EUR 1,250): active = true -- NEW: host claim CONFIRMED by provider 24 on 1 Jul 2026 (claimStatus=confirmed, claimedAt=2026-07-01)
- Capel Street (6 Sep - 14 Sep 2026): STILL missing -- only 1 accommodation on booking 18180
- Course 24956 (General English AM, 3 Aug - 11 Sep): starts Mon 3 Aug = August Bank Holiday -- fix Issue 38 first; classAssignments = 0
- Check-in: Sun 2 Aug 2026 -- 9 calendar days away

What is new this run: BA 11357 claimStatus = confirmed by providerId 24 on 1 Jul 2026. Host family placement is secured. Outstanding: Capel Street missing, Xero payment null, class not assigned.

FIX RECIPE (NOT YET RUN)

Step 1 - Add Capel Street accommodation to booking 18180 in SIS admin:
  - Type: City Centre Apartment, premium room at Capel Street
  - Dates: 6 Sep 2026 - 14 Sep 2026 (1 week + 1 night)
  - Fee: per agreed rate

Step 2 - Reconcile payment 17954 in Xero:
  Find EUR 2,584.96 bank transfer received ~26 Jun 2026, reconcile against booking 18180 invoice.
  Then: UPDATE payments SET xero_payment_id = '<xero_id>' WHERE id = 17954;

Step 3 - Assign course 24956 to morning class (after Issue 38 Aug BH fix applied).

Step 4 - Confirm:
  SELECT id, accommodation_type, start_date, end_date, active FROM booking_accommodations WHERE booking_id = 18180;
  SELECT id, amount, xero_payment_id FROM payments WHERE booking_id = 18180;

RISK
- Category: bookings / money
- Reversible: Yes
- Blast radius: Single student; check-in in 9 days -- time-sensitive

STATUS
OPEN - Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC
