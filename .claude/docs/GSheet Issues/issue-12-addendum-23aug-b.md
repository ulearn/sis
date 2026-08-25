Issue 12 -- Rakan Alghamdi (student 14444)
Reporter: AC | Area: Booking / Accomm | Sheet row 13

Symptom
Rakan's SCA 288 is on BC 24697 (ended 31 Jul 2026, stale). BC 25035 (Aug 3 to Jan 8 2027) has 0 SCAs.
Rakan unclassed for 20 days (Aug 3-23).

Root cause
- BC 24697 (Academic Year Morning): endDate 2026-07-31, active = true -- 23 days stale
- SCA 288: class 12, on BC 24697, weekEnd 2026-12-18 -- 5 months beyond BC end date
- BC 25035 (General English Academic Year AM Plus): startDate 2026-08-03, endDate 2027-01-08, 0 SCAs
- Rakan unclassed since 2026-08-03 = 20 days

Fix recipe (NOT YET RUN)

Step 1: Trim SCA 288 weekEnd to 2026-07-31
Step 2: Deactivate BC 24697 (active = false)
Step 3: Create SCA on BC 25035 -- Class: 12, weekStart: 2026-08-03, weekEnd: 2027-01-08

Risk / category
- Category: bookings / class assignments
- Reversible: yes
- Blast radius: student 14444 only

Status: OPEN -- Fix NOT RUN
Last checked: 2026-08-23 UTC (483rd run, 194th issue check)