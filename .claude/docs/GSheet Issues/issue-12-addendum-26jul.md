Issue 12 - Stale Booking Accommodations (Addendum 26 Jul 2026)

Reporter: NM | Area: Booking/Accommodation | Sheet row: 13

Root cause (fresh data 26 Jul 2026 UTC) - 3 stale BAs unchanged:
- BA 11162: Massimiliano Cameran, booking 97, bed 179, ended 23 May 2026, active=true, 64 days stale, EUR 1140
- BA 11314: Massimiliano Cameran, booking 18002, bed 179, ended 6 Jun 2026, active=true, 50 days stale, EUR 480
- BA 11319: Ernesto Pesoa Gil, booking 18034, bed=null, ended 31 May 2026, active=true, 56 days stale, EUR 400 (zero-day stay)

Fix recipe (NOT YET RUN):
Verify first:
  SELECT ba.id, ba.start_date, ba.end_date, ba.active, ba.bed_id, ba.fee, b.status, s.first_name, s.last_name
  FROM booking_accommodations ba
  JOIN bookings b ON ba.booking_id = b.id
  JOIN students s ON b.student_id = s.id
  WHERE ba.id IN (11162, 11314, 11319);
Then apply:
  UPDATE booking_accommodations SET active = false WHERE id IN (11162, 11314, 11319);

Risk/Category: data-hygiene, reversible; bed 179 may appear occupied in availability
Urgency: low

Status: OPEN - Fix NOT RUN.
Last checked: 26 Jul 2026 UTC (108th hourly run, 64/50/56 days stale)