Issue 1 Orphan Payments Various 3 Aug 2026 5th check today

Root cause confirmed 5th check today (101 days):
Payment 16988: EUR 339.90 booking_id=null xero_payment_id=null - matches Galbusera bk17856
Payment 16989: EUR 339.90 booking_id=null xero_payment_id=null - matches Fassina bk17857
Payment 17187: EUR 6151 transaction_id=D2026226 booking_id=null 101 days
Payment 4781: EUR 380 transaction_id=D20191404 legacy 2019 approx 7 years
BC24630 ended Jul10 active=true 24 days stale
BC24631 ended Jul10 active=true 24 days stale
Bk17856 CONFIRMED confirmed=false amount_paid=EUR 339.90 0 payments linked
Bk17857 CONFIRMED confirmed=false amount_paid=EUR 339.90 0 payments linked

Fix recipe NOT YET RUN:
UPDATE payments SET booking_id=17856 WHERE id=16988;
UPDATE payments SET booking_id=17857 WHERE id=16989;
UPDATE booking_courses SET active=false WHERE id IN (24630,24631);
Review payment 17187 EUR 6151 D2026226 in Xero - identify which booking
Review payment 4781 EUR 380 D20191404 legacy - likely write-off

Risk: money data-hygiene. Reversible. Coordinate with Issue 48.
OPEN. 136th overall 5th today Mon 3 Aug 2026 UTC. Fix NOT RUN.