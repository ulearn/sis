ISSUE 41 ADDENDUM — Fri 31 Jul 2026 (15th check) — HOST FAMILY CHECK-IN TOMORROW

Reporter: Diego | Area: Booking/Accommodation | Sheet row 43
Student: Giampaolo Russo, student 14571, booking 18180

STATUS: CHECK-IN TOMORROW (Sun Aug 2) — NO CHANGE FROM 14TH CHECK

EVIDENCE (live DB, 15th check)

Booking 18180: CONFIRMED, confirmed=true, fully paid EUR 2584.96

Booking accommodation 11357 — HOST FAMILY (correct, no action needed):
  Bed 178 | Property: Home, 5 Claremont Close Glasnevin
  Type: Host Family, Individual, Half Board
  Start: Aug 2, 2026 | End: Sep 6, 2026 (5 weeks) | Fee: EUR 1250 | Active: true
  Check-in is TOMORROW (Sun Aug 2)

Capel Street (Sep 6-14): still NO booking_accommodations record — waiting on Diego.

BC 24956 (General English AM, Aug 3-Sep 11): in Issue 38 shunt list (start -> Aug 4)

FIX RECIPE (NOT YET RUN)

Prerequisite: Diego to confirm Capel Street bed_id and fee.

Step 1 (once Diego confirms): Insert Capel Street booking_accommodation:
  INSERT INTO booking_accommodations
    (booking_id, accommodation_type, room_type, board, start_date, end_date, weeks, bed_id, fee, active)
  VALUES (18180, 'Apartment', [room_type], 'Self Catering', '2026-09-06', '2026-09-14', 1, [bed_id], [fee], true);

Step 2: Shunt BC 24956 start to Aug 4 — covered by Issue 38 bulk recipe.

RISK: bookings/accommodation — reversible. Blast radius: 1 booking.

STATUS: NOT RUN. 15th check — no change from 14th check.
Host family confirmed and ready. Capel: waiting on Diego.

Last checked: Fri 31 Jul 2026 ~15th hourly run UTC