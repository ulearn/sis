Issue 41 -- Giampaolo Russo City Centre Apt Unassigned (27th check, 8 Aug 2026)
Reporter: Diego/Staff | Area: Booking/Accommodation | Sheet row: 43

Student: Giampaolo Russo (14571), booking 18180 -- CONFIRMED, fully paid EUR 2,584.96.

BA 11357 (host family, bed 178, 2 Aug - 6 Sep 2026, EUR 1,250): claimStatus=confirmed (OK)
BA 11392 (City Centre Apartment Premium, 6 Sep - 14 Sep 2026, EUR 415): bedId=null, claimStatus=null -- UNASSIGNED
29 days until check-in on 6 Sep 2026. Unchanged from previous check.

Fix (NOT YET RUN):
1. Find available Premium bed in City Centre Apartment for 6-14 Sep 2026.
2. Assign bed: UPDATE booking_accommodations SET bed_id = <BED_ID> WHERE id = 11392;
3. Trigger provider claim notification from SIS.
4. Send updated accommodation confirmation to Giampaolo Russo.

Category: Accommodation | Reversible: Yes | Blast: 1 student, check-in 6 Sep
Deadline: assign before 30 Aug 2026
Last checked: 2026-08-08 UTC (27th check)