Issue 12 — Stale BAs / Rakan + Massimiliano (Addendum, 8 Aug 2026 — b)
Reporter: KC | Area: Booking/Accomm | Sheet row: 13 | 128th check Sat 8 Aug 2026 UTC

Root Cause (live data, 8 Aug 2026 UTC — NOT YET RUN)

Massimiliano Cameran (student 91):
  Booking 97 (CONFIRMED, confirmed=false — anomaly):
    BA 11162: ended 2026-05-23, bed 179, 77 days stale, active
    BC 107 (Morning General): ended 2026-05-22, 78 days stale, 1 SCA (historical)
  Booking 18002 (CONFIRMED, confirmed=true):
    BA 11314: ended 2026-06-06, bed 179, 63 days stale, active
    BC 24793 (General English AM): ended 2026-06-05, 64 days stale, 1 SCA (historical)
  BK 97 confirmed=false is migration artefact; BK 18002 is the live booking.

Rakan Alghamdi (student 14444):
  BC 24697 (AY Morning, ended 31 Jul 2026): 8 days stale, 1 SCA (old course, expected)
  BC 25035 (General English Academic, 3 Aug-18 Dec 2026): 5 days since start, 0 SCAs — URGENT
  BA 11287 (bed 190, ends 19 Dec 2026): active, not stale — fine
  BC 25035 also in Issue 38 Aug-3 overdue list.

Bernardo Hughes Pimentel (student 14524): BC 52 + BA 11213 end 4 Sep, active, 1 SCA — no issue.

Fix Recipe (NOT YET RUN)

Step 1 URGENT — Assign class to Rakan BC 25035:
  SIS Admin > Student 14444 > Bookings > BC 25035 > Assign Class.
  (Also covered by Issue 38 bulk assignment.)

Step 2 — Deactivate Massimiliano stale BAs:
  UPDATE booking_accommodations SET active = false WHERE id IN (11162, 11314);

Step 3 — Deactivate Massimiliano stale BCs:
  UPDATE booking_courses SET active = false WHERE id IN (107, 24793);

Step 4 — Fix Massimiliano BK 97 confirmed=false (cosmetic, low priority):
  UPDATE bookings SET confirmed = true WHERE id = 97;

Risk: bookings/data-hygiene; reversible; Rakan BC 25035 is urgent
Status: OPEN — Fix NOT RUN
Last checked: 2026-08-08 UTC (128th check)
