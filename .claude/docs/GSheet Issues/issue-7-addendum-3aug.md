# Issue 7 — Sofiia Korkishchenko BK17909 (21st check, 1st on Aug 3)
Sheet row: 8 | Reporter: AC | Area: Booking

Symptom
Cancelled booking 17909 has confirmed=true; booking course 24693 still active.

Root cause (Mon 3 Aug 2026 UTC):
- Booking 17909 (Sofiia Korkishchenko, student 768): status=CANCELLED, confirmed=true — anomaly, 47 days since last update (Jun17).
- Amount open = EUR 727.50, amount paid = EUR 0 — no payments linked.
- Booking course 24693 (Renewal Academic Year PM, May25-Nov13 2026): active=true — booking is CANCELLED, BC should be deactivated.
- State unchanged from 2aug. Fix NOT RUN.

Fix recipe (NOT YET RUN):

Step 1 — Clear confirmed flag on cancelled booking:
  UPDATE bookings SET confirmed = false WHERE id = 17909;

Step 2 — Deactivate booking course for cancelled booking:
  UPDATE booking_courses SET active = false WHERE id = 24693;
  Verify: SELECT id, active FROM booking_courses WHERE booking_id = 17909;

Risk/category: bookings (data-hygiene) — reversible | blast radius: 1 student (Sofiia Korkishchenko)
Status: NOT RUN — 21st check, 1st on Mon 3 Aug 2026 UTC
