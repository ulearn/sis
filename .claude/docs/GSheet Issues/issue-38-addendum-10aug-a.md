# Issue 38 — Class Assignment Failure (Mon 10 Aug)

Reporter: PG | Area: Holidays, Bookings etc. | Sheet row: 40

## Root Cause (100th check — Mon 10 Aug 2026 UTC)
All 17 booking courses with startDate 2026-08-10 remain at 0 class assignments. Classes are NOW IN SESSION.

Confirmed BCs (13) — assign NOW:
- BC 108 — Lucia Borroni (Intensive General 30)
- BC 109 — Maicol Moretti (Morning General)
- BC 1313 — Ana Luiza De Sousa (Academic Year Afternoon)
- BC 1818 — Natanael Reis Lourenco de Sales (Academic Year Morning)
- BC 24915 — Toshimi Hanakawa (Academic Year Morning)
- BC 24970 — Tsengelbayar Mendsaikhan (Academic Year Afternoon)
- BC 25004 — Vincenzo Contu (General English AM Plus)
- BC 25005 — Claudia Mereu (General English AM)
- BC 25024 — Josimar Roberto (General English PM)
- BC 25027 — Jacqueline Olga Burgos (Academic Year Morning)
- BC 25031 — Brisia Garcia Roman (Academic Year Morning)
- BC 25036 — Jorge Perez Aldana (General English AM)
- BC 25039 — Cristian Ravai (General English PM Plus)

Unconfirmed BCs (4) — hold until booking confirmed:
- BC 96 — Alessandro Signorotti (confirmed=false)
- BC 833 — Settiyanee Duangjai (confirmed=false)
- BC 25007 — Nominjin Amartsogt (confirmed=false)
- BC 25042 — Edith Nunes (confirmed=false)

## Fix Recipe (NOT YET RUN)
Step 1: SIS Admin -> Booking Courses -> filter startDate=2026-08-10 -> assign class for each confirmed BC. Set week_start=2026-08-10.
Step 2: Investigate unconfirmed 4; hold until confirmed.
Step 3 — Verify:
  SELECT bc.id, s."firstName", s."lastName", COUNT(sca.id) as sca_count
  FROM "BookingCourse" bc
  JOIN "Booking" b ON bc."bookingId" = b.id
  JOIN "Student" s ON b."studentId" = s.id
  LEFT JOIN "StudentClassAssignment" sca ON sca."bookingCourseId" = bc.id
  WHERE bc."startDate" = '2026-08-10' AND bc.active = true
  GROUP BY bc.id, s."firstName", s."lastName";

## Risk
Category: bookings / class operations | Reversible: yes | Blast radius: 13 students without class placement

## Status: CRITICAL — Classes In Session
Last checked: 2026-08-10 UTC (100th hourly check)