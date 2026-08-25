Issue 12 -- Stale BAs + Rakan BC 24697 stale (127th check, 8 Aug 2026)

Reporter: PG | Area: Booking / Accomm | Sheet row: 13 | Check: 127th hourly -- Sat 8 Aug 2026 UTC

SYMPTOM
3 original stale booking accommodations unchanged. New: Rakan Alghamdi (student 14444) added to issue; BC 24697 ended 31 Jul 2026, still active (8 days stale).

ROOT CAUSE (verified live, 8 Aug 2026)

Original 3 stale booking accommodations (unchanged):
- BA 11162 (booking 97, bed 179): ended 23 May 2026, active=true -- 76 days stale
- BA 11314 (booking 18002, bed 179): ended 6 Jun 2026, active=true -- 62 days stale
- BA 11319 (booking 18034, bed null): ended 31 May 2026, active=true -- 68 days stale

New: Rakan Alghamdi (student 14444, booking 17915)
- Booking 17915: CONFIRMED, confirmed=true, EUR 9,138.75 fully paid
- BC 24697 (Academic Year Morning, 6 Jul to 31 Jul 2026): active=true -- 8 days stale
- BC 25035 (General English Academic Year AM Plus, 3 Aug to 18 Dec 2026): active=true, current
- BA 11287 (bed 190, 4 Jul to 19 Dec 2026): active=true, current
- BC 24697 is the first segment of a split course; not deactivated when BC 25035 began 3 Aug.

Bernardo Hughes Pimentel (student 14524, booking 49) -- no anomaly
- BA 11213 current; BC 52 current.

FIX RECIPE (NOT YET RUN)

Step 1 -- Deactivate 3 original stale booking accommodations:
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id IN (11162, 11314, 11319);
  Verify: SELECT id, active, end_date FROM booking_accommodations WHERE id IN (11162, 11314, 11319);

Step 2 -- Deactivate Rakan stale BC 24697:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 24697;
  Verify: SELECT id, active, end_date FROM booking_courses WHERE id = 24697;

RISK
Category: data-hygiene. Reversible: yes. Blast radius: low.
Rakan BA 11287 and ongoing BC 25035 are unaffected.

STATUS
Open -- Fix NOT RUN. Last checked: Sat 8 Aug 2026 UTC (127th hourly run)
