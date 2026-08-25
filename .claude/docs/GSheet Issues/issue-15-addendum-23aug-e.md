Issue 15 — Saikhantes Shagdarsuren (student 1001)
Reporter: AC/NM | Area: Booking / Class | Sheet rows 16 + 30

Root cause (474th run, 23 Aug 2026 UTC)
No change since 472nd run. Data re-confirmed fresh from DB:
- Booking 18151: CONFIRMED, confirmed = true, amountPaid = EUR 1,339.20, amountOpen = 0 (fully paid)
- Booking Course 24925 (Academic Year Afternoon): active, ends 2026-10-02
- Student Class Assignment 255: student 1001, class 11, week_start 2026-01-12, week_end 2026-07-03 — expired 51 days ago
- Only SCA on BC 24925 — no other SCA exists
- No SCA covers 22 Aug or Mon 24 Aug
- Holiday 2500 ended 2026-08-21 — student back since Fri 22 Aug
- URGENT: Monday 24 Aug = TOMORROW

Fix recipe (NOT YET RUN)

Step 1 — Create new Student Class Assignment:
  INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end)
  VALUES (1001, 11, 24925, '2026-08-24', '2026-10-02');

  Table name confirmed: student_class_assignments (plural).

Step 2 — No stale Booking Courses on booking 18151. BC 24925 is the correct active one.

Risk
- Category: bookings / class scheduling
- Reversible: yes (DELETE the SCA to undo)
- Blast radius: 1 student, 1 SCA insert

Status
FIX NOT RUN. URGENT — Mon 24 Aug is tomorrow.
Last checked: 2026-08-23 UTC (474th run)