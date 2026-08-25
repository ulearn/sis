Issue 48 Attendance Class Assignment Fassina Galbusera - 39th check Mon 3 Aug 2026 UTC 2nd today

Root Cause: UNCHANGED. 4 items open.
BC24630 GE AM Plus Jun29-Jul10 bk17857 Fassina: active=true 24d stale
BC24631 GE AM Plus Jun29-Jul10 bk17856 Galbusera: active=true 24d stale
Bk17856 Galbusera: CONFIRMED confirmed=false amount_paid=EUR 339.90 0 pmts linked
Bk17857 Fassina: CONFIRMED confirmed=false amount_paid=EUR 339.90 0 pmts linked
Orphan pmts 16988+16989 EUR 339.90 each booking_id=null coordinate with Issue 1

Fix Recipe - NOT YET RUN
UPDATE booking_courses SET active=false WHERE id IN (24630,24631);
UPDATE payments SET booking_id=17856 WHERE id=16988;
UPDATE payments SET booking_id=17857 WHERE id=16989;

Risk: Data hygiene+Attendance. Reversible. Coordinate with Issue 1.
Last checked: 2026-08-03 UTC (39th hourly check, 2nd today)