# Issue 15/29 Addendum - 16 July 2026 (Thursday)

Sheet rows: 16 (issue 15), 30 (issue 29) | Reporter: AC/PG | Area: Booking / Class

---

76th check - 2026-07-16 THU UTC (9th check today)

TODAY: Thursday 16 July. Week ending 17 July is TOMORROW — LAST CHANCE to assign for this week.

CONFIRMED UNCHANGED (fresh DB). Student 1001 (Saikhantes Shagdarsuren) still has only
class assignment 255 (class 11, booking course 24925, weekEnd 3 July 2026).

DB snapshot (live, 16 Jul UTC):
- Class assignment 255: booking_course_id=24925, class_id=11, weekStart=2026-01-12, weekEnd=2026-07-03
- Booking course 24925 (Academic Year Afternoon, Mar 9 to Oct 2 2026): active=true, 1 SCA total
- Zero class assignments for week ending 10 July (missed — 5 school days past)
- Zero class assignments for week ending 17 July (TOMORROW — today is the last chance)
- Booking course 1982 (Academic Year Morning, Jun 30 to Dec 19 2025): active = STILL true — 7 months stale
- Holiday 2500: 20 July to 21 August 2026 — upcoming in 4 days (student on break from Mon 20 Jul)

School days missed since 3 July: 14 school days (Mon 6 Jul through Thu 16 Jul).
Course resumes after holiday: late August 2026.

Fix recipe — NOT YET RUN:

1. SIS Admin > Classes > To Be Assigned: assign student 1001 (Saikhantes Shagdarsuren) to class 11 (B1 PM)
   on booking course 24925, for week ending 17 July 2026 — DO THIS TODAY (LAST CHANCE)
2. Consider retroactive assignment for week ending 10 July (attendance completeness)
3. After holiday returns (~24 Aug): assign remaining weeks through 2 October 2026
4. Deactivate booking course 1982 (Academic Year Morning, ended Dec 19 2025): set active = false

Risk: class / data-hygiene — reversible. Missed week attendance is permanently unrecoverable.

Status: UNRESOLVED. Last checked: 2026-07-16 THU UTC (76th check, hourly bot).

---
77th check - 2026-07-16 THU UTC (11th check today)
CONFIRMED UNCHANGED (fresh DB).
- Class assignment 255: booking_course_id=24925, class_id=11, weekStart=2026-01-12, weekEnd=2026-07-03
- Booking course 24925 (Academic Year Afternoon, Mar 9 to Oct 2 2026): active=true, only 1 SCA (above)
- Booking 18151 (booking for BC24925): Confirmed, confirmed=true
- Zero class assignments for week ending 10 July (missed — 5 school days past)
- Zero class assignments for week ending 17 July (TOMORROW — today is the LAST CHANCE to assign)
- Booking course 1982 (Academic Year Morning, ended Dec 19 2025): active=STILL true (7 months stale)
- Holiday 2500: 20 Jul to 21 Aug 2026 — student on break from Monday next week

School days missed since Jul 3: 15 school days (6 Jul through 16 Jul). Tomorrow (17 Jul) is last day of this week.
After holiday the course resumes: late August 2026. Assign remaining weeks through Oct 2.

Fix recipe unchanged from prior addendum — NOT YET RUN.
Status: UNRESOLVED. Last checked: 2026-07-16 THU UTC (77th check, hourly bot).
