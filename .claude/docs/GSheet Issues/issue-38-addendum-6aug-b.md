# Issue 38 - URGENT: 14 Confirmed BCs Starting Mon 10 Aug, All 0 Class Assignments (32nd check)

Reporter: Various | Area: Holidays/Bookings | Row: 40 | Check: 32nd Thu 6 Aug 2026 UTC
DEADLINE: Fri 7 Aug 2026 - students start Mon 10 Aug

Significantly more students than previously tracked start Mon 10 Aug with no class assignments.
Live count: 14 confirmed booking courses, 0 SCAs each.

## Root cause (32nd check Thu 6 Aug UTC)

Confirmed BCs starting Mon 10 Aug 2026 with 0 class assignments:
- BC 108 - Lucia Borroni - Intensive General 30
- BC 109 - Maicol Moretti - Morning General
- BC 1313 - Ana Luiza De Sousa - Academic Year Afternoon
- BC 1818 - Natanael Reis Lourenco de Sales - Academic Year Morning
- BC 24874 - Natanael Reis (2nd BC) - AY Morning St Patrick Promo
- BC 24915 - Toshimi Hanakawa - Academic Year Morning
- BC 24970 - Tsengelbayar Mendsaikhan - Academic Year Afternoon
- BC 25004 - Vincenzo Contu (student 14597) - General English AM Plus
- BC 25005 - Claudia Mereu (student 14598) - General English AM
- BC 25024 - Josimar Roberto - General English PM
- BC 25027 - Jacqueline Olga Burgos - Academic Year Morning
- BC 25031 - Brisia Garcia Roman - Academic Year Morning
- BC 25036 - Jorge Perez Aldana - General English AM
- BC 25039 - Cristian Ravai - General English PM Plus

Additionally 3 unconfirmed (lower priority):
- BC 96 (Alessandro Signorotti), BC 833 (Settiyanee Duangjai), BC 25007 (Nominjin Amartsogt)

## Fix recipe (NOT YET RUN - ASSIGN BY FRI 7 AUG)

Step 1 - Check prior class for each student (for AY renewals, continue same class):
  SELECT sca.booking_course_id, sca.class_id, sca.week_end::date, c.name
  FROM public.student_class_assignments sca
  JOIN public.classes c ON c.id = sca.class_id
  WHERE sca.booking_course_id IN (108,109,1313,1818,24874,24915,24970,25004,25005,25024,25027,25031,25036,25039)
  ORDER BY sca.booking_course_id, sca.week_end DESC;

Step 2 - Assign via SIS admin (preferred):
  Classes -> To Be Assigned, filter week 10-14 Aug 2026.
  AY renewals: continue in prior class (see Step 1).
  Short-course students (25004, 25005, 25024, 25036, 25039): assign to appropriate level.

Step 3 - Verify:
  SELECT booking_course_id, class_id, week_start::date, week_end::date
  FROM public.student_class_assignments
  WHERE booking_course_id IN (108,109,1313,1818,24874,24915,24970,25004,25005,25024,25027,25031,25036,25039)
  AND week_start >= '2026-08-10';
  -- Expected: 14+ rows

## Risk
Classes: medium - assigning wrong class_id puts student in wrong class. Use SIS admin UI.
Reversible: delete/replace SCA rows. Blast radius: 14 students, week of 10-14 Aug.

## Status
OPEN - fix NOT RUN. CRITICAL: 14 confirmed students start Mon 10 Aug. Assign by Fri 7 Aug.
Last checked: Thu 6 Aug 2026 UTC (32nd hourly check)
