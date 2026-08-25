Issue 38 - Aug Bank Holiday Shunt (85th check Mon 3 Aug 2026 UTC, 14th today)
Reporter: PG | Area: Holidays/Bookings | Sheet row: 40


ROOT CAUSE (fresh 3 Aug 2026 UTC):
- school_closures: no entry for 2026-08-03 (confirmed fresh)
- 21 active booking courses with start_date = 2026-08-03 (IDs: 88, 97, 1755, 1766, 24627 + 16 more)
- BC 25006 (General English AM Plus): end_date = 2026-08-03, active = true - DEACTIVATE FIRST
- Bank holiday is TODAY - school closed; classes start tomorrow Tue 4 Aug


FIX RECIPE (NOT YET RUN):
1. Add Aug Bank Holiday closure:
   INSERT INTO school_closures (name, start_date, end_date, note, is_paid_holiday)
   VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', 'August Bank Holiday 2026', true);
2. Deactivate BC 25006:
   UPDATE booking_courses SET active = false WHERE id = 25006;
3. Shunt 21 BCs (verify count first, then):
   UPDATE booking_courses SET start_date = '2026-08-04' WHERE start_date = '2026-08-03' AND active = true;
4. Check other BCs ending today:
   SELECT id, name FROM booking_courses WHERE end_date = '2026-08-03' AND active = true AND id != 25006;


RISK: bookings/holidays | Reversible: yes | Blast: 21 BCs + BC 25006 (1 student each)
STATUS: 85th check Mon 3 Aug 2026 UTC (14th today). STILL NOT RUN. Last checked: 2026-08-03 UTC