# Issue 8 — Stale BCs (Diego/Aurora/Pedro/Cibele) — 37th check

Reporter: AC | Sheet row: 9 | Last checked: 2026-08-23 UTC

## Root Cause (no change since 36th Sat 22 Aug)
All 11 BCs still active — Prisma query 2026-08-23 UTC:

Diego (student 840): BC 1482 ended 2025-12-19 247d ILEP 0318/0003 0 SCAs; BC 1483 ended 2026-02-13 191d ILEP 0318/0003 0 SCAs; BC 1484 ended 2026-06-05 79d ILEP 0318/0021 1 SCA (verify)
Aurora (student 841): BC 1485 ended 2025-12-19 247d ILEP 0318/0003 0 SCAs; BC 1486 ended 2026-02-13 191d 0 SCAs; BC 1487 ended 2026-06-05 79d ILEP 0318/0003 2 SCAs (verify)
Cibele (student 842): BC 1488 ended 2025-09-19 339d no ILEP 0 SCAs; BC 1489 ended 2025-12-19 247d 0 SCAs; BC 1490 ended 2026-02-13 191d 0 SCAs
Pedro (student 911): BC 1602 ended 2025-12-19 247d ILEP 0318/0011 0 SCAs; BC 1603 ended 2026-06-05 79d ILEP 0318/0012 2 SCAs (verify)

## Fix Recipe (NOT YET RUN)
Step 1: UPDATE "BookingCourse" SET active = false WHERE id IN (1482,1483,1485,1486,1488,1489,1490,1602);
Step 2: Verify SCAs on 1484,1487,1603 then deactivate if historical.
Step 3: Regenerate ILEP certs for Diego, Aurora, Pedro.
Undo: UPDATE "BookingCourse" SET active = true WHERE id IN (1482,1483,1484,1485,1486,1487,1488,1489,1490,1602,1603);

## Risk
Data hygiene. Reversible. Medium risk on 1484/1487/1603 (have SCAs).

## Status
Fix NOT RUN. Max 339d (BC 1488). 11 stale BCs.
Last checked: 2026-08-23 UTC (37th check).