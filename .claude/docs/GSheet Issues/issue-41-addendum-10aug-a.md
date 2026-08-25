# Issue 41 — Giampaolo Russo BA 11392: Bed Null (37th check)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

## Root Cause (37th check — Mon 10 Aug 2026 UTC)
Unchanged from 36th check (9 Aug).

- BA 11392 (Giampaolo Russo, City Centre Apartment Premium):
  bedId = null
  startDate = 2026-09-06, endDate = 2026-09-14
  fee = EUR 415.00, active = true
- Booking 18180: confirmed=true, EUR 2,584.96 paid, EUR 0 open
- 27 days until check-in (Sep 6)
- Per prior check (9aug-f): beds 168, 177, 194 were free — re-verify before assigning

## Fix Recipe (NOT YET RUN)

Step 1 — Re-verify beds 168/177/194 free for Sep 6-14:
  SELECT ba."bedId", ba."startDate", ba."endDate", ba.active
  FROM "BookingAccommodation" ba
  WHERE ba."bedId" IN (168, 177, 194)
    AND ba.active = true
    AND ba."startDate" < '2026-09-14'
    AND ba."endDate" > '2026-09-06';
  -- 0 rows = all free; rows = those beds are taken

Step 2 — Assign free bed (replace BED_ID with 168, 177, or 194):
  UPDATE "BookingAccommodation"
  SET "bedId" = BED_ID, "updatedAt" = NOW()
  WHERE id = 11392;

Step 3 — Verify:
  SELECT id, "bedId", "startDate", "endDate" FROM "BookingAccommodation" WHERE id = 11392;
  -- Expected: bedId = BED_ID, startDate=2026-09-06, endDate=2026-09-14

## Risk / Category
Category: accommodation | Reversible: yes | Blast radius: 1 student (Giampaolo), 27 days to check-in

## Status: Open — 27 Days to Sep 6 Check-in
Last checked: 2026-08-10 UTC (37th hourly check)