# Issue 41 Addendum -- Fri 31 Jul 2026 (17th check)
Reporter: Diego | Area: Booking/Accommodation | Sheet row: 43
Student: Giampaolo Russo, student 14571, booking 18180

STATUS: CHECK-IN SUN AUG 2 (2 days from now) -- HOST FAMILY OK; CAPEL STILL ABSENT

## Evidence (live DB, 17th check Fri 31 Jul 2026 UTC)

Booking 18180: CONFIRMED, confirmed=true, fully paid EUR 2,584.96

Booking accommodation 11357 -- HOST FAMILY (no action needed):
  Bed 178 | 5 Claremont Close Glasnevin | Type: Host Family, Individual
  Start: 2026-08-02 | End: 2026-09-06 (5 weeks) | Active: true
  Check-in: Sunday 2 Aug 2026 (2 days) -- confirmed and active in DB.

Capel Street (Sep 6-14): still NO booking_accommodation record -- awaiting Diego.

Booking course 24956 (General English AM, Aug 3-Sep 11): in Issue 38 shunt list (start moves to Aug 4 once that fix runs).

## Fix Recipe (NOT YET RUN)

No action needed for host family check-in Sunday -- BA 11357 is active and correct.

Prerequisite for Capel: Diego to confirm Capel Street bed_id, room type, and weekly fee.

Step 1 -- Once Diego confirms Capel details (NOT YET RUN):
  INSERT INTO booking_accommodations (booking_id, accommodation_type, room_type, board, start_date, end_date, weeks, bed_id, fee, active) VALUES (18180, 'Apartment', [room_type], 'Self Catering', '2026-09-06', '2026-09-14', 1, [bed_id], [fee], true);

Step 2 -- Booking course 24956 shunt (NOT YET RUN):
  Covered by Issue 38 bulk recipe.

Risk: bookings/accommodation -- reversible. Blast radius: 1 booking accommodation record.
Status: NOT RUN. 17th check. Host family ready for Sun Aug 2. Capel missing -- needs Diego.
Last checked: Fri 31 Jul 2026 UTC (17th check)