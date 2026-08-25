Issue 41 -- Giampaolo Russo -- Capel Street BA Missing (158th check, 29 Jul 2026)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

Symptom
=======
Student booked Host Family (Aug 2-Sep 6) and Capel Street apartment (Sep 6-Sep 14).
Host family BA confirmed present; Capel Street BA still absent from SIS.

Root cause (DB, 29 Jul 2026 UTC -- 158th hourly check)
=======================================================
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, confirmed = true.
- Booking accommodation 11357: Host Family, bed 178, Aug 2-Sep 6 2026, active = true, fee EUR 1250. Correct.
- Capel Street BA (Sep 6-Sep 14): ABSENT -- only 1 accommodation record on booking 18180. UNCHANGED.
- Booking course 24956 (General English AM, booking 18180): start = 2026-08-03 -- needs Issue 38 shunt to 2026-08-04.
- Host family check-in: Sun 2 Aug 2026 (4 days). Not blocked by Capel absence.

Fix recipe -- NOT YET RUN
=========================

Step 1 -- Add Capel Street BA via SIS admin UI (preferred)
NOT YET RUN:
  Booking 18180 -> Add Accommodation -> Capel Street / Apartment
  Dates: 2026-09-06 to 2026-09-14 (1 week + 1 night)
  Confirm bed from Capel Street availability (see Step 1b)
  Confirm fee from booking invoice or HubSpot deal

Step 1b -- Find available Capel beds (run first if bed not known)
NOT YET RUN:
  SELECT b.id, b.name, b.room_type, a.name AS property
  FROM beds b JOIN accommodations a ON a.id = b.accommodation_id
  WHERE a.name ILIKE '%capel%'
    AND b.id NOT IN (
      SELECT bed_id FROM booking_accommodations
      WHERE start_date < '2026-09-14' AND end_date > '2026-09-06' AND active = true);

Step 2 -- Shunt BC 24956 for Aug Bank Holiday (part of Issue 38 batch)
NOT YET RUN -- included in Issue 38 Step 2:
  UPDATE booking_courses SET start_date = '2026-08-04', updated_at = NOW()
  WHERE id = 24956 AND start_date = '2026-08-03';

Step 3 -- Verify
NOT YET RUN:
  SELECT id, bed_id, start_date, end_date, active, fee
  FROM booking_accommodations WHERE booking_id = 18180;
  Expect 2 rows: BA 11357 (Host Family) + new Capel BA.

Risk / category
===============
Bookings/Accommodation -- reversible (DELETE new BA if wrong).
Host family check-in Sun Aug 2 not blocked. Capel BA needed before Sep 6.

Status
======
OPEN -- Fix NOT RUN. 158th check 29 Jul 2026 UTC.
Host family check-in Sun Aug 2 (4 days). Capel BA needed before Sep 6.

Last checked
============
2026-07-29 UTC