Issue 48 — Class Assignment / Attendance (Addendum, 8 Aug 2026 — b)
Reporter: AC | Area: Attendance/classes | Sheet row: 50 | 73rd check Sat 8 Aug 2026 UTC

Root Cause (live data, 8 Aug 2026 UTC — NOT YET RUN)

Telmuun Enkhsaikhan (student 293): 6 stale active Booking Courses (max 512 days stale):
  BC 482 ended 2025-03-14, BC 483 ended 2025-07-11 (both active)
  BC 1609 ended 2025-12-19, BC 1610 ended 2026-01-09, BC 1611 ended 2026-03-06, BC 1612 ended 2026-05-01 (all active)
  Booking Accommodation 10779: ended 2025-01-19, active — 570 days stale

Ana Jessica Rosa de Paula Santos (student 766):
  Booking 1308: CANCELLED, confirmed=false, amountPaid=EUR 1530 (2 payments exist) — anomaly
  BC 1350: still active despite cancelled booking

Ariunsarnai Batbayar (student 1047):
  Booking 1605: PENDING, confirmed=false, EUR 0 of EUR 1509 — not visible in class assignment

Margherita Galbusera / Francesca Fassina:
  BCs 24630+24631 (ended 10 Jul 2026): active, 29 days stale (also Issue 1)

Fix Recipe (NOT YET RUN)

Step 1 — Deactivate Telmuun 6 stale BCs:
  UPDATE booking_courses SET active = false WHERE id IN (482, 483, 1609, 1610, 1611, 1612);

Step 2 — Deactivate Telmuun BA 10779:
  UPDATE booking_accommodations SET active = false WHERE id = 10779;

Step 3 — Investigate Ana Jessica (Neil decision needed):
  Booking 1308 CANCELLED + EUR 1530 paid. Check HubSpot deal for cancellation reason.
  After decision: UPDATE booking_courses SET active = false WHERE id = 1350;

Step 4 — Deactivate BCs 24630+24631:
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Risk: data-hygiene/bookings; reversible; Steps 1+2+4 safe, Step 3 needs Neil decision
Status: OPEN — Fix NOT RUN
Last checked: 2026-08-08 UTC (73rd check)
