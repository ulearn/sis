# Issue 41 — Giampaolo Russo Dual Accommodation and Xero — Addendum 23 Jul 2026 (i)

**Reporter:** Staff (Diego) | **Area:** Booking / Accomm | **Sheet row:** 43 | **Check:** 69th hourly (147th total)

## Symptom
Giampaolo Russo (student 14571) booked Host Family and Capel Street apartment (both Aug 2 - Sep 6 2026). Only Host Family in SIS. Payment 17954 has no Xero ID. Check-in 10 days away (2 Aug 2026).

## Root Cause
Two issues: (1) Capel accommodation never entered into SIS - only BA11357 (Host Family, bed 178) is present; (2) Payment 17954 (EUR 2,584.96 Bank 29 Jun 2026) xeroPaymentId still null after 24 days.

## New Finding This Check
BC24956 (General English AM) starts Mon 3 Aug 2026 = August Bank Holiday (missing from school_closures - Issue 38). After Issue 38 is resolved, verify whether BC24956 start date needs shifting to Tue 4 Aug 2026.

## Evidence
- booking 18180: CONFIRMED, confirmed=true, amtPaid=2584.96, amtTotal=2584.96, updatedAt=2026-06-29
- payment 17954: EUR 2,584.96, type=null, xeroPaymentId=null, createdAt=2026-06-29 (24 days ago)
- bookingAccommodation 11357: bedId=178, roomName=Room 2, 2026-08-02 to 2026-09-06, fee=EUR 1,250, active=true
- bookingCourse 24956: General English AM, startDate=2026-08-03 (= August Bank Holiday), endDate=2026-09-11, fee=EUR 804.96
- Capel Street accommodation: absent from DB
- Check-in: 2 Aug 2026 (10 days away)

## Fix Recipe (NOT YET RUN)

Step 1 - Add Capel Street accommodation (URGENT - check-in 2 Aug):
1. SIS Admin > Students > student 14571 (Giampaolo Russo) > Booking 18180
2. Accommodations > Add booking accommodation:
   - Provider: Capel Street apartment (find correct bed in Capel building)
   - Dates: 2 Aug - 6 Sep 2026
   - Fee: check original booking/invoice for Capel fee amount
3. Save and confirm BA is active

Step 2 - Reconcile payment 17954 in Xero:
1. Hub > fins/ > locate EUR 2,584.96 bank payment dated 29 Jun 2026
2. Match to Xero invoice for booking 18180
3. Set xeroPaymentId on payment 17954 via SIS admin or DB (NOT YET RUN)

Step 3 - Verify course start date after Issue 38 resolved:
1. After adding Aug BH to school_closures, check BC24956
2. If not auto-shunted, update startDate to 2026-08-04 (NOT YET RUN)

## Risk / Category
- Category: bookings / accommodations / accounts; Reversible: yes for all steps
- Blast radius: one student; Xero reconciliation affects accounts; course date affects attendance
- Financial: EUR 2,584.96 unreconciled in Xero; Capel fee unknown - check invoice

## Status
UNCHANGED - Capel missing, Xero null (24d), BC24956 starts on Bank Holiday - check-in 10 days away
Last checked: Thu 23 Jul 2026 UTC (69th hourly check, 147th total)