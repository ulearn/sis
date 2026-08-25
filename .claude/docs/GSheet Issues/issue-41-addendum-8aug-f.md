Issue 41 -- Giampaolo Russo City Centre Apartment Unassigned (28th check, 8 Aug 2026)
Reporter: Diego/Staff | Area: Booking/Accommodation | Sheet row: 43

Student: Giampaolo Russo (14571), booking 18180 -- CONFIRMED, fully paid EUR 2,584.96

Booking Accommodation 11357 (host family, bed 178, 2 Aug to 6 Sep 2026, EUR 1,250):
  claimStatus = confirmed (OK)

Booking Accommodation 11392 (City Centre Apartment Premium, 6 Sep to 14 Sep 2026, EUR 415):
  bedId = null -- UNASSIGNED
  claimStatus = null
  29 days until check-in on 6 Sep 2026

Unchanged from 27th check.

Fix recipe (NOT YET RUN):
  1. Find available Premium bed in City Centre Apartment for 6-14 Sep 2026.
  2. Assign: UPDATE booking_accommodations SET bed_id = <BED_ID> WHERE id = 11392;
  3. Trigger provider claim notification from SIS.
  4. Send updated accommodation confirmation to student.

Risk: Accommodation | Reversible | Blast: 1 student, check-in 6 Sep 2026
Deadline: assign before 30 Aug 2026

Status: NOT RUN
Last checked: 2026-08-08 UTC (28th check)
