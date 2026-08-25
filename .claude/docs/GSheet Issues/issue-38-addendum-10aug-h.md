Issue 38 Addendum 10 Aug 2026 (h) - 0-SCA Booking Courses: Fri Deadline + Aug-10 Starters
Reporter: ST (staff) | Sheet row: 40 | Check: 109th hourly, Mon 10 Aug 2026 UTC

CHANGE SINCE 108th CHECK
None. Eduardo and the other Aug-10 starters remain unassigned. Fidelo ghosts unchanged.

CURRENT STATE (live DB 10 Aug 2026)

URGENT - Ending Friday 14 Aug 2026, 5 Booking Courses with 0 class assignments:
BC 25043 | Eduardo Roche Diaz    | General English PM      | Aug 10-14  | 0 SCAs | MOST URGENT (Day 1 today)
BC 1144  | Anar-Erdene Batbayar  | Academic Year Morning   | Feb 23-Aug 14 | 0 SCAs | Fidelo artefact
BC 1305  | Nomin Nergui          | Academic Year Morning   | Apr 27-Aug 14 | 0 SCAs | Fidelo artefact
BC 1344  | Bat-Orgil Baljinnyam  | Academic Year Morning   | Feb 23-Aug 14 | 0 SCAs | Fidelo artefact
BC 1591  | Turbold Altankhuyag   | Academic Year Morning   | Feb 23-Aug 14 | 0 SCAs | Fidelo artefact

Aug-10 starters with 0 class assignments (6 Booking Courses, started today):
BC 25043 | Eduardo Roche Diaz          | GE PM         | end Aug 14       (most urgent - also Fri deadline above)
BC 1313  | Ana Luiza De Sousa          | AY Afternoon  | end Aug 28
BC 25039 | Cristian Ravai              | GE PM Plus    | end Aug 28
BC 25024 | Josimar Roberto             | GE PM         | end Aug 21
BC 25036 | Jorge Perez Aldana          | GE AM         | end Sep 4
BC 24970 | Tsengelbayar Mendsaikhan    | AY Afternoon  | end Jan 29 2027

Aug-3 stragglers still 0 SCAs (6 Booking Courses, unchanged):
BC 1766, 25003, 25010, 25016, 25029, 25035 - incl. Rakan Alghamdi (also Issue 12, day 8)

FIX RECIPE - NOT YET RUN

Step 1 - IMMEDIATE: Assign Eduardo BC 25043 to GE PM class, Mon 10 - Fri 14 Aug.
Step 2 - TODAY: Assign 5 other Aug-10 starters (BC 1313, 25039, 25024, 25036, 24970).
Step 3 - INVESTIGATE Fidelo ghost Booking Courses ending Fri (1144, 1305, 1344, 1591):
  Verify not attending, then deactivate:
  UPDATE booking_courses SET active = false WHERE id IN (1144, 1305, 1344, 1591);
  (NOT YET RUN - verify attendance records first)
Step 4 - THIS WEEK: Assign Aug-3 stragglers (6 Booking Courses including Rakan, coordinate with Issue 12).

RISK: HIGH for live starters (no attendance recording if unassigned). MEDIUM for Fidelo ghost deactivation (verify first).

STATUS: Open - 10 Booking Courses with 0 SCAs. Eduardo most urgent (ends Fri 14 Aug).
Last checked: 10 Aug 2026 UTC (109th hourly run)