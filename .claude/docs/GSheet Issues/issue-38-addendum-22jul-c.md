# Issue 38 — 42nd Hourly (Wed 22 Jul 2026 UTC)
Row 40. 115th check. UNCHANGED.

Aug BH Mon 3 Aug 2026: still absent from school_closure table. 12 days away. URGENT.
Oct BH Mon 26 Oct 2026: also absent.
Closure table has 9 records: Good Fridays 2026-2030 and Christmas 2026-2029 only.
Approx 202 BCs affected by Aug BH; 114 by Oct BH.

## Fix (NOT YET RUN)
INSERT into school_closure: name=August Bank Holiday, start_date=2026-08-03, end_date=2026-08-03
INSERT into school_closure: name=October Bank Holiday, start_date=2026-10-26, end_date=2026-10-26
After insert: verify affected BCs are extended correctly.

Status: OPEN. Last checked: Wed 22 Jul 2026 (42nd hrly, 115th check).