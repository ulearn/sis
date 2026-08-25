Issue 9 - Suvderdene Bayartsog: Draft Certificate - addendum 14 Aug 2026
Reporter: AC | Row: 10
65th check Fri 14 Aug 2026 UTC

ROOT CAUSE (live data):
- Document 171 (booking 1498): DRAFT v1, created 5 Jun 2026 - 70 days unissued
- Booking 1498: CONFIRMED (status), confirmed = false, amounts null, service_end 5 Jun 2026
- Booking Course 1660 (ULearn Renewal MORN): ended 5 Jun 2026 - 70 days stale, 0 class assignments

FIX RECIPE (NOT YET RUN):
1. Deactivate BC 1660: prisma.bookingCourse.update({where:{id:1660},data:{active:false}})
2. Set bk1498 confirmed=true: prisma.booking.update({where:{id:1498},data:{confirmed:true}})
3. Resolve doc 171: delete draft OR fix source data and regenerate via admin UI

RISK: documents/bookings. BC reversible. Doc delete not reversible. Blast: 1 doc, 1 bk, 1 BC.
STATUS: Open - fix NOT RUN. DRAFT doc 70d. BC stale 70d.
Last checked: Fri 14 Aug 2026 UTC (65th check)