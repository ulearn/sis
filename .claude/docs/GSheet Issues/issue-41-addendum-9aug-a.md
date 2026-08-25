Issue 41 (29th check Sun 9 Aug 2026) -- Sheet row 43

Student: Giampaolo Russo (14571), booking 18180 -- CONFIRMED, fully paid EUR 2,584.96

Booking Accommodation 11392 (City Centre Apartment, Premium, Self Catering, 6 Sep to 14 Sep 2026, EUR 415):
  bed_id = null -- UNASSIGNED, claimStatus = null
  28 days to check-in (6 Sep 2026)
  Created 5 Aug 2026 -- unchanged from 28th check.

Host family BA 11357 (bed 178, 2 Aug to 6 Sep 2026, EUR 1,250): claimStatus = confirmed (OK)

Fix recipe (NOT YET RUN):
  1. Find available Premium bed in City Centre Apartment for 6-14 Sep 2026 (SIS admin -> Accommodation).
  2. UPDATE booking_accommodations SET bed_id = <BED_ID> WHERE id = 11392;
  3. Trigger provider claim notification from SIS admin.
  4. Send updated accommodation confirmation to student.

Risk: Accommodation. Reversible. Blast: 1 student. Deadline: assign before 30 Aug 2026.
Status: NOT RUN | Last checked: 2026-08-09 UTC (29th check)
