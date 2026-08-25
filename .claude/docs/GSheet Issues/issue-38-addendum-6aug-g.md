Issue 38 - Class Assignments: 18 BCs Start Mon 10 Aug, All 0 Assigned (40th check)
Reporter: Various | Area: Holidays/Bookings | Row: 40 | Check: 40th Thu 6 Aug 2026 UTC
DEADLINE: Fri 7 Aug 2026 EOD - students start Mon 10 Aug. Fix NOT RUN.

40th hourly check (13:02 UTC Thu 6 Aug 2026) - no progress. All 18 booking courses starting Mon 10 Aug still have 0 class assignments.

Root cause (40th check Thu 6 Aug 2026 UTC)

14 CONFIRMED (booking confirmed = true) and assignable via SIS admin:
- Booking Course 108  - Lucia Borroni (booking 98): Intensive General 30
- Booking Course 109  - Maicol Moretti (booking 99): Morning General
- Booking Course 1313 - Ana Luiza De Sousa (booking 1286): Academic Year Afternoon
- Booking Course 1818 - Natanael Reis (student 1071, booking 1631): Academic Year Morning
- Booking Course 24874 - Natanael Reis (student 14541, booking 18081): AY Morning St Patricks Promo 19 wks
- Booking Course 24915 - Toshimi Hanakawa (booking 18140): Academic Year Morning
- Booking Course 24970 - Tsengelbayar Mendsaikhan (booking 18194): Academic Year Afternoon
- Booking Course 25004 - Vincenzo Contu (booking 18226): General English AM Plus
- Booking Course 25005 - Claudia Mereu (booking 18227): General English AM
- Booking Course 25024 - Josimar Roberto (booking 18246): General English PM
- Booking Course 25027 - Jacqueline Olga Burgos (booking 18248): Academic Year Morning
- Booking Course 25031 - Brisia Garcia Roman (booking 18252): Academic Year Morning
- Booking Course 25036 - Jorge Perez Aldana (booking 18256): General English AM
- Booking Course 25039 - Cristian Ravai (booking 18259): General English PM Plus

4 blocked (payment/confirmation issues - cannot assign yet):
- Booking Course 96   - Alessandro Signorotti (booking 88): CONFIRMED, confirmed = false
- Booking Course 833  - Settiyanee Duangjai (booking 790): ESCROW, confirmed = false
- Booking Course 25007 - Nominjin Amartsogt (booking 18229): PARTIAL, confirmed = false
- Booking Course 25042 - Edith Nunes (booking 18262): PENDING, confirmed = false (EUR 456 outstanding)

Note: Booking Course 1818 (student 1071) and BC 24874 (student 14541) both named Natanael Reis - two separate student records, verify before assigning.

Fix recipe (NOT YET RUN - MUST RUN BY FRI 7 AUG EOD)

Step 1 - Check prior class for each Academic Year renewal student:
  SELECT sca.booking_course_id, sca.class_id, sca.week_end::date, c.name
  FROM public.student_class_assignments sca JOIN public.classes c ON c.id = sca.class_id
  WHERE sca.booking_course_id IN (108,109,1313,1818,24874,24915,24970,25004,25005,25024,25027,25031,25036,25039)
  ORDER BY sca.booking_course_id, sca.week_end DESC;

Step 2 - Assign via SIS admin: Classes => To Be Assigned => filter week 10-14 Aug 2026.
  AY renewals: continue same class as most recent prior assignment.
  Short-course (BCs 25004, 25005, 25024, 25036, 25039): assign to appropriate level.

Step 3 - Verify all 14 assigned:
  SELECT booking_course_id, class_id, week_start::date, week_end::date
  FROM public.student_class_assignments WHERE booking_course_id IN
  (108,109,1313,1818,24874,24915,24970,25004,25005,25024,25027,25031,25036,25039)
  AND week_start >= '2026-08-10' ORDER BY booking_course_id;

Step 4 - Resolve 4 blocked Booking Courses via SIS admin after payment confirmation.

Risk / category
- Category: bookings, class scheduling
- Risk: medium - wrong class assignment possible; use SIS admin UI not direct SQL
- Reversible: yes | Blast radius: 14 confirmed + 4 blocked, week of 10 Aug

Status: OPEN - fix NOT RUN.
14 confirmed students start Mon 10 Aug. Must assign by Fri 7 Aug EOD.

Last checked: Thu 6 Aug 2026 13:02 UTC (40th hourly check)