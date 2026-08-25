Issue 19 Mai Lan Chu (Fri 31 Jul 2026)

Reporter: PG | Area: Booking/Class | Sheet row: 20

Root cause verified live Fri 31 Jul 2026 UTC unchanged
Booking course 89 (Morning IELTS booking 83): active=true ended May 22 2026 70 days stale
Booking course 90 (Private Lessons booking 83): active=true ended May 22 2026 70 days stale
Both ran Apr 13 to May 22 2026

Fix recipe NOT YET RUN
UPDATE booking_courses SET active=false WHERE id IN (89,90) AND active=true
SELECT id,name,active,end_date FROM booking_courses WHERE id IN (89,90)

Risk: data-hygiene cosmetic reversible blast-radius 2 BC records
Status: Fix NOT RUN 70 days stale cosmetic
Last checked: Fri 31 Jul 2026 UTC