# Issue 41 -- Giampaolo Russo -- Capel St BA Missing, Check-in Aug 2 -- PM Addendum 27 Jul 2026

Reporter: KC | Area: Booking/Accomm | Sheet row: 43 | Last checked: 2026-07-27 UTC PM

## Root Cause (fresh data 2026-07-27 PM)

Student 14571 (Giampaolo Russo), booking 18180, EUR 2,584.96 confirmed/paid
BA 11357: bed 178, Aug 2-Sep 6 2026, active, fee EUR 1,250 -- host family present, bed assigned
Capel Street BA (Sep 6-Sep 14 2026): ABSENT -- only 1 BA confirmed fresh
BC 24956: General English AM, Aug 3-Sep 11, fee EUR 804.96, 0 SCAs -- blocked by Issue 38
Check-in: Sunday Aug 2 = 6 days away

## Fix Recipe (NOT YET RUN)

Step 1: Create Capel St BA in SIS Admin > Booking 18180 > Accommodations
- Type: Apartment (Capel Street)
- Start: 2026-09-06, End: 2026-09-14
- Fee: confirm from deal
- Or: INSERT INTO "BookingAccommodation" ("bookingId","startDate","endDate",active,fee) VALUES (18180,'2026-09-06','2026-09-14',true,<FEE>);

Step 2: Assign BC 24956 to GE AM after Issue 38 fix (start date shunts to Aug 4)

Step 3: Assign Capel bed via SIS Matching for Sep 6-14

Risk: bookings. Reversible: yes. Blast radius: 1 student. Check-in Aug 2 (6 days).
Last checked: 2026-07-27 UTC PM