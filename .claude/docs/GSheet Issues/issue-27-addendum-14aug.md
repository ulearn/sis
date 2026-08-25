Issue 27 - Sofiia Korkishchenko: bk17909 CANCELLED+confirmed=true - addendum 14 Aug 2026
Reporter: AC | Row: 28
49th check Fri 14 Aug 2026 UTC

ROOT CAUSE (live data):
- Booking 17909 (Sofiia Korkishchenko, student 768): CANCELLED, confirmed=true (anomaly)
- Amount paid EUR 0, open EUR 727.50, no payments
- Last updated 17 Jun 2026 - 58 days without admin action
- Booking Course 24693 (Renewal - AY PM, ends 13 Nov 2026): active=true on CANCELLED booking, 0 class assignments
- Student correctly enrolled via bk17849 / BC 24623 - no current student impact
- Same booking tracked under Issue 7 (row 8)

FIX RECIPE (NOT YET RUN):
1. prisma.booking.update({where:{id:17909},data:{confirmed:false}})
2. prisma.bookingCourse.update({where:{id:24693},data:{active:false}})

RISK: bookings. Reversible. Blast: 1 bk, 1 BC. Student active bk17849 unaffected.
STATUS: Open - fix NOT RUN. bk17909 CANCELLED+confirmed=true, 58 days.
Last checked: Fri 14 Aug 2026 UTC (49th check)