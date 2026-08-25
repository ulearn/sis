Issue 41: Giampaolo Russo Dual Accommodation (50th check, 12 Aug 2026)
Reporter: KC | Sheet row: 43

Wed 12 Aug 2026 UTC. 50th check. No change since 49th. BA 11392 bedId still null. Bed 168 still free.

Root Cause:
- BA 11392 (Giampaolo Russo, student 14571): City Centre Apartment Premium, 6-14 Sep 2026
  bedId = null (not yet assigned), fee = EUR 415 (confirmed), active = true
- BA 11357 (host family, bed 178, 2 Aug to 6 Sep 2026): correctly assigned, first period OK
- Bed 168 (property A1): confirmed FREE for Sep 6-14 (no conflicting BAs)
- 25 days to Sep 6 check-in

Fix Recipe (NOT YET RUN):
Step 1: Confirm with Karen or Diego that property A1 = correct city centre apartment for Giampaolo.
Step 2: UPDATE booking_accommodations SET bed_id = 168 WHERE id = 11392;
Verify: SELECT id, bed_id, fee, start_date, end_date FROM booking_accommodations WHERE id = 11392;

Risk: accommodation | Reversible: yes | Blast radius: 1 BA, 1 student
Status: OPEN - bedId null; fee EUR 415 confirmed; bed 168 free; 25 days to check-in. Fix NOT RUN.
Last checked: Wed 12 Aug 2026 UTC (50th check)