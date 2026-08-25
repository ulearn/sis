ISSUE 41 — Giampaolo Russo: host family + Capel St accomm
==========================================================

Area: Booking/Accommodation  Row: 43  Checked: 2026-08-01 UTC (24th hrly)

SYMPTOM
-------
Student booked host family (Aug 2–Sep 6) and Capel Street premium room (Sep 6–14). Neither in Matching. Arriving this weekend.

ROOT CAUSE / DB STATE (confirmed 2026-08-01 UTC, 2nd check)
------------------------------------------------
- Booking 18180 (s14571 Giampaolo Russo): confirmed=true, paid=EUR 2584.96, open=0.
- BC24956 (General English AM, Aug 3–Sep 11): active=true. Will move to Aug 4 when Issue 38 runs.
- BA11357 (host family, bed 178 Claremont Close): startDate=2026-08-02 (Sun), endDate=2026-09-06, active=true, fee=EUR 1250.
- Capel Street BA (Sep 6–14): ABSENT from DB — not yet added.
- DISCREPANCY: student may arrive Sat 1 Aug but BA shows Aug 2. Neil must confirm with Diego tonight.

FIX RECIPE (NOT YET RUN)
------------------------

Step 1 — Confirm arrival date with Diego (TONIGHT):
  Ask Diego: does Giampaolo arrive Sat 1 Aug or Sun 2 Aug?
  If Sat 1 Aug (NOT YET RUN):
    UPDATE booking_accommodation SET start_date = '2026-08-01' WHERE id = 11357;

Step 2 — Add Capel Street BA (pending Diego: bed ID + fee):
  INSERT INTO booking_accommodation (booking_id, bed_id, start_date, end_date, active, fee, created_at, updated_at)
  VALUES (18180, <BED_ID>, '2026-09-06', '2026-09-14', true, <FEE>, NOW(), NOW());

Step 3 — Verify:
  SELECT id, bed_id, start_date, end_date, active, fee
  FROM booking_accommodation WHERE booking_id = 18180 ORDER BY start_date;
  -- Expected: 2 rows (BA11357 host family + new Capel St BA)

RISK
----
Category: bookings/accommodation. Student arriving imminently. Reversible: yes. Blast radius: 1 student.

STATUS: OPEN — CHECK-IN THIS WEEKEND (student arriving today or tomorrow)
Last checked: 2026-08-01 UTC (2nd check of day)