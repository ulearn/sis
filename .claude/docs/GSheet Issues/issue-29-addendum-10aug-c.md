Issue 29 and 15 - Saikhantes Shagdarsuren: service_end Expired (Duplicate Track)
Reporter: Staff | Sheet row: 30 | Last checked: 2026-08-10 UTC

Root Cause (Live DB 10 Aug 2026):
Booking 18151 (Saikhantes Shagdarsuren, student 1001):
- Status: CONFIRMED | Paid: EUR 1,339.20 | Open: EUR 0
- service_end: 2026-08-07 - EXPIRED 3 days ago
- BC 24925 (Academic Year Afternoon): active=true, ends 2026-10-02 (53d remaining), 1 SCA
Identical root cause and fix to Issue 15 (row 16).

FIX RECIPE (NOT YET RUN):
SQL: UPDATE Booking SET serviceEnd = 2026-10-02 WHERE id = 18151;
One update resolves both Issue 15 (row 16) and Issue 29 (row 30).

Risk: Data hygiene. Reversible. 1 booking, cosmetic only.
Status: Open. Fix NOT RUN. Last checked: 2026-08-10 UTC (74th)
