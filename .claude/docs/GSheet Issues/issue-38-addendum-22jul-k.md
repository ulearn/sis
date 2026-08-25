Issue 38 - Bank Holidays Missing from school_closures
Reporter: various | Area: Holidays, Bookings etc. | Sheet row: 40 | Last checked: 2026-07-22 UTC

Symptom: August Bank Holiday (Mon 3 Aug 2026) and October Bank Holiday (Mon 27 Oct 2026) not in school_closures table.

Root Cause:
- DB query confirmed: 0 school_closure rows between 2026-07-22 and 2026-11-01.
- Most recent closure in DB: Good Friday 2030-04-19 (id 14).
- August Bank Holiday Mon 3 Aug 2026: absent — 12 calendar days away — URGENT.
- October Bank Holiday Mon 27 Oct 2026: absent — 96 calendar days away.
- Fix NOT RUN — 51st hourly check Wed 22 Jul 2026 UTC (124th total).

Fix Recipe (NOT YET RUN):
1. INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday, created_at)
   VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'Irish public holiday', true, NOW());

2. INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday, created_at)
   VALUES ('October Bank Holiday', '2026-10-27', '2026-10-27', 'Irish public holiday', true, NOW());

3. Verify: SELECT id, name, start_date, end_date FROM school_closures ORDER BY start_date DESC LIMIT 5;

Risk: Reversible (DELETE by id). AY bookings traversing Aug 3 or Oct 27 get +1 day shunt. Low risk.
Status: Open - fix NOT RUN. Wed 22 Jul 2026 UTC (51st hourly, 124th total). URGENT: Aug 3 = 12 days away.