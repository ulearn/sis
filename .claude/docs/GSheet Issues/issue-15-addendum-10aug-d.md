Issue 15 - Saikhantes Shagdarsuren: service_end Expired
Reporter: Staff | Sheet row: 16 | Last checked: 2026-08-10 UTC

Root Cause (Live DB 10 Aug 2026):
Booking 18151 (Saikhantes Shagdarsuren, student 1001):
- Status: CONFIRMED | Confirmed: true | Paid: EUR 1,339.20 | Open: EUR 0
- service_start: 2026-01-12, service_end: 2026-08-07 - EXPIRED 3 days ago
- Booking Course 24925 (Academic Year Afternoon): active=true, ends 2026-10-02, 1 SCA
- Student IS in class; no attendance impact; service_end field incorrect
- Same fix also resolves Issue 29 (row 30) - both track booking 18151

FIX RECIPE (NOT YET RUN):
SQL: UPDATE Booking SET serviceEnd = 2026-10-02 WHERE id = 18151;
Prisma: await p.booking.update({ where:{id:18151}, data:{serviceEnd:new Date("2026-10-02")} });
Verify: SELECT id, service_end FROM Booking WHERE id = 18151;
One update resolves both Issue 15 (row 16) and Issue 29 (row 30).

Risk: Data hygiene. Reversible. 1 booking, cosmetic only.
Status: Open. service_end 3 days expired. Fix NOT RUN. Last checked: 2026-08-10 UTC (95th)
