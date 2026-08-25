# Issue 38 Addendum 22 Jul 2026 f

Reporter: Staff | Area: Holidays, Bookings | Sheet row: 40
Last checked: Wed 22 Jul 2026 UTC (45th hourly, 118th total)

## Status
UNCHANGED. August Bank Holiday + October Bank Holiday still absent from school_closure table.

## Root Cause
School closure table: 9 records — Good Fridays 2026-2030 + Christmas 2026-2029. Zero bank holidays recorded.

Missing:
- Mon 3 Aug 2026 — August Bank Holiday — 12 calendar days away — URGENT
- Mon 27 Oct 2026 — October Bank Holiday

Impact:
- 202 active booking courses span 3 Aug 2026 (end dates not yet adjusted)
- 114 active booking courses span 27 Oct 2026 (end dates not yet adjusted)

## Fix Recipe (NOT YET RUN)
1. Add August Bank Holiday:
   NOT YET RUN:
   INSERT INTO school_closure (name, "startDate", "endDate", "isPaidHoliday")
   VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', false);
   (verify exact column names from Prisma schema before running)

2. Add October Bank Holiday:
   NOT YET RUN:
   INSERT INTO school_closure (name, "startDate", "endDate", "isPaidHoliday")
   VALUES ('October Bank Holiday', '2026-10-27', '2026-10-27', false);

3. Run end-date recompute for all affected booking courses (existing shunt/recalc script)

## Risk
bookings, holiday calendar — reversible — blast radius: 202 BCs (Aug) + 114 (Oct) shift +1 school day

## Last checked: Wed 22 Jul 2026 UTC — UNCHANGED
