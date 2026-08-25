Issue 15/29 -- Saikhantes Shagdarsuren: No Class Assignment (CRITICAL)

Reporter: AC/multiple | Area: booking/class | Sheet rows: 16, 30

Symptom
Saikhantes not appearing in class. SCA 255 expired 3 July. No new SCA for 10 school days.

Root Cause
- Student 1001 (Saikhantes Shagdarsuren)
- Booking 18151: Confirmed, EUR 1339.20 fully paid
- Booking course 24925: AY Afternoon, 9 March 2026 to 2 October 2026, active = true
- SCA 255 (class 11, B1 PM): weekEnd = 3 July 2026 -- EXPIRED 10 days ago
- No SCA for WB 7 July or WB 14 July -- 10 school days without class (28th check 13 Jul UTC)

Fix Recipe (NOT YET RUN)
Option A (preferred): SIS UI > Classes > To Be Assigned > find Saikhantes > assign to B1 PM

Option B (direct DB) -- verify class 11 = B1 PM first:
  INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end)
  VALUES (1001, 11, 24925, 2026-07-07, 2026-07-11);
  INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end)
  VALUES (1001, 11, 24925, 2026-07-13, 2026-07-17);

Risk
Category: bookings (CRITICAL) | Reversible: yes | Blast radius: low (1 student)

Status: CRITICAL. 6 school days missed (Jul 7-11 = 5 days, Jul 13 = Day 1 of week 2). No SCA for Jul 7 or Jul 13 weeks. Last checked 2026-07-13 Mon UTC (30th check). Fix NOT RUN.
---
31st check 2026-07-13 Mon UTC

CONFIRMED UNCHANGED (fresh DB). Student 1001 (Saikhantes Shagdarsuren): SCA 255 (BC 24925, class 11, weekEnd=2026-07-03) is the only record. No SCA for week of Jul 6 or Jul 13. BC 24925 (AY Afternoon, 9 Mar - 2 Oct 2026) active=true, booking 18151 confirmed. 6 school days missed: Mon 6, Tue 7, Wed 8, Thu 9, Fri 10, Mon 13 Jul 2026.
Fix NOT RUN. NEIL: assign class via SIS > Classes > To Be Assigned for Saikhantes (student 1001).
Last checked: 2026-07-13 Mon UTC (31st check, hourly bot).


---
32nd check 2026-07-14 Tue UTC

CONFIRMED UNCHANGED (fresh DB). Student 1001 (Saikhantes Shagdarsuren): SCA 255 (class 11 B1 PM, booking course 24925, weekEnd=2026-07-03) is still the only record. No SCA for week of 7 July or 14 July. Booking course 24925 (AY Afternoon, 9 March to 2 October 2026): active=true, fee=EUR 1102.20, booking 18151 confirmed, EUR 1339.20 paid.
7 school days missed (Mon Jul7 through Tue Jul14).
Fix NOT RUN. NEIL: assign class via SIS > Classes > To Be Assigned for Saikhantes (student 1001).
Last checked: 2026-07-14 Tue UTC (32nd check, hourly bot).

---
34th check 2026-07-14 Tue UTC

CONFIRMED UNCHANGED (fresh DB). Student 1001 (Saikhantes Shagdarsuren): SCA 255 (class 11 B1 PM, booking course 24925, weekEnd=2026-07-03) is still the only record. No class assignment for week of 7 July or 14 July. Booking course 24925 (Academic Year Afternoon, 9 March to 2 October 2026): active=true, booking 18151 confirmed. 7 school days missed (Mon Jul7 through Tue Jul14 inclusive).
Fix NOT RUN. NEIL: assign class via SIS > Classes > To Be Assigned for Saikhantes (student 1001, BC24925).
Last checked: 2026-07-14 Tue UTC (34th check, hourly bot).
---

## Status Update: 2026-07-14 TUE UTC (36th check)

CONFIRMED UNCHANGED. SCA255 (B1 PM class 11, weekEnd = 3 Jul 2026) still the only class assignment for booking course 24925 (Saikhantes Shagdarsuren, student 1001, AY Afternoon).

11 days since last SCA expired. 8 school days missed (7 Jul to 14 Jul inclusive).
Next opportunity: assign for week ending 17 Jul 2026.

Action (NOT YET RUN): Assign student 1001 to B1 PM class 11 for week ending 17 Jul via SIS Admin > Classes > To Be Assigned. Check if retroactive SCAs for Jul 7-10 are needed for attendance records.

Fix NOT RUN. Last checked: 2026-07-14 TUE UTC (36th check, hourly bot).

---
37th check 2026-07-14 TUE UTC: SCA255 B1 PM weekEnd=2026-07-03 — still only SCA, 11 days expired. BC24925 AY Afternoon active ends Oct 2026. 8 school days missed Jul 7–14. UNCHANGED. CRITICAL — student has been without class assignment for 11 days. Fix NOT RUN.

---
39th check 2026-07-14 TUE UTC

CONFIRMED UNCHANGED (fresh DB). Student 1001 (Saikhantes Shagdarsuren): class assignment 255 (class 11 B1 PM, booking course 24925, weekEnd=2026-07-03) is still the ONLY record. No class assignment for week of 7 July or 14 July. Booking course 24925 (Academic Year Afternoon, 9 March to 2 October 2026): active=true. 7 school days missed (Mon 7 Jul through Tue 14 Jul inclusive).
Fix NOT RUN. NEIL: assign class via SIS > Classes > To Be Assigned for Saikhantes (student 1001, BC24925, B1 PM class 11).
Last checked: 2026-07-14 TUE UTC (39th check, hourly bot).

---
40th check 2026-07-14 TUE UTC (this run)

CONFIRMED UNCHANGED (fresh DB). Booking course 24925 (Academic Year Afternoon, 9 March–2 October 2026): active = true.
Class assignments for student 1001: only SCA 255 (week ending 3 Jul 2026, B1 PM class 11).

Missing weeks (NOT YET ASSIGNED):
  - Week ending 10 July 2026 — expired 4 days ago
  - Week ending 17 July 2026 — this Friday (3 days)

Booking 18151: Confirmed, EUR 1339.20/1339.20 fully paid, last updated 8 July 2026.
7 school days unassigned: Monday 7 July through Tuesday 14 July (today).

Fix (NOT YET RUN): SIS Admin > Classes > To Be Assigned — Saikhantes Shagdarsuren (student 1001), assign weeks ending 10 Jul and 17 Jul.
Consider retroactive SCAs for Jul 7–11 to preserve attendance records.
Fix NOT RUN. Last checked: 2026-07-14 TUE UTC (40th check, hourly bot).

---
53rd check 2026-07-15 WED UTC

CONFIRMED UNCHANGED (fresh DB). Student 1001 (Saikhantes Shagdarsuren): class assignment 255 (B1 PM class 11, booking course 24925, weekEnd=2026-07-03) is still the ONLY record. Missing weeks: 10 July (expired 12 days ago) and 17 July (ends this Friday). Booking course 24925 (Academic Year Afternoon, 9 March-2 October 2026): active=true. 10 school days without class assignment (Mon 6 Jul through Wed 15 Jul inclusive).

Fix (NOT YET RUN): SIS Admin > Classes > To Be Assigned -- Saikhantes Shagdarsuren (student 1001), assign weeks ending 10 Jul and 17 Jul. Consider retroactive SCAs for Jul 6-10 for attendance records.
Fix NOT RUN. Last checked: 2026-07-15 WED UTC (53rd check, hourly bot).

---
190th check 2026-08-21 FRI UTC

CONFIRMED UNCHANGED (fresh DB). Student 1001 (Saikhantes Shagdarsuren):
- Booking 18151: CONFIRMED, confirmed = true, paid = EUR 1,339.20, open = EUR 0 (fully paid)
- Booking Course 24925 (Academic Year Afternoon, 9 Mar 2026 to 2 Oct 2026): active = true
- Class Assignment 255: class 11 (B1 PM), weekStart = 2026-01-12, weekEnd = 2026-07-03 - EXPIRED 49 days ago
- No class assignment for any week from 6 Jul 2026 onwards - 49 school days without a class
- Booking Course 1982 (Academic Year Morning): ended 2025-12-19, active = true (245 days stale), 0 class assignments
- Booking Course 24925 ends 2 Oct 2026: 42 days remaining, SCA urgently needed for week of 24 Aug

Fix (NOT YET RUN): SIS Admin > Classes > To Be Assigned - assign Saikhantes (student 1001, BC 24925) to class 11 (B1 PM) for week 24 Aug 2026 onwards.
Also deactivate BC 1982 (stale 245 days).
Fix NOT RUN. Last checked: 2026-08-21 FRI UTC (190th check, hourly bot).
---
191st check 2026-08-21 Fri UTC (afternoon)

CONFIRMED UNCHANGED (fresh DB). Student 1001 (Saikhantes Shagdarsuren):
- Booking 18151: CONFIRMED, confirmed = true, paid EUR 1,339.20, open EUR 0
- Booking Course 24925 (Academic Year Afternoon, 9 Mar to 2 Oct 2026): active = true (42 days left)
- Class Assignment 255: class 11 (B1 PM), weekEnd = 2026-07-03 — SCA gap 49 days
- Booking Course 1982 (Academic Year Morning): ended 2025-12-19, active = true (245 days stale, 0 SCAs)

Student on holiday; returns Tue 25 Aug 2026. Mon 24 Aug is last school day before return.
Fix (NOT YET RUN): Assign SCA for BC 24925, class 11 (B1 PM), week ending Fri 28 Aug.
Also deactivate BC 1982 (stale 245 days).
Fix NOT RUN. Last checked: 2026-08-21 FRI UTC (191st check, hourly bot)
