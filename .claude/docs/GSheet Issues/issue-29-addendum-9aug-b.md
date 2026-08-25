Issue 29 and 15 - Saikhantes Shagdasuren: service_end expired - 63rd check Sun 9 Aug 2026 UTC
Sheet row: 30

ROOT CAUSE:
Cross-reference Issue 15 (row 16) - same booking 18151, same student.
service_end = 2026-08-07, expired 2 days ago.
BC 24925 (AY Afternoon): 2026-03-09 to 2026-10-02, active=true.
CONFIRMED, confirmed=true, EUR 1339.20 fully paid.

Original issue (Jan 12 start date): migration artefact from Fidelo.
Actual restart confirmed 2026-03-09 - correct in SIS.
Only live anomaly: service_end 2 days past expiry.

FIX RECIPE (NOT YET RUN):
Same as Issue 15 (issue-15-addendum-9aug-b.md):
  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

RISK: bookings/data-hygiene | Reversible: yes | 1 booking.
STATUS: NOT RUN. See Issue 15 (row 16) for full recipe.
Last checked: 2026-08-09 UTC (63rd check)