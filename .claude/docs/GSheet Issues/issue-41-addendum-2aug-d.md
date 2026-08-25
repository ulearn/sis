# Issue 41 -- Giampaolo Russo (addendum 2 Aug d)

Reporter: Diego  Area: Booking/Accomm  Sheet row: 43  Student: 14571

## Symptom
Student booked host family + Capel Street apartment. Host family shown; Capel missing. No class assigned.

## Root cause (51st check Sun 2 Aug 2026 UTC)

- BK 18180: CONFIRMED, confirmed=true, amtPaid=2584.96, amtOpen=0 (fully paid)
- BC 24956 (General English AM, Aug 3 - Sep 11): active, 0 class assignments.
  Note: start_date=2026-08-03 -- will shift to Aug 4 once Issue 38 BH fix runs.
- BA 11357 (host family, bed 178, Aug 2-Sep 6, EUR 1,250): active. Check-in today Aug 2.
- No Capel Street booking accommodation record found. Second accommodation MISSING.
- PMT 17954 (EUR 2,584.96, Bank Transfer): xeroPaymentId=null -- not reconciled in Xero (38 days).

## Fix recipe (NOT YET RUN)

Step 1 -- Run Issue 38 fix first (BC 24956 shifts to Aug 4).

Step 2 -- Assign class for week of Aug 4:
  In SIS admin: Booking 18180 -> Student Class Assignments -> Add
  Class: TBD (check student level / request from teaching staff)
  Week start: 2026-08-04, Week end: 2026-09-11 (or weekly if preferred)

Step 3 -- Add Capel Street booking accommodation:
  In SIS admin: Booking 18180 -> Accommodations -> Add
  Type: Apartment/Hotel (Capel Street)
  Dates: check original booking request for Capel period (Aug 2? - Sep 6?)
  Beds available (per last check): 161, 168, 174, 175, 176

Step 4 -- Reconcile PMT 17954 in Xero:
  Find EUR 2,584.96 payment from Giampaolo Russo in Xero
  Match to SIS payment 17954; update xeroPaymentId field

## Risk
Category: bookings + accommodation + money. Reversible: yes.
Step 2 (SCA) is URGENT -- student starts Tuesday 4 Aug.

## Status
OPEN. Fix NOT RUN. Last checked: Sun 2 Aug 2026 UTC (51st check)