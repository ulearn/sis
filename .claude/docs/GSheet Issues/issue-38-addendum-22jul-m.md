Issue 38 - Missing Bank Holiday Closures (Addendum 22 Jul 2026 M)
Reporter: PG | Area: Holidays | Sheet row: 40

Root cause (55th hourly check, Wed 22 Jul 2026 UTC, 128th total):
- Fresh DB: 0 school_closure records between 22 Jul 2026 and 21 Dec 2026
- Next closure on record: Christmas 2026-12-21 to 2027-01-03 (id 7)
- August Bank Holiday Mon 3 Aug 2026: ABSENT — 12 calendar days away — URGENT
- October Bank Holiday Mon 27 Oct 2026: ABSENT — 96 calendar days away
UNCHANGED. Fix NOT RUN.

Fix recipe (NOT YET RUN):
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
VALUES (August Bank Holiday, 2026-08-03, 2026-08-03, true);
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
VALUES (October Bank Holiday, 2026-10-27, 2026-10-27, true);

Status: URGENT — Aug BH 12 days away. Fix NOT RUN. Last checked: Wed 22 Jul 2026 UTC.