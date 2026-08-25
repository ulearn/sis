# Issue 45 addendum - Mon 20 Jul 2026 (43rd check, 13th hourly)

Area: Renewal students / class assignment | Sheet row 47

## ESCALATION (fresh DB 13th hourly)

3 students completed 1-week courses (Jul 13-17) with 0 class assignments:
- BC 24946 Lunel Dubost (student 14566, booking 18171 Confirmed)
- BC 24992 Luz Maria Sobrino Blanco (student 14589, booking 18215 PENDING / confirmed=false)
- BC 24994 Petru Ous (student 14591, booking 18217 Confirmed)

All three: General English AM, Jul 13-17. Courses ended. Students attended all week without being placed in a class.

ANOMALY: Booking 18215 (Luz Maria, student 14589): status=PENDING, confirmed=false - course ended without booking ever being confirmed. HubSpot contact: 817132951768.

BC24946/24992/24994: still active=true despite end date 17 Jul 2026 (3 days stale).

## Jul-20 starters (0 class assignments - assign today)

BC 1630  Saranzaya Khishigbayar  AY Afternoon  ends Jan 2027
BC 24686 Alberto Squillace       Morning Gen   ends Sep 2026
BC 24942 Lorena Pizarro Araya    AY Morning    ends Jan 2027
BC 25011 Eduardo Roche Diaz      GE PM         ends 24 Jul

Assigned OK: BC24616/24966/24989/25000 (4 SCAs confirmed)
Skip: BC24932 (PENDING booking), BC25009 (admin account)

## Jul-13 actives - week 2, 0 class assignments (7 days in school)

BC1619 Munkhtsetseg, BC1788 Pedro Campion, BC1814 Wanqiong, BC24820 Italo,
BC24988 Minjinsor, BC24990 Samuele, BC24998 Allison, BC24609 Xuezhen (issue 39),
BC24991 Edith (issue 22)

Assigned OK: BC1771/1770/87/24944

## Fix recipe (NOT YET RUN)

1. Assign BC1630/24686/24942/25011 via Admin > Bookings > assign class (day 1, urgent)
2. Assign 8 Jul-13 week-2 students (critical, 7 days missed)
3. Investigate booking 18215: PENDING status with course ended - confirm or cancel with staff?
4. UPDATE booking_course SET active=false WHERE id IN (24946,24992,24994); -- data hygiene only
5. Class assignment for BC24946/24992/24994 is moot (week is over)

## Risk
Class assignment: reversible. Stale active flags: safe data hygiene. Booking 18215: verify with staff.

## Status
4/8 Jul-20 assigned. 3 completed 0-SCA (historical miss). 4 Jul-20 + 8 Jul-13 ongoing unassigned.
Fix NOT RUN. Last checked: Mon 20 Jul 2026 UTC (43rd check, 13th hourly).
