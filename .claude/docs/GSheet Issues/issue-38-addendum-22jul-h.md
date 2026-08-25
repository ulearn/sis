Issue 38 Addendum 22 Jul 2026 h
Reporter: PG | Area: Holidays / Bookings | Sheet row: 40
Last checked: Wed 22 Jul 2026 UTC (47th hourly, 120th total)

Status: Aug BH and Oct BH still absent. BC count revised to 12 (was 14). Table name fix: actual table is school_closures (plural).

Aug BH Mon 3 Aug 2026: 12 calendar days away. DB confirms 0 closures cover Aug 3.
BCs ending Aug 3-9 (active+confirmed): 12 (reduced from 14 at 46th check).
Oct BH 27 Oct 2026: DB confirms 0 closures cover it. 96 days away.

School closures present: Good Friday 2026, Christmas 2026-2030, Good Fridays 2027-2030 only.

Fix Recipe (NOT YET RUN)
Step 1: INSERT INTO school_closures (start_date,end_date,name,is_paid_holiday,created_at) VALUES (2026-08-03,2026-08-03,August Bank Holiday,false,NOW());
Step 2: INSERT INTO school_closures (start_date,end_date,name,is_paid_holiday,created_at) VALUES (2026-10-27,2026-10-27,October Bank Holiday,false,NOW());
Step 3: node dist/scripts/recompute-course-ends.js --from=2026-08-01 --to=2026-11-01 (confirm script name first)

Risk: bookings/closures | Reversible: yes | Blast radius: 12 BCs directly | Urgency: 12 days to Aug 3
Previous recipe: issue-38-addendum-22jul-g.md