# Issue 8 — Stale Booking Courses (Addendum 27 Jul 2026)
Reporter: KC/Various | Area: Bookings / Class | Sheet row: 9

Status (10th check, Mon 27 Jul 2026 UTC): UNCHANGED — staleness counters updated

Evidence:
- Booking courses 1482, 1485, 1602 (Academic Year, ended 19 Dec 2025): 220 days stale, active = true
- Booking courses 1483, 1486 (Academic Year, ended 13 Feb 2026): 164 days stale, active = true
- Booking courses 1484, 1487, 1603 (Academic Year, ended 5 Jun 2026): 52 days stale, active = true
- Certificate issue (Diego, Aurora, Pedro): RESOLVED Jun 2026

Fix Recipe (NOT YET RUN):
  UPDATE BookingCourse SET active = false, updatedAt = NOW()
  WHERE id IN (1482, 1483, 1484, 1485, 1486, 1487, 1602, 1603);

Risk: Low. Cosmetic data hygiene. Fully reversible. No financial or document impact.
Status: OPEN. 10th check Mon 27 Jul 2026 UTC. Fix NOT RUN.
