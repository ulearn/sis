# Issue 38 — Aug 3 Bank Holiday Missing (115th check, 26 Jul 2026 g)

Sheet row: 40

## Root cause (26 Jul 2026 UTC)
- school_closure: 9 records, no August BH
- 17 BCs start Aug 3 active (unchanged): BC 88,97,1755,1766,24627,24908,24956,24958,24959,24964,24970,24984,24999,25002,25003,25010,25016
- BC 25016 (Life Pass, bk 18238, ends Aug 2028): 2yr end intentional — DO NOT shunt
- 7 calendar days to Aug 3; 5 working days to Fri Jul 31 deadline

## Fix — NOT YET RUN
1. INSERT INTO school_closure (name,"startDate","endDate",note,"isPaidHoliday") VALUES ('August Bank Holiday','2026-08-03','2026-08-03','Bank Holiday 2026',true);
2. UPDATE booking_course SET "startDate"='2026-08-04' WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,24970,24984,24999,25002,25003,25010);
3. Verify all show startDate=2026-08-04.

## Risk
bookings; reversible; 16 students affected.

## Status
OPEN. Fix NOT RUN. Last checked: 26 Jul 2026 UTC (115th hrly)
