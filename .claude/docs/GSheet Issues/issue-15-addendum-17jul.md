Issue 15 Addendum — 17 Jul 2026 (Friday)

Sheet row: 16 | Reporter: AC | Area: Booking / Class | Check: 78th

---

Symptom: Course dates and holidays make no sense; one membership covering 2 courses.

Root cause — fresh DB 17 Jul 2026

Student 1001 (Saikhantes Shagdarsuren):
- SCA 255: class 11, booking course 24925, weekStart=12 Jan 2026, weekEnd=3 Jul 2026 — ONLY assignment ever
- Week 6-10 Jul 2026: zero assignment — PAST, attendance untracked
- Week 13-17 Jul 2026: zero assignment — TODAY IS THE LAST DAY of this week
- Booking course 24925 (AY Afternoon, 9 Mar-2 Oct 2026): active; holiday 20 Jul-21 Aug starts Monday
- Booking course 1982 (AY Morning, ended 19 Dec 2025): still active=true — 7+ months stale
- After holiday, student returns ~25 Aug through 2 Oct 2026

---

Fix recipe — NOT YET RUN

1. Assign this week (TODAY, 17 Jul — LAST CHANCE):
   Via SIS admin: Student 1001 → Booking → BC24925 → Class Assignment
   Or direct insert (NOT YET RUN):
   INSERT INTO "StudentClassAssignment" (student_id, booking_course_id, class_id, week_start, week_end)
   VALUES (1001, 24925, 11, '2026-07-13', '2026-07-17');

2. Back-fill missed week 6-10 Jul (optional):
   INSERT INTO "StudentClassAssignment" (student_id, booking_course_id, class_id, week_start, week_end)
   VALUES (1001, 24925, 11, '2026-07-06', '2026-07-10');

3. Deactivate stale BC1982:
   UPDATE "BookingCourse" SET active = false WHERE id = 1982;

4. After holiday (return ~25 Aug): create new SCA for remaining weeks of BC24925 to 2 Oct.

Risk: bookings/attendance | 2 weeks untracked | BC1982 deactivation safe + reversible | 1 student

Status: Open — NOT YET RUN. Today is last day for week 13-17 Jul.
Last checked: Friday 17 July 2026 UTC (78th check)