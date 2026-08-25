ISSUE 41 ADDENDUM — Fri 31 Jul 2026 (16th check) — HOST FAMILY CHECK-IN TOMORROW

Reporter: Diego | Area: Booking/Accommodation | Sheet row 43
Student: Giampaolo Russo, student 14571, booking 18180

STATUS: CHECK-IN TOMORROW (Sun Aug 2, 2026) — HOST FAMILY OK; CAPEL STILL ABSENT

EVIDENCE (live DB, 16th check)

Booking 18180: CONFIRMED, confirmed=true, fully paid EUR 2584.96

Booking accommodation 11357 — HOST FAMILY (ready, no action needed):
  Bed 178 | Property: Home, 5 Claremont Close Glasnevin
  Type: Host Family, Individual
  Start: 2026-08-02 | End: 2026-09-06 (5 weeks) | Active: true
  Check-in TOMORROW (Sun Aug 2) — accommodation confirmed and in DB.

Capel Street (Sep 6-14): still NO booking_accommodations record — waiting on Diego confirmation.

BC 24956 (General English AM, Aug 3-Sep 11): in Issue 38 shunt list (start -> Aug 4).

FIX RECIPE (NOT YET RUN)

No action needed for host family check-in tomorrow — BA 11357 is active and correct.

Prerequisite for Capel: Diego to confirm Capel Street bed_id and weekly fee.

Step 1 (once Diego confirms Capel details): Insert Capel booking_accommodation:
  INSERT INTO booking_accommodations
    (booking_id, accommodation_type, room_type, board, start_date, end_date, weeks, bed_id, fee, active)
  VALUES (18180, 'Apartment', [room_type from Diego], 'Self Catering', '2026-09-06', '2026-09-14', 1, [bed_id from Diego], [fee from Diego], true);

Step 2: Shunt BC 24956 start to Aug 4 — covered by Issue 38 bulk recipe.

RISK: bookings/accommodation — reversible. Blast radius: 1 booking accommodation record.

STATUS: NOT RUN. 16th check.
Host family is confirmed and ready for tomorrow check-in.
Capel Street (Sep 6-14) still missing — needs Diego input before it can be inserted.

Last checked: Fri 31 Jul 2026 ~16th hourly run UTC
