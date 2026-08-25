Issue 16 Melie Villard (10th check Fri 31 Jul 2026)

Reporter: KC | Area: Booking/Accomm | Sheet row: 17

Root cause verified live Fri 31 Jul 2026 UTC unchanged
Booking accommodation 11282 (Melie Villard student 14498 bed 66): active=true
Date range: May 15 to Jun 5 2026 ended 56 days ago
Last DB update: Jun 5 2026 12:38 UTC

Fix recipe NOT YET RUN
UPDATE booking_accommodations SET active=false WHERE id=11282
SELECT id,active,start_date,end_date FROM booking_accommodations WHERE id=11282

Risk: data-hygiene cosmetic reversible blast-radius 1 BA record
Status: Fix NOT RUN 56 days stale cosmetic 10 checks
Last checked: Fri 31 Jul 2026 UTC