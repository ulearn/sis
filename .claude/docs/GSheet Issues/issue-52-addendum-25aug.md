Issue 52 -- Fanny Scelles (BA11399 fee null, host email)

Reporter: AC | Area: Booking/Accomm | Sheet row: 54
Last checked: 2026-08-25 UTC (520th run)

SYMPTOM: Host email not auto-populated in accommodation template; BA11399 fee null.

ROOT CAUSE (current -- unchanged since 510th run)
- Booking 17843 (Fanny Scelles, student 14451): CONFIRMED, confirmed = true
- BA11267 (bed 23, 29 Aug to 4 Oct 2026): fee = EUR 3,840, active = true -- READY for arrival
- BA11399 (bed 54, 4 Oct to 19 Dec 2026): fee = null, active = true -- NOT YET SET (40d to Oct 4)
- Student ARRIVES IN 4 DAYS (29 Aug 2026) -- BA11267 is ready, BA11399 still needs fee

FIX RECIPE (NOT YET RUN)
Set fee on Booking Accommodation 11399:
  UPDATE booking_accommodation SET fee = <bed_54_weekly_rate x 11> WHERE id = 11399;
  (4 Oct to 19 Dec 2026 = 11 weeks; confirm rate with KC before running)
  Reference: BA11392 (Giampaolo, bed 54 adjacent) was fixed similarly -- fee = 415

Host email auto-population: separate code change, spec open (no ETA).

RISK: Data-hygiene -- fee null for future stay. Reversible.
NOTE: Arrival imminent (Aug 29). BA11267 confirmed ready. BA11399 is a Oct 4 move-in -- less urgent but needs setting.

STATUS: Fix NOT RUN.
