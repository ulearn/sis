Issue 38 Addendum 10 Aug 2026 (f) - 0-SCA Booking Courses: Aug-14 Deadline and Migration Ghost BCs

Reporter: ST (staff)
Area: Course date / class assignment UX
Sheet row: 40
Check: 107th hourly, Mon 10 Aug 2026 UTC

SYMPTOM
Students have active Booking Courses with no class assignments.

CURRENT STATE (live, 10 Aug 2026 UTC)

URGENT - 7 Booking Courses ending Friday 14 Aug 2026 with 0 class assignments

Group A - new Aug-10 starters (5-day courses, need assignment TODAY):
BC 25004 | Vincenzo Contu (student 14597) | General English AM Plus | start 2026-08-10 | end 2026-08-14
BC 25005 | Claudia Mereu (student 14598) | General English AM | start 2026-08-10 | end 2026-08-14
BC 25043 | Eduardo Roche Diaz (student 14602) | General English PM | start 2026-08-10 | end 2026-08-14
These students started this morning. Courses end Friday. If no SCA by tomorrow, full week with no attendance record.

Group B - old Fidelo migration BCs ending Fri (likely stale artefacts, Academic Year Morning):
BC 1144 | Anar-Erdene Batbayar (student 588) | start 2026-02-23 | end 2026-08-14 | no other active BCs
BC 1305 | Nomin Nergui (student 740) | start 2026-04-27 | end 2026-08-14 | no other active BCs
BC 1344 | Bat-Orgil Baljinnyam (student 760) | start 2026-02-23 | end 2026-08-14 | no other active BCs
BC 1591 | Turbold Altankhuyag (student 901) | start 2026-02-23 | end 2026-08-14 | no other active BCs
All CONFIRMED, 0 SCAs throughout. Almost certainly Fidelo migration artefacts - students managed in Fidelo, never onboarded to SIS class management.

Aug-10 starters - 18 with 0 SCAs (unchanged from last check):
15 CONFIRMED + 3 non-Confirmed: BC 833 (Settiyanee Duangjai, ESCROW), BC 25007 (Nominjin Amartsogt, PARTIAL), BC 25042 (Edith Nunes, PENDING)

Aug-3 stragglers - 6 still 0 SCAs (down from 8; 2 newly assigned since last check):
BC 1766 | Maria Eduarda Alves Paiva | AY Renewal Morning | end 2026-09-04
BC 25035 | Rakan Alghamdi | GE AY AM Plus | end 2026-12-18 (also tracked in Issue 12)
BC 25003 | Aleix Cervera Gonzalez | GE AM | end 2026-09-18
BC 25010 | Alin Merticariu | GE AM | end 2026-08-28
BC 25029 | Monica Breier Fiametti | AY Morning | end 2026-11-13
BC 25016 | Anderson da Silva Martins | Life Pass Morning | end 2027-01-22

ROOT CAUSE
1. New weekly starters have no automatic class assignment - staff must assign manually.
2. Fidelo migration BCs: students managed entirely in Fidelo, never onboarded to SIS class management. 0 SCAs for full duration.

FIX RECIPE - NOT YET RUN

Step 1 - IMMEDIATE: Assign classes for Group A (BC 25004, 25005, 25043)
Via SIS admin class scheduling UI (or scripts/class-assign.ts):
- BC 25004 (Vincenzo Contu): General English AM Plus class, Mon 10 to Fri 14 Aug
- BC 25005 (Claudia Mereu): General English AM class, Mon 10 to Fri 14 Aug
- BC 25043 (Eduardo Roche Diaz): General English PM class, Mon 10 to Fri 14 Aug

Step 2 - INVESTIGATE: Group B migration BCs (BC 1144, 1305, 1344, 1591)
Verify students not currently attending (check physical register / Fidelo export).
Then if confirmed as artefacts, run (NOT YET RUN):
  UPDATE booking_course SET active = false WHERE id IN (1144, 1305, 1344, 1591);

Step 3 - Aug-10 non-Confirmed starters (BC 833, 25007, 25042)
Check payment status with finance before assigning to class:
- BC 833 (Settiyanee Duangjai, ESCROW): assign if TransferMate escrow confirmed
- BC 25007 (Nominjin Amartsogt, PARTIAL): check outstanding balance per school policy
- BC 25042 (Edith Nunes, PENDING): verify with accounts first

Step 4 - Assign remaining Aug-3 stragglers (6 BCs)
Assign each to appropriate class. Coordinate BC 25035 (Rakan Alghamdi) with Issue 12.

RISK
Group A: HIGH - students in school today, no attendance record without SCA
Group B: MEDIUM - ghost BC deactivation safe; verify before running
Aug-3 stragglers: HIGH - day 8 without attendance tracking
Category: bookings / class-assignment | Reversible: Yes

Status: NOT YET RUN
Last checked: 10 Aug 2026 UTC (107th hourly run)