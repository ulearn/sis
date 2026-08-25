Issue 41 - Giampaolo Russo Dual Accommodation (13th check, Fri 31 Jul 2026 UTC)
Reporter: KC, Area: Booking/Accommodation, Sheet row: 43

STATUS: Host family check-in in 2 days (Sun Aug 2). Booking accommodation correct in DB. Capel still missing. Fix not run — awaiting Diego.

NOTE (correcting 31jul-b): Check-in is Aug 2 (Sunday), 2 days from today Fri Jul 31 — not "tomorrow". Tomorrow (Aug 1) is Saturday; Aug 2 is Sunday.

EVIDENCE (live DB, Fri 31 Jul 2026):

Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, EUR 2,584.96 fully paid.
Booking accommodation 11357 (Host Family, bed 178): start 2026-08-02, end 2026-09-06, active=true — correct.
Booking course 24956 (General English AM, starts Aug 3 -> shunts to Aug 4 per Issue 38 fix).
Capel Street booking accommodation (Sep 6 to Sep 14): still absent — no second bookingAccommodation row for booking 18180.

Free Capel beds for Sep 6-14 (from 31jul-b): 83, 87, 88, 89, 157, 161, 168, 173.
Beds 84 and 156 occupied through Sep 2026.

FIX RECIPE (NOT YET RUN — pending Diego confirmation of Capel bed + fee):

INSERT INTO BookingAccommodation
  (bookingId, accommodationType, bedId, startDate, endDate, weeks, active, createdAt, updatedAt)
VALUES
  (18180, 'Apartment', <BED_ID>, '2026-09-06', '2026-09-14', 1, true, NOW(), NOW());

Verify: SELECT id, bookingId, bedId, startDate, endDate FROM BookingAccommodation WHERE bookingId = 18180;

RISK: Bookings — reversible insert. Blast radius: 1 record.
STATUS: NOT RUN — awaiting Diego.
Last checked: Fri 31 Jul 2026 UTC (13th check)