# Issue 41 - Giampaolo Russo Dual Accommodation + Xero Null (Addendum 21 Jul, run j)
Reporter: Diego | Area: Booking/Accomm | Sheet row 43 | 37th hourly check (89th total) Tue 21 Jul 2026 UTC

## Symptom
Student booked host family + Capel apartment; only host family appears in SIS. Payment unreconciled in Xero.

## Current Status (fresh DB)

Booking 18180 | Giampaolo Russo (student 14571) | CONFIRMED, confirmed=true | paid EUR 2584.96 / EUR 2584.96 (fully paid)
BA 11357: bed 178 | host family | 2 Aug to 6 Sep 2026 | active=true | fee EUR 1250 -- CORRECT
Capel apartment (6 Sep to 14 Sep 2026, EUR 530 est.): STILL MISSING from booking 18180 -- not in DB
Payment 17954: EUR 2584.96 | type=null | xeroPaymentId=null | STILL unreconciled in Xero (26+ days since Jun 26 payment)
BC 24956: General English AM | 3 Aug to 11 Sep 2026 | 0 class assignments | active=true
Check-in date: 2 Aug 2026 (12 calendar days from today)

## Fix Recipe (NOT YET RUN)
1. Add Capel apartment to booking 18180 via SIS admin > booking 18180 > accommodation > add:
   - Accommodation type: Capel Street apartment
   - Start date: 6 Sep 2026
   - End date: 14 Sep 2026 (1 week + 1 extra night)
   - Fee: EUR 530 (confirm with Diego/admin)

2. Reconcile payment 17954 (EUR 2584.96) in Xero:
   - Log into Xero > find invoice for booking 18180 > match payment 17954
   - Set payment type (Bank Transfer) once confirmed with accounts

3. Assign BC24956 to class: SIS > Students > 14571 > Bookings > 18180 > Courses > BC24956 > assign to General English AM class

## Risk / Category
- Category: bookings / money
- Reversible: yes for accommodation add; Xero reconciliation is reversible
- Blast radius: check-in 12 days, missing Capel booking means no room allocated; Xero null means EUR 2584.96 unreconciled

## Status
OPEN - 37th hourly check, fix NOT YET RUN. Check-in in 12 days (Aug 2).
Last checked: 2026-07-21 ~21:00 UTC
