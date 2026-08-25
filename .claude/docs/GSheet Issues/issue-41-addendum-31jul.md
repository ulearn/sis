Issue 41 Addendum 31jul (10th check Fri 31 Jul 2026 UTC)

Reporter: KC | Area: Booking/Accommodation | Sheet row: 43

Root Cause (fresh DB check)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, EUR 2,584.96 fully paid.
- Booking Accommodation 11357 (Host Family, bed 178, Patty McSweeney): Aug 2 to Sep 6 — PRESENT AND CORRECT.
  CHECK-IN IS TOMORROW (Sun 2 Aug). Host family side is fine.
- Capel Street apartment (Sep 6 to Sep 14): STILL ABSENT — no second booking_accommodations record exists.
- Booking Course 24956 (General English AM, Aug 3 to Sep 11): will shift to Aug 4 when Issue 38 fix runs.

Capel Bed Availability Update (Sep 6-14):
- Bed 84 (A1/Room 3): occupied Jun 28 to Sep 13 (booking 17980) — NOT available
- Bed 156 (A1/Room 4 Single A): occupied Jun 6 to Sep 26 (booking 17890) — NOT available
- Free beds Sep 6-14 (8 options):
    83 (A1/Room 2), 87 (A2/Room 2), 88 (A2/Room 3), 89 (A2/Room 4),
    157 (A1/Room 4 Single B), 161 (A2/Room 1), 168 (A1/Room 1), 173 (A1/Room 4 Single B)

Fix Recipe (NOT YET RUN - pending Diego confirmation of bed + fee)

Once Diego confirms bed ID and fee, Neil runs:
  INSERT INTO booking_accommodations
    (booking_id, accommodation_type, bed_id, start_date, end_date, weeks, active, created_at, updated_at)
  VALUES
    (18180, 'Apartment', <BED_ID>, '2026-09-06', '2026-09-14', 1, true, NOW(), NOW());
  Verify: SELECT id, booking_id, bed_id, start_date, end_date FROM booking_accommodations WHERE booking_id = 18180;

Note: beds 84 and 156 (cited in prior checks as available) are now booked. Remaining 8 options listed above.

Risk: Bookings — reversible insert. Blast radius: 1 record.
Status: NOT RUN. Awaiting Diego to confirm Capel bed + fee.
Host family check-in TOMORROW (Aug 2) is recorded correctly — no action needed today.
Last checked: 2026-07-31 UTC.
