Issue 41 -- Giampaolo Russo: Capel Accommodation Missing + Xero Null -- Addendum 24 Jul (f)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43
Checked: Fri 24 Jul 2026 UTC -- 78th hourly check, 156th total run

ROOT CAUSE (confirmed, unchanged): Capel Street accommodation (6 Sep - 14 Sep 2026) never added to booking 18180. Payment 17954 has xeroPaymentId = null and type = null.

CURRENT STATUS -- UNCHANGED (check-in Sun 2 Aug = 9 calendar days)

- Booking 18180: CONFIRMED, fully paid EUR 2,584.96, amount open = EUR 0
- Payment 17954 (EUR 2,584.96, Bank, createdAt 29 Jun 2026): xeroPaymentId = null, type = null -- 25 days
  (prior H showed 26 Jun; DB createdAt = 2026-06-29; 25 days to Jul 24)
- Accommodation 11357 (bed 178, Host Family, 2 Aug - 6 Sep 2026, EUR 1,250): active = true
  Host claim confirmed: provider 24, 1 Jul 2026
- Capel Street accommodation (6 Sep - 14 Sep): MISSING -- only 1 accommodation on booking 18180
- Course 24956: starts Mon 3 Aug 2026 = Aug Bank Holiday (fix Issue 38 first)
- Check-in: Sun 2 Aug 2026 -- 9 days away

FIX RECIPE (NOT YET RUN)

Step 1 - Add Capel Street accommodation via SIS admin:
  Booking 18180 -> Accommodation -> Add
  Type: Apartment / Capel Street | Room: Premium | Start: 6 Sep 2026 | End: 14 Sep 2026
  Assign bed when available

Step 2 - Reconcile payment 17954 in Xero:
  Find Bank Transfer EUR 2,584.96 ~29 Jun 2026 -> match to booking 18180
  Confirm xeroPaymentId written back:
  SELECT xero_payment_id, type FROM payments WHERE id = 17954;

Step 3 - Fix Issue 38 (Aug BH for course 24956 start date).

Confirm: SELECT id, bed_id, start_date, end_date, accommodation_type FROM booking_accommodations WHERE booking_id = 18180;

RISK: bookings/money | Reversible: Yes | Single student | Time-sensitive (9 days to check-in)

STATUS: Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC