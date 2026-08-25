Issue 1 -- Orphan payments + stale booking courses/accommodations -- Addendum 21 Jul 2026 (25th hrly)

Reporter: NM | Area: Cleanup | Sheet row: 2

Root cause (84th check, Tue 21 Jul 2026 UTC):

Orphan payments (bookingId = null) -- 4 records, UNCHANGED:
- Payment 16988: EUR 339.90, type = one_time_or_initial -- 84 days (since 28 Apr 2026)
- Payment 16989: EUR 339.90, type = one_time_or_initial -- 84 days (since 28 Apr 2026)
- Payment 17187: EUR 6151, type = null -- 77 days (since 5 May 2026)
- Payment 4781: EUR 380, type = null -- legacy record (paidAt null)

Stale booking courses (active=true, endDate before 21 Jul 2026): 24,436 -- UNCHANGED
Stale booking accommodations (active=true, endDate before 21 Jul 2026): 11,175 -- UNCHANGED

Fix recipe (NOT YET RUN):
1. Identify correct bookings for payments 16988, 16989, 17187, 4781 and link them
   UPDATE payment SET booking_id = ? WHERE id IN (16988, 16989, 17187, 4781)
2. Run booking course deactivation:
   UPDATE booking_courses SET active = false WHERE active = true AND end_date < CURRENT_DATE
3. Run booking accommodation deactivation:
   UPDATE booking_accommodations SET active = false WHERE active = true AND end_date < CURRENT_DATE

Risk: data-hygiene. BC/BA deactivation is reversible. Payment linking needs correct booking IDs verified first.
Open -- Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC (25th hourly)
