Issue 41 — Giampaolo Russo — Capel Street BA Missing (155th check, 29 Jul 2026)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Symptom
=======
Student booked Host Family (Aug 2 - Sep 6) + Capel Street apartment (Sep 6 - Sep 14).
Host Family BA now confirmed present; Capel Street BA still absent.

Root cause (DB, 29 Jul 2026 UTC)
=================================
- Booking 18180 (Giampaolo Russo, student 14571): exactly 1 accommodation record.
- BA 11357: type=Host Family, bed=178, start=2026-08-02, end=2026-09-06, active=true, fee=EUR 1250. Correct.
- Capel Street apartment (Sep 6-Sep 14 2026): ABSENT - no BA with booking_id=18180 and dates Sep 6-14.
- BC 24956 (General English AM, bk 18180): start=2026-08-03, end=2026-09-11, active=true.
  BC 24956 is one of the 20 BCs starting Aug 3 - also needs Issue 38 shunt to 2026-08-04.
- Host family check-in: Sun Aug 2 2026 (4 days).

Fix recipe — NOT YET RUN
=========================

Step 1 — Add Capel Street BA via SIS admin UI (preferred)
  Booking 18180 -> Add Accommodation -> Capel Street / Apartment
  Dates: Sep 6 2026 - Sep 14 2026 (1 week + 1 night)
  Bed: to be confirmed from Capel Street availability
  Fee: to be confirmed from booking invoice

Step 1b — Find available Capel beds (if needed)
NOT YET RUN:
  SELECT b.id, b.name, b.room_type, a.name as property
  FROM beds b
  JOIN accommodations a ON a.id = b.accommodation_id
  WHERE a.name ILIKE '%capel%'
    AND b.id NOT IN (
      SELECT bed_id FROM booking_accommodations
      WHERE start_date < '2026-09-14' AND end_date > '2026-09-06'
      AND active = true
    );
  Then insert:
  INSERT INTO booking_accommodations
    (booking_id, accommodation_type, room_type, start_date, end_date, weeks, bed_id, fee, active, created_at, updated_at)
  VALUES (18180, 'Capel', 'Premium', '2026-09-06', '2026-09-14', 1, <bed_id>, <fee>, true, NOW(), NOW());

Step 2 — Shunt BC 24956 for Aug Bank Holiday (covered by Issue 38 batch)
NOT YET RUN (part of Issue 38 step 2):
  UPDATE booking_courses SET start_date = '2026-08-04', updated_at = NOW()
  WHERE id = 24956 AND start_date = '2026-08-03';

Step 3 — Verify
NOT YET RUN:
  SELECT id, accommodation_type, start_date, end_date, active, fee
  FROM booking_accommodations WHERE booking_id = 18180;
  Should return 2 rows: BA 11357 (Host Family) + new Capel BA.

Risk / category
===============
Bookings / Accommodation. Reversible (DELETE new BA if incorrect).
Host family check-in Sun Aug 2 is not blocked (BA 11357 confirmed).
Capel BA needed before Sep 6 check-in.

Status
======
OPEN — Fix NOT RUN. 155th check 29 Jul 2026 UTC.
Check-in Sun Aug 2 (4 days). Capel BA needed before Sep 6.

Last checked
============
2026-07-29 UTC
