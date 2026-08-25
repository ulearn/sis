Issue 16 - Melie Villard / Bed 66 Stale Booking Accommodations
Reporter: KC | Area: Booking / Accommodation | Sheet row: 17

Symptom: 4 stale BAs on bed 66 remain active past end dates. Bed free since 9 Aug but appears occupied.

Root cause (evidence)
- BA 11216 (booking 46, bed 66): ended 2026-05-09 -- 100 days stale
- BA 11158 (booking 100, bed 66): ended 2026-05-17 -- 92 days stale
- BA 11282 (booking 17897, Melie Villard, bed 66): ended 2026-06-05 -- 73 days stale
- BA 11361 (booking 18190, bed 66): ended 2026-08-09 -- 8 days stale
- Bed 66: no active BA after 2026-08-09 -- free but appears occupied in system

Fix recipe -- NOT YET RUN
  UPDATE BookingAccommodation SET active=false WHERE id IN (11216, 11158, 11282, 11361);
  SELECT id, active, endDate FROM BookingAccommodation WHERE id IN (11216, 11158, 11282, 11361);
  SELECT id, active FROM BookingAccommodation WHERE bedId=66 AND active=true;

Risk: Bookings/accommodation -- reversible. Blast radius: bed 66 only; 4 past-stay records.
Status: Open -- fix NOT RUN.
Last checked: 2026-08-17 UTC (29th check)