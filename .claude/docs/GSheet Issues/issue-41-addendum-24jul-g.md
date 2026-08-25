Issue 41 -- Giampaolo Russo: Missing Capel Street Accommodation + Xero Null -- Addendum 24 Jul (g)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43
Checked: Fri 24 Jul 2026 UTC -- 81st hourly check, 159th total run

CURRENT STATUS -- UNCHANGED, HOST FAMILY CHECK-IN IN 9 DAYS (Mon 2 Aug)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, confirmed = true
- Total paid: EUR 2,584.96
- Accommodation 11357: Host Family, 2 Aug - 6 Sep 2026, active = true
- Capel Street accommodation (6 Sep - 14 Sep 2026): NOT YET ADDED to booking 18180
- Payment 17954: EUR 2,584.96, Bank, 26 Jun 2026, xeroPaymentId = null -- 28 days unreconciled
- Host Family check-in: Mon 2 Aug 2026 = 9 calendar days away

FIX RECIPE (NOT YET RUN)

Step 1 -- Add Capel Street accommodation to booking 18180 via SIS admin:
  Add BookingAccommodation: type Apartment, start 6 Sep 2026, end 14 Sep 2026, property Capel Street.

Step 2 -- Reconcile payment 17954 in Xero:
  Find bank receipt: EUR 2,584.96, 26 Jun 2026, Giampaolo Russo.
  Match in Xero, update SIS with Xero payment ID.

Step 3 -- Confirm:
  SELECT id, accommodation_type, start_date, end_date, active FROM booking_accommodations WHERE booking_id = 18180;
  SELECT id, amount, xero_payment_id FROM payments WHERE id = 17954;

RISK: bookings/accommodation + accounts | Reversible: Yes | Urgency: HIGH -- check-in Mon 2 Aug (9 days)
STATUS: Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC