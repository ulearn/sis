# Issue 38 - Class Assignment Failure (Mon 10 Aug - 2nd check)

Reporter: PG | Area: Holidays, Bookings etc. | Sheet row: 40

## Root Cause (102nd check - Mon 10 Aug 2026 UTC)
All 17 booking courses with start_date 2026-08-10 still at 0 class assignments. Classes are NOW IN SESSION - day 1. No change since 101st check.

Confirmed Booking Courses (13) - assign NOW:
- BC 108 - Lucia Borroni (Intensive General 30, ends 2026-08-28)
- BC 109 - Maicol Moretti (Morning General, ends 2026-08-21)
- BC 1313 - Ana Luiza De Sousa (Academic Year Afternoon, ends 2026-08-28)
- BC 1818 - Natanael Reis Lourenco de Sales (Academic Year Morning, ends 2026-12-18)
- BC 24915 - Toshimi Hanakawa (Academic Year Morning, ends 2027-01-29)
- BC 24970 - Tsengelbayar Mendsaikhan (Academic Year Afternoon, ends 2027-01-29)
- BC 25004 - Vincenzo Contu (General English AM Plus, ends 2026-08-14)
- BC 25005 - Claudia Mereu (General English AM, ends 2026-08-14)
- BC 25024 - Josimar Roberto (General English PM, ends 2026-08-21)
- BC 25027 - Jacqueline Olga Burgos (Academic Year Morning, ends 2027-02-12)
- BC 25031 - Brisia Garcia Roman (Academic Year Morning, ends 2027-02-12)
- BC 25036 - Jorge Perez Aldana (General English AM, ends 2026-09-04)
- BC 25039 - Cristian Ravai (General English PM Plus, ends 2026-08-28)

Unconfirmed Booking Courses (4) - hold:
- BC 96 - Alessandro Signorotti (confirmed=false, EUR 1,845 / 2,095 partial)
- BC 833 - Settiyanee Duangjai (ESCROW, confirmed=false)
- BC 25007 - Nominjin Amartsogt (PARTIAL, confirmed=false, EUR 980 / 1,350)
- BC 25042 - Edith Nunes (PENDING, EUR 0 / 456)

## Fix Recipe (NOT YET RUN)
Step 1: SIS Admin -> Class Assignment -> filter start_date = 2026-08-10 -> assign each confirmed BC to its class.
Step 2: Hold the 4 unconfirmed BCs until payment/confirmation resolved.
Step 3 - Verify:
  SELECT bc.id, s.first_name, s.last_name, COUNT(sca.id) AS sca_count
  FROM booking_courses bc
  JOIN bookings b ON bc.booking_id = b.id
  JOIN students s ON b.student_id = s.id
  LEFT JOIN student_class_assignments sca ON sca.booking_course_id = bc.id
  WHERE bc.start_date = '2026-08-10' AND bc.active = true
  GROUP BY bc.id, s.first_name, s.last_name;

## Risk
Category: bookings / class operations | Reversible: yes | Blast radius: 13 students in school with no class placement

## Status: CRITICAL - Classes In Session, Still Unassigned
Last checked: 2026-08-10 UTC (102nd hourly check)