# Issue 21 - Maurivan Kuhl: Double Class Assignment (A1 + A2 AM)

- Reporter: AC
- Area: Booking / Class
- Sheet row: 22

Symptom: Appearing in A1 AM & A2 AM WB 11.05.2026 - should only be in A2 AM.

Original root cause: SCA 132 added erroneously May11-Jun26 overlapping SCA 156 (A2 AM).

Original fix: RESOLVED Jun 2026 (SCA 132 deleted, confirmed absent Jun10 hourly check).

--- Housekeeping Finding (16 Jul 2026) ---

Original double-display issue: RESOLVED.

DB snapshot (live, 16 Jul UTC):
- Booking course 1604 (Morning General, Jan 05 to Jul 03 2026): ended 3 July - active = STILL true (13 days stale)
- Student class assignment 156 (class 8, A2 AM): weekEnd = 2026-07-02 - expired 14 days ago
- Booking 1461: Confirmed, EUR 1509.60 / 1509.60 fully paid

Fix recipe - housekeeping (NOT YET RUN):
  UPDATE booking_courses SET active = false WHERE id = 1604;

Verify first:
  SELECT id, name, end_date, active FROM booking_courses WHERE id = 1604;

Risk: data-hygiene only. Single record. Fully reversible. No financial or document impact.

Status: HOUSEKEEPING. Booking course 1604 stale 13 days. SCA 156 expired 14 days.
Last checked: 2026-07-16 THU UTC. Fix NOT RUN.