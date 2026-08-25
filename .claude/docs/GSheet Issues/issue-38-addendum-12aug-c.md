# Issue 38 — Eduardo Roche Diaz (128th check, 12 Aug 2026)

**Reporter:** AC | **Sheet row:** 40

**Symptom:** BC 25043 (General English PM) ends Fri 14 Aug 2026. Still 0 class assignments on day 3 of 5.

**Root cause:**
- BC 25043 (bookingId 18265, student 14602 Eduardo Roche Diaz): active = true, endDate 2026-08-14, 0 class assignments
- Eduardo enrolled as separate weekly bookings — prior 3 weeks all confirmed with Class 6:
  - BC 25011 (Jul 20-24) → SCA 358, classId 6
  - BC 25023 (Jul 27-31) → SCA 359, classId 6
  - BC 25038 (Aug 3-7) → SCA 421, classId 6
- This week (Aug 10-14): BC 25043 has 0 class assignments — entire week unrecorded
- Pattern consistent: Eduardo belongs in Class 6 (B2+C1 PM)

**Fix recipe (NOT YET RUN):**

Option A — via SIS admin UI:
Navigate to BC 25043 → assign to Class 6 (B2+C1 PM), week 10-14 Aug 2026.

Option B — direct SQL:
INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end) VALUES (25043, 6, '2026-08-10', '2026-08-14');

**Risk:** bookings/attendance | Reversible: yes (delete the SCA) | Blast radius: 1 student, 1 week

**Status:** CRITICAL — 0 CAs, course ends Fri 14 Aug 2026 (2 days). Fix NOT RUN.
**Last checked:** Wed 12 Aug 2026 UTC (128th check)