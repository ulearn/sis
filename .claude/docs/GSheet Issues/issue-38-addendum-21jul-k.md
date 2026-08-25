Issue 38 addendum 39th hourly Tue 21 Jul 2026 UTC (112th check)

August Bank Holiday Mon 3 Aug 2026: STILL absent from school_closures. 13 calendar days away. URGENT.
October Bank Holiday Mon 26 Oct 2026: STILL absent.
School closures table: 9 records (Good Fridays 2026-2030, Christmas 2026-2029). Zero bank holidays.
Fresh count: 202 active booking courses span Aug 3 2026.

Fix NOT YET RUN. See recipe in issue-38-addendum-21jul-j.md
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at) VALUES (August Bank Holiday, 2026-08-03, 2026-08-03, true, NOW());
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at) VALUES (October Bank Holiday, 2026-10-26, 2026-10-26, true, NOW());
