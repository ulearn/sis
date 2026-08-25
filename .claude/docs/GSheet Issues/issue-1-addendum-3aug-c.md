Issue 1 Orphan Payments - 134th check Mon 3 Aug 2026 UTC 3rd today

Root Cause: UNCHANGED. 4 orphan payments 99+ days.
Pmt 16988: EUR 339.90 booking_id=null xero_payment_id=null -- matches bk17856 Galbusera
Pmt 16989: EUR 339.90 booking_id=null xero_payment_id=null -- matches bk17857 Fassina
Pmt 17187: EUR 6151 booking_id=null transaction_id=D2026226 99 days unlinked
Pmt 4781: EUR 380 booking_id=null transaction_id=D20191404 legacy 2019 7 years
Bk17856 Galbusera: CONFIRMED confirmed=false amount_paid=339.90 0 pmts linked
Bk17857 Fassina: CONFIRMED confirmed=false amount_paid=339.90 0 pmts linked
BC24630 bk17857 ended Jul10: active=true 24d stale
BC24631 bk17856 ended Jul10: active=true 24d stale

Fix Recipe - NOT YET RUN
UPDATE payments SET booking_id=17856 WHERE id=16988;
UPDATE payments SET booking_id=17857 WHERE id=16989;
UPDATE booking_courses SET active=false WHERE id IN (24630,24631);
Review pmt 17187 EUR 6151 D2026226 in Xero
Review pmt 4781 EUR 380 2019 legacy

Risk: Money+Data hygiene. Reversible. Coordinate with Issue 48.
Last checked: 2026-08-03 UTC (134th hourly check, 3rd today)