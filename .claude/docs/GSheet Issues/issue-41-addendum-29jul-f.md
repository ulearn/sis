Issue 41 -- Giampaolo Russo -- Capel Street BA Missing (157th check, 29 Jul 2026)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Symptom
=======
Student booked Host Family (Aug 2 - Sep 6) and Capel Street apartment (Sep 6 - Sep 14).
Host family BA confirmed present; Capel Street BA still absent.

Root cause (DB, 29 Jul 2026 UTC -- 157th hourly check)
======================================================
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, confirmed = true.
- BA 11357: Host Family, bed 178, Aug 2 - Sep 6 2026, active = true, fee EUR 1250. Correct.
- Capel Street BA (Sep 6 - Sep 14): ABSENT -- no second BA on booking 18180. UNCHANGED.
- BC 24956 (General English AM, bk 18180): start = 2026-08-03, active = true -- needs Issue 38 shunt to Aug 4.
- Host family check-in: Sun 2 Aug 2026 (4 days away). NOT BLOCKED by Capel issue.

Fix recipe -- NOT YET RUN
=========================

Step 1 -- Add Capel Street BA via SIS admin UI (preferred)
NOT YET RUN:
  Booking 18180 -> Add Accommodation -> Capel Street / Apartment
  Dates: Sep 6 2026 - Sep 14 2026 (1 week + 1 night)
  Bed: confirm from Capel Street availability
  Fee: confirm from booking invoice / HubSpot deal

Step 1b -- Find available Capel beds (if needed)
NOT YET RUN:
  SELECT b.id, b.name, b.room_type, a.name AS property
  FROM beds b JOIN accommodations a ON a.id = b.accommodation_id
  WHERE a.name ILIKE '%capel%'
    AND b.id NOT IN (
      SELECT bed_id FROM booking_accommodations
      WHERE start_date < '2026-09-14' AND end_date > '2026-09-06' AND active = true);
  Then insert booking_accommodation for booking 18180 with the selected bed.

Step 2 -- Shunt BC 24956 for Aug BH (part of Issue 38 batch)
NOT YET RUN -- included in Issue 38 step 2:
  UPDATE booking_courses SET start_date = '2026-08-04', updated_at = NOW()
  WHERE id = 24956 AND start_date = '2026-08-03';

Step 3 -- Verify
NOT YET RUN:
  SELECT id, accommodation_type, start_date, end_date, active, fee
  FROM booking_accommodations WHERE booking_id = 18180;
  Should return 2 rows: BA 11357 (Host Family) + new Capel BA.

Risk / category
===============
Bookings / Accommodation. Reversible (DELETE new BA if wrong).
Host family check-in Sun Aug 2 not blocked. Capel BA needed before Sep 6.

Status
======
OPEN -- Fix NOT RUN. 157th check 29 Jul 2026 UTC.
Host family check-in Sun Aug 2 (4 days). Capel BA needed before Sep 6.

Last checked
============
2026-07-29 UTC