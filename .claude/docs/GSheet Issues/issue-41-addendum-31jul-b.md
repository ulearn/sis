Issue 41 - Giampaolo Russo Dual Accommodation (11th check, Fri 31 Jul 2026 UTC)
Reporter: KC, Area: Booking/Accommodation, Sheet row: 43

STATUS: Host family check-in TOMORROW (Sun Aug 2). BA in DB correctly. Capel still missing.

EVIDENCE (live DB, Fri 31 Jul 2026):

Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, EUR 2,584.96 fully paid.
BA 11357 (Host Family, bed 178): start 2026-08-02, end 2026-09-06, active=true - CORRECT.
Capel Street BA (Sep 6 to Sep 14): still absent - no second booking_accommodations row for booking 18180.
BC 24956 (General English AM, Aug 3 start): will shift to Aug 4 when Issue 38 fix runs.
Awaiting Diego confirmation of Capel bed + fee.

Free Capel beds for Sep 6-14: 83, 87, 88, 89, 157, 161, 168, 173.
Beds 84 and 156 (cited in earlier checks) now occupied through Sep 2026.

FIX RECIPE (NOT YET RUN - pending Diego):

Once Diego confirms bed ID and fee:
  SQL (NOT YET RUN):
  INSERT INTO booking_accommodations
    (booking_id, accommodation_type, bed_id, start_date, end_date, weeks, active, created_at, updated_at)
  VALUES
    (18180, 'Apartment', <BED_ID>, '2026-09-06', '2026-09-14', 1, true, NOW(), NOW());
  Verify: SELECT id, booking_id, bed_id, start_date, end_date FROM booking_accommodations WHERE booking_id = 18180;

RISK: Bookings - reversible insert. Blast radius: 1 record.
STATUS: NOT RUN - awaiting Diego. Host family BA is correct; no action needed for Aug 2.
Last checked: Fri 31 Jul 2026 UTC (11th check)
