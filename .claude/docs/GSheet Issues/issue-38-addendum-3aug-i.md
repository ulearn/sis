Issue 38 - Aug Bank Holiday Shunt (86th check Mon 3 Aug 2026 UTC, 15th today)
Reporter: PG | Area: Holidays/Bookings | Sheet row: 40


ROOT CAUSE (fresh 3 Aug 2026 UTC):
- school_closures: no entry for 2026-08-03 (confirmed fresh this check)
- 21 active booking courses with start_date = 2026-08-03 (IDs: 88, 97, 1755, 1766, 24627 + 16 more)
- BC 25006 (General English AM Plus, booking 18228): end_date = 2026-08-03, active = true -- ends today
- Total stale booking courses (end_date < 2026-08-04): 24,467 (incl. BC 25006)
- Bank holiday is TODAY -- school closed; classes start tomorrow Tue 4 Aug
- Unchanged from 85th check (-h.md)


FIX RECIPE (NOT YET RUN):
1. Add Aug Bank Holiday closure record:
   INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday)
   VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'August Bank Holiday 2026', true);

2. Deactivate BC 25006 (or let Issue 45 bulk deactivation handle it):
   UPDATE booking_courses SET active = false WHERE id = 25006;

3. Verify count of BCs to shunt, then shunt:
   SELECT id, name FROM booking_courses WHERE start_date = '2026-08-03' AND active = true;
   -- expect 21 rows
   UPDATE booking_courses SET start_date = '2026-08-04' WHERE start_date = '2026-08-03' AND active = true;

4. Check any other BCs ending today (besides 25006):
   SELECT id, name FROM booking_courses WHERE end_date = '2026-08-03' AND active = true AND id != 25006;


RISK: bookings/holidays | Reversible: yes | Blast: 21 BCs + BC 25006
STATUS: 86th check Mon 3 Aug 2026 UTC (15th today). STILL NOT RUN. Last checked: 2026-08-03 UTC
