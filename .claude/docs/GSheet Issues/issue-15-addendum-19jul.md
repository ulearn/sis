Issue 15 Addendum — 19 Jul 2026 (Sunday)

Sheet row: 16 | Reporter: AC | Area: Booking / Class | Check: 83rd

---

Symptom: Course dates and holidays make no sense; one membership covering 2 courses.

Root cause — fresh DB 19 Jul 2026

Student 1001 (Saikhantes Shagdarsuren):
- SCA 255: class 11, booking course 24925, weekStart=12 Jan 2026, weekEnd=3 Jul 2026 — expired 16 days ago
- Week 6-10 Jul 2026: zero assignment — PAST, attendance untracked (missed)
- Week 13-17 Jul 2026: zero assignment — PAST as of today, attendance untracked (missed)
- Both missed weeks are irrecoverable
- Student holiday (booking holiday 2500): 20 Jul-21 Aug 2026 — STARTS TOMORROW (Mon 20 Jul)
- No action needed during holiday
- After holiday, student resumes: booking course 24925 (AY Afternoon, 9 Mar-2 Oct 2026) active
- Next window to act: before 09:00 Mon 24 Aug 2026 (school resumes after Aug 21 holiday end)
- Booking course 1982 (AY Morning, ended 19 Dec 2025): still active=true — 212 days stale

---

Fix recipe — NOT YET RUN

1. After holiday ends (before 09:00 Mon 24 Aug 2026):
   Via SIS admin: Student 1001 -> Booking 18151 -> BC24925 -> Class Assignment -> class 11
   Direct insert (NOT YET RUN):
   INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end)
   VALUES (1001, 24925, 11, '2026-08-24', '2026-10-02');

2. Back-fill missed weeks (optional, low priority):
   INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end)
   VALUES (1001, 24925, 11, '2026-07-06', '2026-07-10');
   INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end)
   VALUES (1001, 24925, 11, '2026-07-13', '2026-07-17');

3. Deactivate stale BC1982 (AY Morning, ended Dec 19 2025) (NOT YET RUN):
   UPDATE booking_courses SET active = false WHERE id = 1982;

Risk: bookings/attendance | 2 weeks untracked | BC1982 deactivation safe + reversible | 1 student
DEADLINE: before 09:00 Mon 24 Aug 2026 (next school day after holiday)

Status: Open — NOT YET RUN.
Last checked: Sunday 19 July 2026 UTC (83rd check)
