Issue 21 Maurivan Kuhl (10th check Fri 31 Jul 2026)

Reporter: PG | Area: Booking/Class | Sheet row: 22

Root cause verified live Fri 31 Jul 2026 UTC unchanged
Booking course 1604 (Morning General booking 1461 student 912 Maurivan Kuhl): active=true
Course ended Jul 3 2026 28 days stale
No class assignment anomaly present purely cosmetic

Fix recipe NOT YET RUN
UPDATE booking_courses SET active=false WHERE id=1604
SELECT id,name,active,end_date FROM booking_courses WHERE id=1604

Risk: data-hygiene cosmetic reversible blast-radius 1 BC record
Status: Fix NOT RUN 28 days stale cosmetic 10 checks
Last checked: Fri 31 Jul 2026 UTC