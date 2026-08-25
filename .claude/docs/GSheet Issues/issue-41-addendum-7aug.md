Issue 41 Addendum - Fri 7 Aug 2026 UTC (19th check)
Reporter: Diego | Row: 43

SYMPTOM
Giampaolo Russo (booking 18180, student 14571) booked both host family and city-centre apartment. The apartment booking accommodation (BA 11392) has no bed assigned. Payment unreconciled in Xero.

ROOT CAUSE (verified Fri 7 Aug 2026 UTC)
- BA 11357 (Host Family, bed 178, Claremont Close, 2 Aug - 6 Sep 2026): active, student checked in 5 days ago - OK
- BA 11392 (City Centre Apartment, 6 Sep to 14 Sep 2026): bed_id=null, 30 days until check-in, fee EUR 415
- Payment 17954: EUR 2584.96, Bank, paid 26 Jun 2026, xero_payment_id=null - 42 days unreconciled (booking 18180)

FIX RECIPE (NOT YET RUN)

Step 1 - Assign bed to BA 11392 in SIS Admin:
  Accommodation > booking 18180 > open BA 11392 > assign available city-centre apartment bed for 6 Sep to 14 Sep 2026.

Step 2 - Reconcile payment 17954 in Xero:
  Payment EUR 2584.96, Bank Transfer, 26 Jun 2026. Match to invoice for booking 18180.

Step 3 - Verify:
  SELECT id, bed_id, active FROM booking_accommodations WHERE id=11392;
  SELECT id, xero_payment_id FROM payments WHERE id=17954;

RISK: accommodation/accounts | reversible | single student | Capel check-in 30 days (6 Sep 2026)
STATUS: NOT RUN
LAST CHECKED: Fri 7 Aug 2026 UTC
