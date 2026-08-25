# Issue 41 Addendum -- Fri 31 Jul 2026 (18th check)
Reporter: Diego | Area: Booking / Accommodation | Sheet row: 43
Student: Giampaolo Russo, student 14571, booking 18180

STATUS: CHECK-IN TOMORROW Sun Aug 2 -- HOST FAMILY OK; CAPEL STILL ABSENT

## Evidence (live DB, 18th check Fri 31 Jul 2026 UTC)

Booking 18180: CONFIRMED, confirmed=true, fully paid EUR 2,584.96

Booking accommodation 11357 -- HOST FAMILY (no action needed):
  Bed 178 | 5 Claremont Close Glasnevin | Type: Host Family, Individual
  Start: 2026-08-02 | End: 2026-09-06 (5 weeks) | Active: true
  Check-in: TOMORROW Sunday 2 Aug 2026 -- confirmed and active in DB.

Capel Street (Sep 6-14): still NO booking_accommodation record -- awaiting Diego.

Booking course 24956 (General English AM, Aug 3-Sep 11): in Issue 38 shunt list
  (start date moves to Aug 4 once Issue 38 fix runs tonight).

## Fix Recipe (NOT YET RUN)

No action needed for host family check-in tomorrow -- BA 11357 active and correct.

Prerequisite for Capel: Diego to confirm Capel Street bed_id, room type, weekly fee.

Step 1 -- Once Diego confirms Capel details (NOT YET RUN):
  INSERT INTO booking_accommodations
    (booking_id, accommodation_type, room_type, board, start_date, end_date, weeks, bed_id, fee, active)
  VALUES (18180, 'Apartment', [room_type], 'Self Catering', '2026-09-06', '2026-09-14', 1, [bed_id], [fee], true);

Step 2 -- Booking course 24956 shunt: covered by Issue 38 bulk recipe.

Risk: bookings / accommodation -- reversible. Blast radius: 1 booking accommodation record.
Status: NOT RUN. 18th check. Host family ready for tomorrow Sun Aug 2. Capel missing -- needs Diego.
Last checked: Fri 31 Jul 2026 UTC (18th check)