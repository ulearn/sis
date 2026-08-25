Issue 22 -- Edite Nunes Class Assignment (127th run, Mon 27 Jul 2026 UTC)
Reporter: PG | Area: Booking / Class | Sheet row: 23

SYMPTOM
Not appearing in class to be assigned; two payments with same invoice number (original issue, now resolved).

ROOT CAUSE (fresh DB Mon 27 Jul UTC -- 127th check)
BC 24991 (General English AM, Jul 13 - Aug 7 2026): active = true, 0 student class assignments (unchanged).
Edith Nunes student 1015, booking 18214, EUR 608 paid.

Days lost: 11 school days Jul 13-27 irrecoverable (includes today Jul 27 -- AM class already past).
Days remaining: 8 school days Jul 28-31 (4d) + Aug 4-7 (4d).
NOTE: Aug 4 start depends on Issue 38 fix (Aug Bank Holiday must be added first).
Stale: BC 24933 + BC 24934 (ended Jul 10) still active -- data hygiene.

FIX RECIPE (NOT YET RUN)

IMPORTANT: Resolve Issue 38 (Aug BH) first so Aug 4 registers as first school day of that week.

Step 1 -- Assign BC 24991 to General English AM class in SIS admin:
  Navigate: SIS Admin > Students > Edith Nunes (1015) > Booking 18214
  Find booking course BC 24991 (General English AM, Jul 13 - Aug 7)
  Assign to appropriate GE AM class
  weekStart = 2026-07-28 | weekEnd = 2026-08-07 (course end)

Step 2 -- Deactivate stale BCs:
  UPDATE booking_courses SET active = false WHERE id IN (24933, 24934) AND active = true;

Step 3 -- Verify SCA created:
  SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE booking_course_id = 24991;

RISK / CATEGORY
Category: Class assignment / attendance | Reversible: Yes | Blast radius: 1 student

STATUS: CRITICAL -- Fix NOT RUN | Last checked: Mon 27 Jul 2026 UTC (127th hrly) | 8 school days remain