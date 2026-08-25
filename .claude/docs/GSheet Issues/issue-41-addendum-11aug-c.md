# Issue 41 Addendum 11 Aug 2026-c (47th check)

Tue 11 Aug 2026 UTC. No change since 46th.

## Current State

- BA 11392 (Giampaolo Russo, student 14571): City Centre Apartment Premium, 6-14 Sep 2026, bedId = null, fee = 415
- BA 11357 (host family, bed 178): 2 Aug-6 Sep 2026, active, fee = 1,250 -- first period correct
- Bed 168 (property A1, Room 1): CONFIRMED FREE 6-14 Sep 2026
  - Busy beds during Sep 6-14 this run: 83, 161, 190, 38, 179, 88, 33, 87 -- bed 168 absent, confirmed free
  - Prior neighbour on bed 168: BA 11218 ends 5 Sep, next BA 32 starts 27 Sep -- gap covers 6-14 Sep
- 26 days until check-in (Sep 6)

## Fix (NOT YET RUN)

1. VERIFY: Confirm property A1 in SIS accommodation module = the correct Capel Street city centre apartment
2. Get room_id for bed 168: SELECT room_id FROM accommodation_beds WHERE id = 168;
3. Assign: UPDATE booking_accommodations SET bed_id=168, room_id=[result], updated_at=NOW() WHERE id=11392;

Risk: bookings/accommodation. Reversible. Single student. 26d to check-in.
Status: Open. Bed 168 free. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (47th check)