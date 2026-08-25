Issue 43 -- Jesus Ramirez Diaz stale BAs bed 83 (44th check, Tue 18 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accomm | Sheet row: 45

Symptom: Five booking accommodations on bed 83 active past end dates. New check-in Aug 30 (12 days).

Root cause (verified)
- BA 11239: ended 2026-05-24 (86d stale), fee EUR 1,050, claimStatus null
- BA 11168: ended 2026-06-20 (59d stale), fee EUR 700, claimStatus null
- BA 11285: ended 2026-07-05 (44d stale), fee = NULL, claimStatus null -- MUST CONFIRM FEE
- BA 11352: ended 2026-07-11 (38d stale), fee EUR 360, claimStatus null
- BA 11179: ended 2026-08-09 (9d stale), fee EUR 1,360, claimStatus null
- New student check-in to bed 83 on 2026-08-30 (12 days) -- urgency rising

Fix recipe (NOT YET RUN)
Step 0: Confirm BA 11285 fee before proceeding
Step 1: Deactivate all 5 stale BAs
  UPDATE booking_accommodations SET active = false, updated_at = NOW()
  WHERE id IN (11239, 11168, 11285, 11352, 11179);

Risk: accommodation data-hygiene | Reversible | BA 11285 fee null needs resolution first

Status: OPEN -- Fix NOT RUN | Last checked: Tue 18 Aug 2026 UTC (44th check)