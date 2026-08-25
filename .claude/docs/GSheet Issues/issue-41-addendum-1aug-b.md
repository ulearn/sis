ISSUE 41 - Giampaolo Russo: host family + Capel St accommodation
=================================================================

Area: Booking/Accommodation  Row: 43  Checked: 2026-08-01 UTC (26th hrly, 4th of day)

SYMPTOM
-------
Student booked host family (Aug 2-Sep 6) and Capel Street premium room (Sep 6-14). Capel St BA absent from DB.
Student arrives TOMORROW (Sun Aug 2).

ROOT CAUSE / DB STATE (confirmed 2026-08-01 UTC, 4th check of day - UNCHANGED)
--------------------------------------------------------------------------------
- Booking 18180 (student 14571 Giampaolo Russo): status CONFIRMED, confirmed = true, paid = EUR 2,584.96, open = EUR 0.
- Booking accommodation 11357 (bed 178, property Home): type = Host Family, Aug 2-Sep 6 2026, active = true, fee = EUR 1,250.
- Booking course 24956 (General English AM, Aug 3-Sep 11): active = true, 0 class assignments.
  -> BC24956 start_date will move Aug 3 -> Aug 4 when Issue 38 fix runs tonight.
- Capel Street booking accommodation (Sep 6-Sep 14): STILL ABSENT from DB - bed ID and fee not yet provided.
- No arrival-date discrepancy in DB: BA11357 start = Aug 2 (Sun) as expected.

FIX RECIPE (NOT YET RUN)
------------------------

Step 1 - Confirm arrival date with Diego (tonight):
  Ask Diego: does Giampaolo arrive Sat 1 Aug or Sun 2 Aug?
  If arrival is Sat 1 Aug (NOT YET RUN):
    UPDATE booking_accommodation SET start_date = '2026-08-01' WHERE id = 11357;

Step 2 - Obtain Capel Street bed ID and fee:
  Find available Capel beds for Sep 6-14:
    SELECT b.id, b.name, r.name as room, p.name as property
    FROM accommodation_beds b
    JOIN accommodation_rooms r ON b.room_id = r.id
    JOIN accommodation_properties p ON r.property_id = p.id
    WHERE p.name ILIKE '%Capel%'
    ORDER BY p.name, r.name, b.name;

Step 3 - Add Capel Street BA (NOT YET RUN):
  INSERT INTO booking_accommodation
    (booking_id, bed_id, accommodation_type, start_date, end_date, active, fee, created_at, updated_at)
  VALUES
    (18180, <BED_ID>, 'Apartment', '2026-09-06', '2026-09-14', true, <FEE>, NOW(), NOW());

Step 4 - Verify:
  SELECT id, bed_id, accommodation_type, start_date, end_date, active, fee
  FROM booking_accommodation WHERE booking_id = 18180 ORDER BY start_date;
  -- Expected: 2 rows (BA11357 host family Aug 2-Sep 6 + new Capel St Sep 6-14)

RISK
----
Category: bookings/accommodation. Student arriving tomorrow. Reversible: yes. Blast radius: 1 student.

STATUS: OPEN - CHECK-IN TOMORROW (Sun Aug 2)
Last checked: 2026-08-01 UTC (26th check, 4th of day)
