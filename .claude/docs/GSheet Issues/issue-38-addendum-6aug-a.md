# Issue 38 — BC 25004 + 25005: Class Assignment Deadline TOMORROW (6 Aug 2026)

**Reporter:** Various | **Area:** Holidays, Bookings | **Sheet row:** 40 | **Check:** 31st (Thu 6 Aug 2026 UTC)
**DEADLINE: Fri 7 Aug 2026 — both students start Mon 10 Aug with 0 class assignments**

## Symptom
Two confirmed short-course students start Mon 10 Aug but have no class assignment. Must be assigned before Fri close.

## Root cause (live data)

| BC ID | Student ID | Category | Dates | Confirmed | SCAs |
|-------|-----------|----------|-------|-----------|------|
| 25004 | 14597 (Vincenzo Contu) | MORNING_PLUS (General English AM Plus) | 10-14 Aug 2026 | true | 0 |
| 25005 | 14598 (Claudia Mereu) | MORNING (General English AM) | 10-14 Aug 2026 | true | 0 |

Both bookings CONFIRMED, active. Booking courses created but never assigned to a class.

## Fix recipe (NOT YET RUN — MUST RUN BY FRI 7 AUG)

### Step 1 — Assign via SIS admin (preferred)
In SIS admin class assignments for week of 10-14 Aug 2026:
- BC 25004 (Vincenzo, student 14597): assign to a General English AM Plus class with capacity
- BC 25005 (Claudia, student 14598): assign to a General English AM class with capacity

### Step 2 — Or via DB (replace CLASS_ID)
```sql
-- Vincenzo Contu (BC 25004, student 14597)
INSERT INTO public.student_class_assignments
  (booking_course_id, class_id, week_start, week_end, student_id, created_at)
VALUES
  (25004, <CLASS_ID_1>, '2026-08-10', '2026-08-14', 14597, NOW());

-- Claudia Mereu (BC 25005, student 14598)
INSERT INTO public.student_class_assignments
  (booking_course_id, class_id, week_start, week_end, student_id, created_at)
VALUES
  (25005, <CLASS_ID_2>, '2026-08-10', '2026-08-14', 14598, NOW());
```

### Step 3 — Verify
```sql
SELECT sca.id, sca.booking_course_id, sca.class_id, sca.week_start::date, sca.student_id
FROM public.student_class_assignments sca
WHERE sca.booking_course_id IN (25004, 25005);
```

## Risk / category
- **Bookings / Classes**: medium — inserting wrong class_id puts students in wrong class. Use SIS admin UI.
- Reversible: yes (delete SCA rows).
- Blast radius: 2 students, 1 week each.

## Status
OPEN — fix NOT RUN. **Deadline: Fri 7 Aug 2026 (tomorrow). Students start Mon 10 Aug.**
**Last checked:** Thu 6 Aug 2026 UTC