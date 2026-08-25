# Issue 41 - Giampaolo Russo (Student 14571) - Arrives Tomorrow Sun Aug 2

Reporter: KC | Area: Booking / Accommodation | Sheet row: 43 | Check: 34th (12th Sat 1 Aug 2026 UTC)

## Symptom
Two accommodation types: host family Aug 2 + Capel Street Sep 6. Capel Street absent from DB. Student arrives TOMORROW (Sunday Aug 2).

## Current State (fresh DB -- issues NOT YET FIXED)

Booking 18180: CONFIRMED, confirmed=true, paid EUR 2,584.96, open EUR 0.

Payment 17954: EUR 2,584.96, Bank, date 2026-06-26, hubspot_payment_id=1268783973563.
xero_payment_id = null (NOT yet reconciled to Xero).

BA 11357 (Host Family): bed 178, start 2026-08-02, end 2026-09-06, active=true, fee EUR 1,250.
READY for check-in tomorrow.

BC 24956 (General English AM): start 2026-08-03 (August Bank Holiday!), end 2026-09-11, confirmed=true.
Requires Issue 38 shunt to 2026-08-04.

Capel Street (Sep 6 to Sep 14): STILL ABSENT from DB -- no second booking_accommodation record.

## Fix Recipe (NOT YET RUN)

Step 1 - Run Issue 38 shunt first.
BC 24956 is in the 21-BC shunt list. Issue 38 fix moves it to Aug 4.

Step 2 - Add Capel Street booking accommodation.
In SIS Admin -> Booking 18180 -> Accommodations -> Add:
  accommodation_type: Apartment / Residence
  Bed: Capel Street bed (confirm with Diego)
  start_date: 2026-09-06, end_date: 2026-09-14
  Fee: confirm with Diego / HubSpot deal
  active: true

Step 3 - Reconcile payment 17954 in Xero.
xero_payment_id is null. Link payment 17954 to the Xero invoice for booking 18180.

Step 4 - Verify host family in Matching section.
SIS -> Accommodation -> Matching for week of 2026-08-02 -- Giampaolo should appear.

## Risk
Category: bookings, accommodation, money. Reversible: yes. Blast radius: single student.
CRITICAL -- student arrives TOMORROW (Aug 2). Host family ready; Capel gap is Sep 6 (5 weeks away).

## Status
Open -- 34th check (12th today), NOT FIXED. Capel absent, payment unreconciled, BH shunt pending.
Last checked: 2026-08-01 UTC (12th check today)