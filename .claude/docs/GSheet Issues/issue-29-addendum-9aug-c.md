Issue 29 and 15 - Saikhantes Shagdarsuren: service_end expired / Jan 12 artefact - 64th check Sun 9 Aug 2026 UTC
Sheet row: 30

STATUS: UNCHANGED. Data confirmed via Issue 15 fresh query this run.

ROOT CAUSE (confirmed):
Booking 18151 (Saikhantes Shagdarsuren): service_end = 2026-08-07, expired 2 days ago.
BC 24925 (AY Afternoon, 2026-03-09 to 2026-10-02): active=true.
CONFIRMED, confirmed=true, EUR 1,339.20 fully paid.
Jan 12 start date: Fidelo migration artefact. SIS restart 2026-03-09 is correct.

FIX RECIPE (NOT YET RUN):
Same as Issue 15 (issue-15-addendum-9aug-c.md):
  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

Note: Jan 12 phantom date is a display artefact only; BC 24925 start date 2026-03-09 is correct. No further action needed.

RISK: bookings/data-hygiene | Reversible: yes | Blast: 1 booking.
STATUS: NOT RUN. See Issue 15 (row 16).
Last checked: 2026-08-09 UTC (64th check)
