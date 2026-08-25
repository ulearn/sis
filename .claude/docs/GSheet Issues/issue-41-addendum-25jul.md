# Issue 41 -- Giampaolo Russo -- Addendum 25 Jul 2026

Reporter: Diego | Area: Booking / Accomm | Sheet row: 43
Checked: Sat 25 Jul 2026 UTC -- 83rd hourly check, 161st total run

## CURRENT STATUS -- CHECK-IN 8 DAYS; CAPEL STREET STILL MISSING

Booking 18180 (Giampaolo Russo, student 14571): confirmed = true, fully paid EUR 2,584.96

Accommodations:
- BA 11357 (Host Family, Half Board, bed 178, 2 Aug - 6 Sep 2026): active = true, fee = EUR 1,250
  check-in Sun 2 Aug = 8 days away (was 9 yesterday)
- Capel Street apartment (6 Sep - 14 Sep 2026): NOT YET ADDED to booking 18180

Booking course:
- BC 24956 (General English AM, 3 Aug - 11 Sep 2026): active = true, dpe = -49 (49 days to end)
- ALERT: BC 24956 starts Mon 3 Aug 2026 = August Bank Holiday (Issue 38 not yet fixed)
  If Aug BH is added to school_closures, start date may need adjusting to Tue 4 Aug

Payment:
- Payment 17954 (EUR 2,584.96, Bank, 26 Jun 2026): xeroPaymentId = null -- 29 days unreconciled

## FIX RECIPE (NOT YET RUN)

Fix 1 -- Add Capel Street accommodation to booking 18180:
  SIS admin: Booking 18180 > Add Accommodation
  Type: Apartment (Capel Street)
  Dates: 6 Sep - 14 Sep 2026
  Fee: per contract

Fix 2 -- Reconcile payment 17954 in Xero:
  Xero: find the Bank transaction for EUR 2,584.96 on 26 Jun 2026, reconcile to SIS invoice.

Fix 3 -- After Issue 38 is resolved (Aug BH closure added):
  Check BC 24956 start date. If school is closed Aug 3, adjust start to Tue 4 Aug.

## RISK / CATEGORY

bookings | accounts | Reversible: Yes | Blast radius: 1 student

## STATUS

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC
Check-in Sun 2 Aug = 8 days. Capel Street missing. Xero null 29d. BC start vs Aug BH to verify.