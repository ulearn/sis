# Issue 41 — Giampaolo Russo (108th check, 17 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accommodation | Sheet row: 43

## Symptom
Student has two accommodation types (host family and apartment); missing fees.

## Root cause (evidence, updated)
Student 14571 (Giampaolo Russo), Booking 18180: CONFIRMED, EUR 2,584.96 fully paid

SCA DUPLICATE — both still present:
- SCA 424: class 12, weekStart 2026-08-17 (TODAY), weekEnd 2026-09-11, BC 24956 — DUPLICATE (created 07:03 Aug 10)
- SCA 426: class 12, weekStart 2026-08-10, weekEnd 2026-09-11, BC 24956 — CORRECT (created 14:37 Aug 10)
- Both assign student to class 12; SCA 424 is the duplicate with an unusual weekStart of today
- Fix NOT RUN since Aug 10 when the duplicate was created

Accommodation status:
- BA 11357 (bed 178, host family): Aug 2 to Aug 15, fee EUR 1,250, active = true — ended 2 days ago, stale
- BA 11396 (bed 44, Jenny Manders): Aug 15 to Aug 22, fee = null — student currently here, fee missing 2 days
- BA 11397 (bed 89, Capel Street): Aug 22 to Sep 6, fee = null — check-in in 5 days, fee not set
- BA 11392 (no bed, CCA apartment): Sep 6 to Sep 14, fee = EUR 415 — bed not assigned, 20 days ahead

## Fix recipe (NOT YET RUN)

Step 1 — Delete SCA 424 (URGENT — duplicate, started today):
  DELETE FROM StudentClassAssignment WHERE id = 424;
  -- verify: SELECT id, classId, weekStart, weekEnd FROM StudentClassAssignment WHERE studentId = 14571;

Step 2 — Deactivate BA 11357 (ended 2 days ago):
  UPDATE BookingAccommodation SET active = false, updatedAt = NOW() WHERE id = 11357;

Step 3 — Set fee on BA 11396 (Aug 15-22, bed 44 — URGENT, student currently here):
  -- Confirm rate with Diego first
  UPDATE BookingAccommodation SET fee = [RATE], updatedAt = NOW() WHERE id = 11396;

Step 4 — Set fee on BA 11397 (Aug 22-Sep 6, bed 89 — check-in in 5 days):
  -- Confirm rate with Diego first
  UPDATE BookingAccommodation SET fee = [RATE], updatedAt = NOW() WHERE id = 11397;

Step 5 — Assign bed to BA 11392 (Sep 6-14, CCA apartment):
  -- Identify available CCA bed, then:
  UPDATE BookingAccommodation SET bedId = [BED_ID], updatedAt = NOW() WHERE id = 11392;

## Risk / Category
Money + bookings | Reversible | Blast radius: 1 student (3 BAs + 1 SCA)

## Status
OPEN — fix NOT RUN. SCA 424 duplicate active since today. BA 11396 fee null day 2. BA 11397 fee null check-in 5d.
Last checked: 2026-08-17 UTC (108th check)