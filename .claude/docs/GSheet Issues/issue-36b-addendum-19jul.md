Issue 36b addendum 19 Jul 2026 (22nd check, 18th today)

URGENT: BA11265 (Kanna Hasegawa, bed 157) ended at 00:00 UTC Sun 19 Jul — still active (confirmed 04:08 UTC).
Deactivate first thing Monday 20 Jul morning.

ALL STALE BOOKING ACCOMMODATIONS (active=true, endDate passed) — confirmed fresh DB 04:08 UTC:
BA11156: no bed, ended 2 May 2026, 78 days stale — still active
BA11175: no bed, ended 29 Mar 2026, 112 days stale — still active
BA11264: bed 156, ended 9 May 2026, 71 days stale — still active
BA11265: bed 157, ended 19 Jul 2026 (TODAY 04h overdue), active=true — most urgent
BA11270: bed 38, ended 23 May 2026, 57 days stale — still active
BA11271: no bed, ended 7 May 2026, 73 days stale — still active

Fix recipe (NOT YET RUN):
UPDATE booking_accommodations SET active=false WHERE id IN (11156,11175,11264,11265,11270,11271);

Risk: data-hygiene; reversible; blast radius: 6 rows. BA11265 bed 157 highest priority.

Status: OPEN — NOT RUN as of Sun 19 Jul 2026 04:08 UTC
---
23rd check Sun 19 Jul 2026 UTC (19th today)

CONFIRMED UNCHANGED (fresh DB).
BA 11265 (Kanna Hasegawa, bed 157): end date 2026-07-19 (TODAY) — STILL active=true. Deactivate Mon morning.
BA 11264 (Léandre Le Coz-Brühmüller, bed 156): ended 2026-05-09, 71 days stale, still active.
BA 11156 (Hugo Tavernier, bed 0): ended 2026-05-02, 78 days stale, still active.
BA 11175 (Juan Carlos Guerra Núñez, bed 0): ended 2026-03-29, 112 days stale, still active.
BA 11270 (Neil Mc Mahon, bed 38): ended 2026-05-23, 57 days stale, still active.
BA 11271 (Salvatore Cumia, bed 0): start = end = 2026-05-07 (zero-length), 73 days stale, still active.

Fix recipe (NOT YET RUN):
UPDATE booking_accommodations SET active=false WHERE id IN (11156,11175,11264,11265,11270,11271);

Fix Not Run. Last checked: Sun 19 Jul 2026 UTC (23rd check, 19th today).

---
24th check Sun 19 Jul 2026 UTC (20th today)

CONFIRMED UNCHANGED (fresh DB).
BA 11265 (Kanna Hasegawa, bed 157): ended TODAY 2026-07-19 — STILL active = true — deactivate Mon morning.
BA 11264 (Léandre Le Coz-Brühmüller, bed 156): ended 2026-05-09, 71 days stale, active = true.
BA 11156 (Hugo Tavernier, bed 0): ended 2026-05-02, 78 days stale, active = true.
BA 11175 (Juan Carlos Guerra Núñez, bed 0): ended 2026-03-29, 112 days stale, active = true.
BA 11270 (Neil Mc Mahon, bed 38): ended 2026-05-23, 57 days stale, active = true.
BA 11271 (Salvatore Cumia, bed 0): start = end = 2026-05-07, 73 days stale, active = true.
Fix: UPDATE booking_accommodations SET active=false WHERE id IN (11265, 11264, 11156, 11175, 11270, 11271) — NOT RUN.
Fix Not Run. Last checked: Sun 19 Jul 2026 UTC (24th check, 20th today).

---
26th check Sun 19 Jul 2026 UTC (22nd today)

CONFIRMED UNCHANGED (fresh DB).
BA 11265 (Kanna Hasegawa, bed 157): ended TODAY 2026-07-19 — STILL active = true — deactivate Mon morning.
BA 11264 (Léandre Le Coz-Brühmüller, bed 156): ended 2026-05-09, 71 days stale, active = true.
BA 11156 (Hugo Tavernier, bed 0): ended 2026-05-02, 78 days stale, active = true.
BA 11175 (Juan Carlos Guerra Núñez, bed 0): ended 2026-03-29, 112 days stale, active = true.
BA 11270 (Neil Mc Mahon, bed 38): ended 2026-05-23, 57 days stale, active = true.
BA 11271 (Salvatore Cumia, bed 0): start = end = 2026-05-07, 73 days stale, active = true.
Fix: UPDATE booking_accommodations SET active=false WHERE id IN (11265, 11264, 11156, 11175, 11270, 11271) — NOT RUN.
Fix Not Run. Last checked: Sun 19 Jul 2026 UTC (26th check, 22nd today).

---
27th check Sun 19 Jul 2026 13:03 UTC (25th today)

CONFIRMED UNCHANGED (fresh DB).
Booking accommodation 11265 (Kanna Hasegawa, bed 157): ended TODAY 2026-07-19 — STILL active = true — deactivate Mon morning.
Booking accommodation 11264 (Léandre Le Coz-Brühmüller, bed 156): ended 2026-05-09, 71 days stale, active = true.
Booking accommodation 11156 (Hugo Tavernier, bed null): ended 2026-05-02, 78 days stale, active = true.
Booking accommodation 11175 (Juan Carlos Guerra Núñez, bed null): ended 2026-03-29, 112 days stale, active = true.
Booking accommodation 11270 (Neil Mc Mahon, bed 38): ended 2026-05-23, 57 days stale, active = true.
Booking accommodation 11271 (Salvatore Cumia, bed null): start = end = 2026-05-07, 73 days stale, active = true.
Fix: UPDATE bookingAccommodation SET active=false WHERE id IN (11265,11264,11156,11175,11270,11271) — NOT RUN.
Fix Not Run. Last checked: Sun 19 Jul 2026 13:03 UTC (27th check, 25th today).
