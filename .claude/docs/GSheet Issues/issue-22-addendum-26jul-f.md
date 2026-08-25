Issue 22 - Edite Nunes (Addendum 26 Jul 2026 F) - Penultimate Window Tomorrow

Reporter: PG | Area: Booking / Class | Sheet row: 23

Root cause (verified Sun 26 Jul 2026 UTC - run 113)
- BC24991 General English AM Jul 13-Aug 7 2026: active=true, 0 class assignments - UNCHANGED
- BC24933 + BC24934 ended Jul 10 2026: both active=true - 16 days stale
- 10 school days missed Jul 14-25 weeks 1-2 - irrecoverable
- Penultimate window: Mon 27 Jul to Thu 31 Jul 2026 (5 school days)
- Final window: Mon Aug 4 to Fri Aug 7 (4 school days; Aug 3 = Bank Holiday)
- 9 school days remain in total

Fix recipe (NOT YET RUN)

Step 1: SIS admin > Classes > week beginning Mon 27 Jul 2026 > General English AM > assign Edite Nunes (Edith in SIS) booking course 24991.
Step 2: Deactivate stale booking courses:
  UPDATE booking_courses SET active = false WHERE id IN (24933, 24934);

Risk: bookings / class attendance; reversible; CRITICAL - penultimate window starts tomorrow

Status: UNRESOLVED - fix NOT RUN. 10 days lost, 9 remain. Last checked: Sun 26 Jul 2026 UTC run 113