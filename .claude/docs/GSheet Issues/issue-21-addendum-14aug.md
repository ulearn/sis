Issue 21 - Maurivan Kuhl: Stale BC 1604 - addendum 14 Aug 2026
Reporter: AC | Row: 22
22nd check Fri 14 Aug 2026 UTC

ROOT CAUSE (live data):
- Booking Course 1604 (Morning General, bk 1461, student 912): ended 3 Jul 2026 - 42 days stale, active=true
- Class Assignment 46: week 30 Mar to 5 Apr 2026, class 7 (historical)
- Class Assignment 156: week 6 Apr to 2 Jul 2026, class 8 (historical - ends 1d before course end)
- Both CAs are historical; deactivation safe

FIX RECIPE (NOT YET RUN):
prisma.bookingCourse.update({where:{id:1604},data:{active:false}})

RISK: bookings/data-hygiene. Reversible. Blast: 1 BC, no active SCAs.
STATUS: Open - fix NOT RUN. BC 1604 stale 42 days.
Last checked: Fri 14 Aug 2026 UTC (22nd check)