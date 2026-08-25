Issue 8 -- ILEP Codes Missing for Aug 2026 AY Students

Reporter: Staff | Area: Doc Gen / Certs | Sheet row: 9

Symptom
Cannot generate certificates for some ILEP students. Certificate generation requires an ILEP code on the booking course.

Root Cause (13 July 2026 UTC, 22nd check)
- Diego Alves da Silva Molina (booking 18183, BC 24959):
    AY Morning 3 Aug 2026 to 5 Feb 2027 -- ILEP code = null (21 days to start)
    Booking 18183 now Confirmed, fully paid EUR 1735
- Aurora Madril Oliveira Molina (BC 24958):
    ILEP code = 0318/0010 -- RESOLVED
- Pedro De Pauli Pastre (student 911):
    Older BCs 1602 (ilep 0318/0011) and 1603 (ilep 0318/0012) from 2025-26
    No active AY 2026-27 booking course in SIS -- may need renewal booking

Fix Recipe (NOT YET RUN)
For Diego BC 24959:
  SET ilep_code on booking_courses WHERE id = 24959
  Use next available ILEP code in sequence (check existing codes: Aurora = 0318/0010, Pedro prev = 0318/0011, 0318/0012)
  Example: UPDATE booking_courses SET ilep_code = 0318/0013 WHERE id = 24959;
  (Verify correct ILEP prefix and next sequence number with Neil / admin)

For Pedro 2026-27:
  Check HubSpot deal -- if renewed, create booking course in SIS for AY 2026-27

Risk
Category: documents | Reversible: yes (update ILEP code) | Blast radius: low (1 student for cert)

Status: Open -- Diego ILEP null, 21 days to start (Aug 3). Last checked 13 July 2026 UTC.

---
23rd check 2026-07-14 Tue UTC

CONFIRMED UNCHANGED (fresh DB). Booking course 24959 (Diego Alves da Silva Molina, AY Morning, 3 Aug 2026 to 5 Feb 2027): ilepCode = STILL null, 20 days to start.

ILEP CODE CORRECTION: Prior recipe suggested 0318/0013 — incorrect. Aurora (BC24958, same course type AY Morning, same start Aug 3) has 0318/0010. All other AY Morning Aug 2026 starters also use 0318/0010.
Correct fix (NOT YET RUN): UPDATE booking_courses SET ilep_code = '0318/0010' WHERE id = 24959;
Or via SIS admin: Student > Booking 18183 > Booking Course 24959 > ILEP Code = 0318/0010.

Pedro De Pauli Pastre (student 911): no 2026-27 AY booking course in SIS. Fix NOT RUN.
Last checked: 2026-07-14 Tue UTC (23rd check, hourly bot).
---
26th check 2026-07-14 Tue UTC -- PARTIAL PROGRESS: Diego ILEP now set

NEW FINDING: Booking course 24959 (Diego Alves da Silva Molina, AY Morning, 3 Aug 2026): ilepCode = NOW 0318/0010 -- FIXED since the 23rd check earlier today.

Still null -- 20 days to 3 August start:
- Booking course 97 (Gustavo Ferreira, student 83, AY Morning, 3 Aug 2026): ilepCode = STILL null
  Fix (NOT YET RUN): UPDATE booking_courses SET ilep_code = '0318/0010' WHERE id = 97;
  Or SIS admin: student 83 > booking > BC97 > ILEP Code = 0318/0010 (same AY Morning code)
- Booking course 24970 (Tsengelbayar Mendsaikhan, student 948, AY Afternoon, 3 Aug 2026): ilepCode = STILL null
  AY Afternoon ILEP code is unknown -- must be obtained from ILEP office before this can be set.

Pedro De Pauli Pastre (student 911): still no 2026-27 AY booking course in SIS. Check HubSpot deal; if renewed, create booking course.

Status: 1 of 3 fixed (Diego done). BC97 + BC24970 + Pedro still outstanding. 20 days to August 3 start.
Last checked: 2026-07-14 Tue UTC (26th check, hourly bot).

---

## Status Update: 2026-07-14 TUE UTC (28th check)

BC24959 Diego ILEP = 0318/0010 — FIXED. BC97 Gustavo ILEP = still null. BC24970 Tsengelbayar ILEP = still null.

NEW FINDING — August BH overlap: All three booking courses (BC97, BC24959, BC24970) start 3 August 2026 = Irish August Bank Holiday Monday. That date is MISSING from school_closures (see Issue 38). The shunt will not fire without a bank holiday record; students course start dates will land on a bank holiday with no shunt.

RECOMMENDED ORDER (NOT YET RUN):
1. Add August Bank Holiday (3 Aug 2026) to school_closures — see Issue 38 recipe.
2. Set ILEP codes on BC97 + BC24970:
   UPDATE booking_courses SET ilep_code = '0318/0010' WHERE id IN (97, 24970);
   (Confirm AY Morning ILEP code is correct for 2026-27 before running.)

20 days to Aug 3. Fix NOT RUN. Last checked: 2026-07-14 TUE UTC (28th check, hourly bot).

---
29th check 2026-07-14 TUE UTC: BC24959 Diego ILEP=0318/0010 (FIXED). BC97 Gustavo ILEP=null (start Aug 3). BC24970 Tsengelbayar ILEP=null (start Aug 3). Aug BH still missing from school_closures. 20 days to Aug 3. UNCHANGED. Fix NOT RUN.

---
30th check 2026-07-14 TUE UTC: Booking course 24959 (Diego Alves da Silva Molina) ILEP=0318/0010 FIXED. Booking course 97 (Gustavo Ferreira, student 83, Academic Year Morning, start Aug 3): ilepCode=STILL null. Booking course 24970 (Tsengelbayar Mendsaikhan, student 948, Academic Year Afternoon, start Aug 3): ilepCode=STILL null. Booking 18194 (Tsengelbayar): status=PARTIAL. August Bank Holiday Mon 3 Aug still missing from school_closures (see Issue 38) -- shunt will not fire without it. Fix NOT RUN. NEIL: (1) add Aug BH to school_closures (Issue 38 recipe); (2) set ILEP code 0318/0010 on booking course 97 via SIS admin; (3) obtain Academic Year Afternoon ILEP code for booking course 24970 from ILEP office.
Last checked: 2026-07-14 TUE UTC (30th check, hourly bot).

---
31st check 2026-07-14 TUE UTC (this run)

PROGRESS: All 3 original issue students now have ILEP codes.
- Booking course 24959 (Diego Alves da Silva Molina, student 840, AY Morning, Aug 3): ILEP = 0318/0010 — FIXED
- Booking course 24958 (Aurora Madril Oliveira Molina, student 841, AY Morning, Aug 3): ILEP = 0318/0010 — FIXED (confirmed this run)
- Pedro De Pauli Pastre (student 911): booking courses 1602 (ILEP 0318/0011) and 1603 (ILEP 0318/0012) carry codes — FIXED

Still null — 20 days to 3 August start:
- Booking course 97 (Gustavo Ferreira, student 83, AY Morning, 3 Aug 2026): ilepCode = STILL null — booking PENDING
  Fix (NOT YET RUN): UPDATE booking_courses SET ilep_code = '0318/0010' WHERE id = 97;
- Booking course 24970 (Tsengelbayar Mendsaikhan, student 948, AY Afternoon, 3 Aug 2026): ilepCode = STILL null — booking PARTIAL
  AY Afternoon ILEP code unknown — obtain from ILEP office before setting.

August Bank Holiday (Mon 3 Aug 2026) still absent from school_closures (9 records: Christmas + Good Friday only). Shunt will not apply. See Issue 38 recipe.
Fix NOT RUN. Last checked: 2026-07-14 TUE UTC (31st check, hourly bot).

---
## Re-diagnosis — 15 Jul 2026 UTC (B/F/G hash changed)

Sheet row 9 (Issue 8): Diego/Pedro/Aurora ILEP cert codes.

FULL RESOLUTION STATUS:

Diego Alves da Silva Molina (student 840):
  - Certificate document record 181: ISSUED 5 Jun 2026 — RESOLVED
  - New booking 18183, BC 24959 (AY Morning, Aug 3 2026): ILEP=0318/0010 — set
  - Old booking 1386: BCs 1482 (ended Dec 2025), 1483 (ended Feb 2026), 1484 (ended Jun 2026) all active=true — stale

Pedro De Pauli Pastre (student 911):
  - Certificate document record 184: ISSUED 5 Jun 2026 — RESOLVED
  - Booking 1460: BCs 1602 (ended Dec 2025), 1603 (ended Jun 2026) both active=true — stale
  - No 2026-27 AY booking course found — may not have renewed

Aurora Madril Oliveira Molina (student 841):
  - Certificate document record 183: ISSUED 5 Jun 2026 — RESOLVED
  - New booking 18182, BC 24958 (AY Morning, Aug 3 2026): ILEP=0318/0010 — set
  - Old booking 1387: BCs 1485 (ended Dec 2025), 1486 (ended Feb 2026), 1487 (ended Jun 2026) all active=true — stale

CLEANUP NEEDED (NOT YET RUN):
  Deactivate 8 stale BCs: 1482, 1483, 1484, 1485, 1486, 1487, 1602, 1603
  Via SIS Admin: each booking course > set active=false
  Verify Pedro renewal status in HubSpot — no 2026-27 course in SIS

Last checked: 15 July 2026 UTC (hourly bot, B/F/G hash changed, triggered re-diagnosis)

---
**16 Jul 2026 UTC (2nd check today, fresh DB)**

CONFIRMED UNCHANGED. All 8 stale booking courses still active=true.

Day counts as of 16 Jul 2026:
- Booking courses 1482, 1485, 1602 (ended 19 December 2025): ~209 days stale
- Booking courses 1483, 1486 (ended 13 February 2026): ~153 days stale
- Booking courses 1484, 1487, 1603 (ended 5 June 2026): ~41 days stale

Diego BC24959 ILEP=0318/0010 confirmed set. Aurora BC24958 ILEP=0318/0010 confirmed set. Pedro still has no 2026-27 booking course.

Fix (NOT YET RUN): UPDATE booking_courses SET active = false WHERE id IN (1482, 1483, 1484, 1485, 1486, 1487, 1602, 1603);
Last checked: 2026-07-16 UTC (2nd check today, hourly bot).
**4th check Sat 18 Jul UTC (fresh DB). CONFIRMED UNCHANGED. All 8 stale BCs still active=true: BCs 1482+1485+1602 ended Dec19 2025 (213d stale), BCs 1483+1486 ended Feb13 2026 (157d stale), BCs 1484+1487+1603 ended Jun05 2026 (43d stale). Diego BC24959 ILEP=0318/0010 set. Aurora BC24958 ILEP=0318/0010 set. Pedro has no 2026-27 booking course. Fix (NOT RUN): UPDATE booking_courses SET active=false WHERE id IN (1482,1483,1484,1485,1486,1487,1602,1603). Last checked: 2026-07-18 SAT UTC.**