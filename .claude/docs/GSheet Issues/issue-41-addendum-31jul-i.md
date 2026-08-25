Issue 41 Addendum - Fri 31 Jul 2026 (20th check)
Reporter: Diego | Area: Booking/Accommodation | Sheet row: 43
Student: Giampaolo Russo, student 14571, booking 18180

STATUS: CHECK-IN TOMORROW SAT 1 AUG - BA ACTIVE (starts Aug 2 in DB); CAPEL STILL ABSENT

Evidence (live DB, 20th check Fri 31 Jul 2026 UTC)

Booking 18180: CONFIRMED, confirmed = true, fully paid EUR 2,584.96

Booking accommodation 11357 - HOST FAMILY:
  Bed 178 | Property 66 Home (Claremont Close Glasnevin) | Type: Host Family, Individual
  Start: 2026-08-02 (Sunday) | End: 2026-09-06 (5 weeks) | Active: true

  DISCREPANCY: Prior H column (run 19) claimed start_date was shifted to 2026-08-01 in DB.
  Live query this run still shows 2026-08-02 (Sunday).
  Student reportedly arrives Saturday 1 Aug 2026 per original issue.
  Neil to verify: if student arrives Sat 1 Aug, BA needs start_date corrected to 2026-08-01.

Capel Street apartment (Sep 6-14): NO booking_accommodation record - awaiting Diego.

BC 24956 (General English AM, Aug 3-Sep 11): in Issue 38 shunt list (moves to Aug 4 tonight).

Fix Recipe (NOT YET RUN)

Step 1 - BA start date correction (only if student arrives Sat 1 Aug):
  UPDATE booking_accommodations SET start_date = '2026-08-01' WHERE id = 11357;
  Only run after Neil confirms arrival date.

Step 2 - Capel Street BA (once Diego confirms bed_id, room_type, fee):
  INSERT INTO booking_accommodations
    (booking_id, accommodation_type, room_type, board, start_date, end_date, weeks, bed_id, fee, active)
  VALUES (18180, 'Apartment', '[room_type]', 'Self Catering', '2026-09-06', '2026-09-14', 1, [bed_id], [fee], true);

Step 3 - BC 24956 shunt: covered by Issue 38 bulk recipe Step 2.

Risk: bookings/accommodation | Reversible: Yes | Blast radius: 1 BA update; 1 BA insert

Status: Fix NOT RUN. 20th check Fri 31 Jul 2026 UTC.
CHECK-IN TOMORROW Sat 1 Aug. BA start = Aug 2 in DB vs Aug 1 reported - Neil must verify.
