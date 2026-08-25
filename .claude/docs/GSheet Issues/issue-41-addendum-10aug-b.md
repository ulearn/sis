# Issue 41 - Giampaolo Russo: City Centre Apartment Bed Unassigned (Mon 10 Aug - 2nd check)

Reporter: DG | Area: Booking / Accomm | Sheet row: 43

## Root Cause (39th check - Mon 10 Aug 2026 UTC)
Booking Accommodation 11392 (City Centre Apartment, Premium) has bed_id = null. Check-in 2026-09-06 (27 days).

Evidence:
- Booking Accommodation 11392 (booking 18180, Giampaolo Russo, student 14571):
  - accommodation_type = City Centre Apartment, room_type = Premium
  - start_date = 2026-09-06, end_date = 2026-09-14, fee = EUR 415.00
  - bed_id = null, active = true
- Booking Accommodation 11357 (same booking 18180):
  - accommodation_type = Host Family, room_type = Individual
  - start_date = 2026-08-02, end_date = 2026-09-06, bed_id = 178, active = true - correctly assigned
- Student arrives at Host Family 2026-08-02; transfers to apartment 2026-09-06 for 8 days

## Fix Recipe (NOT YET RUN)
Step 1: In SIS Admin -> Accommodation -> find available City Centre Apartment Premium beds for 2026-09-06 to 2026-09-14.
Step 2: Assign the chosen bed:
  -- NOT YET RUN - find the bed_id first, then:
  UPDATE booking_accommodations SET bed_id = <chosen_bed_id> WHERE id = 11392;

Step 3 - Verify:
  SELECT id, bed_id, start_date, end_date, accommodation_type FROM booking_accommodations WHERE id = 11392;
  -- bed_id should be non-null

## Risk
Category: bookings / accommodation | Reversible: yes | Blast radius: 1 student (Giampaolo Russo), check-in 2026-09-06

## Status: OPEN - bed_id null; check-in 27 days away; fix not run
Last checked: 2026-08-10 UTC (39th hourly check)