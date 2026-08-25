# Issue 21 — Maurivan Kuhl: stale booking course (12th Tue 4 Aug UTC)

Reporter: | Row: 22

Root cause (fresh Tue 4 Aug 2026 UTC — UNCHANGED)
- Booking course 1604 (Morning General, bk1461, student 912 Maurivan Kuhl): active=true — 32 days stale (ended Jul 3 2026).
- Booking 1461: CONFIRMED, confirmed=true, amountPaid=EUR 1509.60, amountOpen=EUR 0 — fully paid.

Fix recipe (NOT YET RUN)
  UPDATE booking_courses SET active = false WHERE id = 1604;
  SELECT id, name, active, end_date FROM booking_courses WHERE id = 1604;

Risk: bookings/data-hygiene | Reversible: yes | Blast: 1 booking course record
Status: OPEN — booking course 1604 stale 32 days. Fix NOT RUN.
Last checked: Tue 4 Aug 2026 UTC (12th check)
