# Issue 45 Addendum — 10 July 2026 (renewal arrivals: Pietro, Ettore, Veronica)
---
## 10 Jul 2026 UTC (2nd check this day)

CONFIRMED UNCHANGED (fresh DB). All three booking courses still have ZERO class assignments.

- BC81 (Pietro Colombo, student 72, Morning General Plus, Jul6-Jul24):
  scaCount=0, active=true. Week 1 (Jul6-Jul10) ENDED TODAY.
  Week 2 starts Monday 13 July. 10 school days remain to Jul24.
  NEIL: assign Pietro to a class via SIS admin BEFORE MONDAY 13 JULY.

- BC24968 (Ettore Iovinella, student 14564, GE AM Plus, Jul6-Jul10):
  scaCount=0, active=true. COURSE ENDED TODAY (Jul10).
  TODAY is the last day to add a retroactive class assignment if Ettore attended Jul6-10.

- BC24931 (Veronica Martin, student 278, GE AM, Jul6-Jul10):
  scaCount=0, active=true. COURSE ENDED TODAY (Jul10).
  TODAY is the last day to add a retroactive class assignment if Veronica attended Jul6-10.

Bookings: BK78 (Pietro) CONFIRMED EUR1880, BK18191 (Ettore) CONFIRMED EUR190.63, BK18156 (Veronica) CONFIRMED EUR573.20.

Note: H column corrected from "14 school days" to "10 school days" for Pietro (10 = 2 weeks Jul13-Jul24).
Last checked: 2026-07-10 UTC (hourly bot, 2nd check this day).

---
## 10 Jul 2026 UTC (5th pass -- this run)

CONFIRMED UNCHANGED (fresh DB). All three booking courses still have ZERO class assignments.

Pietro Colombo (student 72, booking course 81, Morning General Plus, booking 78, Jul6-Jul24):
- scaCount=0 (fresh Prisma query). Active=true, confirmed, fully paid EUR1880.
- Week 1 (Jul6-Jul10) ended today. Week 2 starts MONDAY 13 JULY -- 3 days from now.
- Pietro has NO prior class assignment history at all (zero SCAs ever across all booking courses).
- Level is UNKNOWN -- Neil must check with Paul or the teacher before assigning.
- Active classes (for reference): B1 AM (id=5), A1 (id=7), A2 AM (id=8), C1 AM (id=13), C1 PM (id=14), 121 (id=15), B2-C1 (id=4), IELTS (id=10), B2&C1 PM (id=6), A2 PM (id=9), B1 PM (id=11), B1 AM2 (id=12), Conversation+5 (id=16).
- NEIL URGENT: assign Pietro SCA via SIS admin BEFORE MONDAY 13 JULY.

Ettore Iovinella (student 14564, booking course 24968, General English AM Plus, booking 18191, Jul6-Jul10):
- scaCount=0. Course ENDED TODAY (Jul10).
- PRIOR CLASS HISTORY: SCA id=281, classId=4 (B2-C1), weekStart=2026-06-29, on booking course 24941.
- Was in class 4 (B2-C1) week of Jun29. Jul6-10 course likely continued same class.
- Retroactive SCA recipe (NOT YET RUN): INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end) VALUES (14564, 24968, 4, 2026-07-06, 2026-07-11);
- WINDOW CLOSES TODAY.

Veronica Martin (student 278, booking course 24931, General English AM, booking 18156, Jul6-Jul10):
- scaCount=0. Course ENDED TODAY (Jul10).
- NO prior class assignment history (zero SCAs ever).
- Level unknown. WINDOW CLOSES TODAY.

Last checked: 2026-07-10 FRI UTC (5th pass, hourly bot).

---
## 10 Jul 2026 UTC (6th pass — this run)

CONFIRMED UNCHANGED (fresh DB). All three booking courses still have ZERO class assignments.

Pietro Colombo (student 72, bk78, bc81, Morning General Plus, Jul6-Jul24):
- Zero SCAs. No prior class history at all. Level unknown.
- Week 1 (Jul6-Jul10) ended today. Week 2 starts MONDAY 13 JULY = 3 days.
- CRITICAL: Neil must assign Pietro a class BEFORE MONDAY. Check level with Paul.

Ettore Iovinella (student 14564, bk18191, bc24968, General English AM Plus, Jul6-Jul10):
- Zero SCAs on bc24968. BC24968 ENDED TODAY, still active=true.
- BK18191 CONFIRMED EUR190.63/190.63 fully paid.
- Prior class: class 4 (B2-C1), SCA id=281, bc24941, week of Jun29.
- TODAY is the last chance for retroactive SCA on bc24968.
- Retroactive SCA (NOT YET RUN): INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end) VALUES (14564, 24968, 4, '2026-07-06', '2026-07-11');
- Deactivate (NOT YET RUN): UPDATE booking_courses SET active=false WHERE id=24968;

Veronica Martin (student 278, bk18156, bc24931, General English AM, Jul6-Jul10):
- Zero SCAs on bc24931. BC24931 ENDED TODAY (checked via prior bot run), still active=true.
- No prior class history — level unknown. TODAY is last chance for retroactive SCA.
- Deactivate (NOT YET RUN): UPDATE booking_courses SET active=false WHERE id=24931;

Actions needed TODAY (window closes end of day):
1. Ettore: insert retroactive SCA (class 4, Jul6-Jul11) if attended
2. Veronica: check with Paul if attended and which class; insert retroactive SCA
3. Deactivate bc24968 + bc24931
4. Pietro: assign to a class via SIS admin BEFORE Monday 13 July — check level with Paul

Last checked: 2026-07-10 FRI UTC (6th pass, hourly bot).

## 11 Jul SAT UTC (11th pass, fresh DB)

CONFIRMED UNCHANGED (fresh DB). Report-only.
- Pietro Colombo (s72): BC81 (Morning General Plus, Jul6-Jul24) active=true, ZERO SCAs confirmed.
- BC24968 (Ettore Iovinella s14564, General English AM Plus, bk18191): ended Jul10 STILL active=true (2 days stale, fee=EUR190.63).
- Booking 78 (Pietro): CONFIRMED EUR1880/1880 fully paid.
- Week 1 attendance (Jul6-10) completely untracked for Pietro.
- Monday 13 July = Week 2, 2 days remaining.
- Fix: SIS student 72 > Classes > Add class assignment before Mon Jul13 09:00.
- Also: deactivate BC24968 (ended Jul10, still active).
Last checked: 2026-07-11 SAT UTC (11th pass, hrly bot).