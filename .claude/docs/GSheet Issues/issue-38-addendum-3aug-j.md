Issue 38 -- Aug Bank Holiday Shunt (87th check Mon 3 Aug 2026 UTC, 16th today)
Reporter: PG | Area: Holidays/Bookings | Sheet row: 40

Root Cause (fresh 3 Aug 2026 UTC):
- school_closures: NO entry for 2026-08-03 (9 entries: Good Fridays 2026-2030 + Christmas 2026-2029 only)
- 21 active BCs with start_date = 2026-08-03 -- unchanged from prior checks
- BC 25006 (General English AM Plus, bk18228): end_date = 2026-08-03, active = true (ends today)
- 1 BC with start_date = 2026-08-04 (pre-existing)
- School resumes TOMORROW Tue 4 Aug 2026 -- shunt STILL NOT RUN

Fix Recipe (NOT YET RUN):
Step 1: INSERT INTO school_closures (name,start_date,end_date,note,is_paid_holiday) VALUES (Aug Bank Holiday,2026-08-03,2026-08-03,August Bank Holiday 2026,true);
Step 2: SELECT id,name FROM booking_courses WHERE start_date=2026-08-03 AND active=true; -- expect 21
Step 3: UPDATE booking_courses SET start_date=2026-08-04 WHERE start_date=2026-08-03 AND active=true;
Step 4: UPDATE booking_courses SET active=false WHERE id=25006;

Risk: bookings/holidays | Reversible: yes | Blast: 21 BCs + BC 25006
Status: 87th check Mon 3 Aug 2026 UTC (16th today). STILL NOT RUN. School TOMORROW. URGENT.
Last checked: 2026-08-03 UTC