# Issue 41 — Giampaolo Russo — City Centre Apartment Bed Unassigned
Reporter: Diego | Area: Booking / Accomm | Sheet row 43 | 45th hourly check Tue 11 Aug 2026 UTC

## Symptom
Student has two accommodation bookings. Host family correct. Apartment (Sep 6-14) has no bed_id.
Staff unable to assign via SIS.

## Root cause (live data, 11 Aug 2026)
- BA 11392 (Giampaolo Russo, student 14571): City Centre Apartment Premium
  start_date 2026-09-06, end_date 2026-09-14, active = true, bed_id = null
- BA 11357: bed_id = 178, Aug 2 – Sep 6 (host family) — correctly assigned
- Bed 168 (Capel Street, Apartment A1, Room 1, Bed A): 0 conflicting active bookings Sep 6-14
- 26 days until check-in (Sep 6, 2026)

## Fix recipe — NOT YET RUN

Step 1 — Assign bed 168 to BA 11392 (via SIS admin or):
  UPDATE booking_accommodations SET bed_id = 168 WHERE id = 11392;

Step 2 — Verify BA 11392 shows bed 168 in SIS admin and student accommodation view.

Step 3 — Notify Diego/staff that bed has been assigned.

Note: Re-verify bed 168 availability immediately before assigning — another booking could claim it.

## Risk
Category: bookings (accommodation) | Reversible: yes | Blast radius: single student, single bed

## Status
Unchanged since 10 Aug 2026. 26 days to check-in. Bed 168 still free. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC