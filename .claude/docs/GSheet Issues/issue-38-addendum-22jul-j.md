Issue 38 - August + October Bank Holidays Missing (URGENT)
Reporter: PG | Area: Holidays/Bookings | Sheet row: 40 | Last checked: 2026-07-22 UTC

Symptom: Aug BH (3 Aug 2026) and Oct BH (27 Oct 2026) absent from school_closures. Course end dates will not auto-shift.

Root Cause:
- DB: SELECT from school_closures WHERE start_date <= 2026-11-01 AND end_date >= 2026-07-22 returned 0 rows.
- August Bank Holiday Mon 3 Aug 2026: absent - 12 calendar days away.
- October Bank Holiday Mon 27 Oct 2026: absent - 96 calendar days away.
- Christmas shunt and Good Friday entries exist; these two were never inserted.

Fix Recipe (NOT YET RUN):
Step 1 - Insert bank holidays:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday) VALUES
    ('August Bank Holiday 2026', '2026-08-03', '2026-08-03', true),
    ('October Bank Holiday 2026', '2026-10-27', '2026-10-27', true);
Step 2 - Run course end-date recompute script (same as Christmas shunt) to push course end dates off BH dates.
Step 3 - Verify: course ending Mon 3 Aug shifts to Tue 4 Aug; Mon 27 Oct shifts to Tue 28 Oct.

Risk: Category bookings/holidays. Reversible yes. Blast radius 100+ students. Urgency CRITICAL - 12 days to Aug BH.
Status: Open - fix NOT RUN. Wed 22 Jul 2026 UTC (49th hourly, 122nd total check).