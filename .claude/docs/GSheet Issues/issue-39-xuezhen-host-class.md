Issue 39 -- Xuezhen Huang: Host Unclaimed + No Class Assignment

Reporter: Staff | Area: Booking/Accomm | Sheet row: 41

Symptom
Student paid for 3 weeks host family accommodation (12 Jul - 2 Aug). Not appearing for allocation. Class not assigned.

Root Cause
- Student 14443 (Xuezhen Huang), booking 17831: Confirmed, EUR 1396.90 fully paid
- Booking course 24609 (Morning General, 13 July to 31 July 2026): started TODAY, active = true
- Zero SCAs for student 14443 -- class not assigned (1 day into course as of 13 Jul UTC)
- Accommodation 11358 (bed 180, 12 July to 2 August 2026):
    claimStatus = null -- host Mary Carver has NOT claimed placement via portal
    bedId = 180, active = true, startDate = 12 Jul, endDate = 2 Aug
    Student was placed (bed assigned), but host has not confirmed
- 13 July 2026 UTC (Day 2 of accommodation, Day 1 of course)

Fix Recipe (NOT YET RUN)
Step 1: Host contact
  - Call/SMS Mary Carver (+353 87 927 1110) to claim via host portal, OR
  - Kelly manually confirms BA 11358 in admin UI (Accommodation > set claimStatus = confirmed)

Step 2: Class assignment
  - SIS UI > Classes > To Be Assigned > find Xuezhen Huang > assign to AM class (Morning General level)

Risk
Category: bookings + accomm (time-sensitive) | Reversible: yes | Blast radius: low (1 student)

Status: Open — Day 2 accomm, Day 1 course (Jul13 Mon). Host not claimed, 0 class assignments, Xuezhen missed Monday AM class. Last checked 13 July 2026 Mon UTC (55th check, hourly bot). Fix NOT RUN.
---
56th check 2026-07-13 Mon UTC

Unchanged. Accommodation 11358 claim status = still null. Booking course 24609 started today (Jul 13), 0 class assignments. Day 2 of accommodation, Day 1 of school.
Host Mary Carver: +353 87 927 1130 (NOT +353 87 927 1110 — check recipe Step 1 for correct number).
Fix NOT RUN. NEIL: call host AND assign class via SIS today.
Last checked: 2026-07-13 Mon UTC (56th check, hourly bot).

---
57th check 2026-07-13 Mon UTC

CONFIRMED UNCHANGED (fresh DB). BA 11358 (bed 180, Xuezhen s14443, Jul12-Aug2): claimStatus STILL null - Day 2, host Mary Carver (+353 87 927 1130) has not claimed. BC 24609 (Morning General Jul13-Jul31): started today, 0 SCAs, Day 1 class missed. Booking 17831 confirmed EUR 1396.90.
Fix NOT RUN. NEIL: (1) call Mary Carver +353 87 927 1130 or confirm BA 11358 manually in admin; (2) assign class for Xuezhen (BC 24609) via SIS > Classes > To Be Assigned.
Last checked: 2026-07-13 Mon UTC (57th check, hourly bot).


---
58th check 2026-07-14 Tue UTC

CONFIRMED UNCHANGED (fresh DB). Accommodation 11358 (bed 180, Xuezhen Huang s14443, Jul12-Aug2): claimStatus = STILL null — Day 3, host Mary Carver (+353 87 927 1130) has not claimed. Booking course 24609 (Morning General, Jul13-31): 0 class assignments, Day 2 (Tue). Student has missed Mon 13 + Tue 14. Booking 17831 confirmed EUR 1396.90/1396.90. Fix NOT RUN. NEIL: (1) call Mary Carver +353 87 927 1130 or confirm BA 11358 in SIS admin; (2) assign class for Xuezhen via SIS > Classes > To Be Assigned.
Last checked: 2026-07-14 Tue UTC (58th check, hourly bot).
---

## Status Update: 2026-07-14 TUE UTC (2nd check)

CONFIRMED UNCHANGED. Booking course 24609 (Xuezhen Huang, student 14443, Morning General, 13 Jul-31 Jul 2026): zero class assignments.

Day 2: Student missed classes on Mon 13 Jul and Tue 14 Jul (today) — 2 school days missed.
Accommodation 11358 (bed 180, 12 Jul-2 Aug 2026): active = true, claimStatus = null — still not claimed in Xero.

Action (NOT YET RUN):
1. Assign Xuezhen (student 14443) to Morning General class for week ending 17 Jul via SIS Admin > Classes > To Be Assigned.
2. Claim accommodation 11358 in Xero (flag to accounts team).

Fix NOT RUN. Last checked: 2026-07-14 TUE UTC (2nd check, hourly bot).

---
3rd check 2026-07-14 TUE UTC: BC24609 active=true scas=0. Day 2 missed. BA11358 claimStatus=null. UNCHANGED. Fix NOT RUN.

---
4th check 2026-07-14 TUE UTC: Booking course 24609 (Morning General, Jul13-Jul31) active=true 0 class assignments confirmed (fresh DB). Day 2 missed (Mon 13 + Tue 14 Jul). Accommodation 11358 (bed 180, 12 Jul-2 Aug): claimStatus=STILL null -- host Mary Carver (+353 87 927 1130) has not claimed. Booking 17831 confirmed EUR 1396.90/1396.90. Fix NOT RUN. NEIL: (1) call Mary Carver +353 87 927 1130 or confirm accommodation 11358 in SIS admin; (2) assign class for Xuezhen via SIS > Classes > To Be Assigned.
Last checked: 2026-07-14 TUE UTC (4th check, hourly bot).

---
5th check 2026-07-14 TUE UTC (this run) — G column updated by staff (dates added to issue description)

CONFIRMED UNCHANGED (fresh DB).

Booking course 24609 (Morning General, 13 July–31 July 2026): active = true, classAssignments = 0.
Student missed Day 1 (Mon 13 Jul) and Day 2 (Tue 14 Jul — today). Course ends 31 July.
Accommodation 11358 (bed 180, host Mary Carver, 12 July–2 August 2026): active = true, claimStatus = STILL null.
Booking 17831: Confirmed, EUR 1396.90/1396.90 fully paid.

Action (NOT YET RUN):
1. Assign Xuezhen Huang (student 14443) to Morning General class via SIS Admin > Classes > To Be Assigned.
2. Call host Mary Carver +353 87 927 1130 or confirm accommodation 11358 in SIS admin.
Fix NOT RUN. Last checked: 2026-07-14 TUE UTC (5th check, hourly bot).

---
8th check 2026-07-15 WED UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24609 (Morning General, 13 July--31 July 2026): active = true, classAssignments = 0. Student missed Day 1 (Mon 13 Jul), Day 2 (Tue 14 Jul), Day 3 (Wed 15 Jul -- today). 3 school days missed with no class assignment.
Booking 17831: Confirmed, EUR 1396.90/1396.90 fully paid, amountOpen = 0.
Accommodation 11358 (bed 180, 12 July--2 August 2026): active = true -- student placed and in-stay.

Action (NOT YET RUN):
1. Assign Xuezhen Huang (student 14443) to Morning General class via SIS Admin > Classes > To Be Assigned.
NEIL: This is urgent -- student has been in school 3 days with no class.
Fix NOT RUN. Last checked: 2026-07-15 WED UTC (8th check, hourly bot).

---
9th check 2026-07-15 WED UTC

CONFIRMED UNCHANGED (fresh DB). BC24609 (Morning General, Jul13-Jul31): active=true, class assignments=0. Day 3 missed (Mon13+Tue14+Wed15 Jul). BK17831: CONFIRMED EUR1396.90/1396.90 amtOpen=0. BA11358 (bed180, Jul12-Aug02): active=true fee=EUR900 -- accommodation OK.

Fix NOT RUN. NEIL: Assign Xuezhen Huang (s14443) to Morning General class via SIS Admin > Classes > To Be Assigned -- URGENT (3 missed days).
Last checked: 2026-07-15 WED UTC (9th check today, hourly bot).
---
15th check 2026-07-15 WED UTC (10th today)

CONFIRMED UNCHANGED (fresh DB). BC24609 (Morning General, 13 July-31 July 2026): active=true, class assignments=0. Day 3: student missed Mon 13, Tue 14, Wed 15 Jul. Booking 17831: CONFIRMED EUR 1396.90/1396.90 fully paid, amountOpen=0. Accommodation 11358 (bed 180, 12 Jul-2 Aug): active=true, claimStatus=STILL null (host Mary Carver has not claimed via portal; updatedAt=Jun26).

Actions (NOT YET RUN):
1. Assign Xuezhen Huang (student 14443) to Morning General class via SIS Admin > Classes > To Be Assigned (URGENT -- 3 missed days)
2. Call host Mary Carver +353 87 927 1130 or confirm accommodation 11358 in SIS admin

Fix NOT RUN. Last checked: 2026-07-15 WED UTC (15th check, 10th today, hourly bot).

---
18th check 2026-07-15 WED UTC

CONFIRMED UNCHANGED. BC24609 (Morning General, Jul13-Jul31): active=true, 0 SCAs -- Day 3 (Mon+Tue+Wed all missed). Booking 17831: CONFIRMED EUR1396.90/1396.90. BA11358 (bed 180): claimStatus=null (host Mary Carver still has not claimed).

Actions (NOT YET RUN):
1. Assign student 14443 to class for BC24609 via SIS Admin > Classes > To Be Assigned (URGENT)
2. Contact host Mary Carver (+353 87 927 1130) re: accommodation claim status

Fix NOT RUN. Last checked: 2026-07-15 WED UTC (18th check, hourly bot).


---
## 139th check Tue 28 Jul 2026 UTC

CONFIRMED UNCHANGED (fresh DB). BC 24609 (Morning General, Jul 13-31 2026): active=true, 0 class assignments. 18 school days missed. Course ends Fri 31 Jul — 3 days remain. BA 11358 (bed 180, Jul 12-Aug 2): active=true, EUR 900 — OK. Booking 17831: Confirmed EUR 1396.90/1396.90.

CRITICAL: assign student 14443 to Morning General class for BC 24609 TODAY. Only Tue 28 + Wed 29 + Thu 30 + Fri 31 Jul remain. Jul 13-25 attendance permanently irrecoverable.

Fix NOT RUN. Last checked: Tue 28 Jul 2026 UTC (139th check).
