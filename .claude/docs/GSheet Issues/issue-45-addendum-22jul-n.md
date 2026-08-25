Issue 45 - Martina Tartaro + Eduardo Roche Diaz: Courses Expire Fri 24 Jul (Addendum 22 Jul 2026 N)
Reporter: AC | Area: Renewal students | Sheet row: 47

Root cause (54th hourly check, Wed 22 Jul 2026 UTC, 86th total):
- BC24828 (Martina Tartaro, booking 18036): Morning General Plus + IELTS, ends Fri 24 Jul — STILL 0 SCAs
- BC25011 (Eduardo Roche Diaz, booking 18233): General English PM, 20-24 Jul, fee EUR 120 — STILL 0 SCAs
- 2 school days remaining: Thu 23 Jul + Fri 24 Jul — permanent expiry after Friday
Fix NOT RUN.

Fix recipe (NOT YET RUN — BEFORE THU 23 JUL 09:00):
Martina BC24828 — assign to AM class this week:
INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
VALUES (24828, am_class_id, 2026-07-20, 2026-07-24);

Eduardo BC25011 — assign to General English PM class:
INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
VALUES (25011, pm_class_id, 2026-07-20, 2026-07-24);

Status: LAST CHANCE — courses expire Fri 24 Jul. Fix NOT RUN. Last checked: Wed 22 Jul 2026 UTC.