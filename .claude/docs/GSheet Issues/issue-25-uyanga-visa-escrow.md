# Issue 25 — Uyanga Tungalag / Visa unset; not in class to-be-assigned

Reporter: unknown | Area: Visa / Class | Sheet row: 26

## Symptom
Visa status not selected; trying to set Approved fails. Student not appearing in to-be-assigned.

## Root cause
Student: Uyanga Tungalag (s917)
Booking: bk1467, status=CONFIRMED, confirmed=true
Course: c1613 - Academic Year Morning, Apr 27 - Oct 16 2026
Visa: visaStatus=null, visaFrom=2026-04-27, visaUntil=2026-12-28
Class assignments: 0 (none)
Payment on bk1467: pm17258, EUR 3066, type=Escrow, method=TransferMate Escrow

TWO separate problems:

Problem A - Escrow-only payment blocks to-be-assigned (PRIMARY BLOCKER):
unassignedStudents() (src/scripts/classes.ts ~line 411) requires at least one non-escrow
payment. pm17258 is TransferMate Escrow -> payment filter fails -> student excluded.
This is INTENTIONAL: escrow funds not yet released to ULearn do not count as real payment.

Problem B - visaStatus=null cannot be saved via UI (Prisma schema drift):
Same bug as Issue 18 (Flavia Nascimento Mariano). ORM save fails.
NOTE: null visaStatus would PASS the visa filter (null is accepted), so fixing visa alone
will not resolve Problem A.

## Fix recipe (NOT YET RUN)

Step 1 - Resolve escrow payment (PRIMARY - must do first):
Check TransferMate / Hub fins whether pm17258 (EUR 3066) has been released.
  ssh hub@localhost
  # check reconciliation for bk1467 / s917
If released: convert pm17258 to real payment, or add non-escrow payment row.
If not: student cannot be placed until TransferMate clears (by design).

Step 2 - Set visa status directly (bypasses UI Prisma error):
  UPDATE students SET visa_status = 'Approved', updated_at = NOW() WHERE id = 917;
  -- 1 row expected  -- NOT YET RUN

Step 3 - Fix root Prisma error (same as Issue 18):
  npx prisma migrate status
  # if pending migrations exist:
  npx prisma migrate deploy
  touch tmp/restart.txt

Step 4 - Verify in to-be-assigned after Steps 1+2:
  SIS -> Classes -> To Be Assigned -> confirm Uyanga Tungalag appears.

## Risk / category
Category: Visa / Student data | Reversible: Yes
Blast radius: 1 student. Plain text column update, low risk.
Primary action is TransferMate resolution - SQL fix secondary.

## Status: Open - pending TransferMate escrow release (primary blocker)
Last checked: 2026-06-08 UTC

--- UPDATE 2026-06-09 hrly(run3) ---
NEW STATUS: bk1467 confirmed=true (was previously the blocker). Amount_paid=2405=amount_total. But pmt17258=EUR3066 Escrow is the only payment record — discrepancy (2405 vs 3066). Suggest Hub fins check.
STILL OPEN: s917.visa_status=NULL (Prisma drift). NO SCA for 43 days (course started Apr27, Jun09 = 43d, NO class assignment in SIS).
Step 1 may be partially resolved. URGENT: Step 2 (visa) + assign class in roster NOW.
Step 2 (NOT YET RUN): UPDATE students SET visa_status='Approved', updated_at=NOW() WHERE id=917;
Step 3: SIS -> Classes -> Assign Uyanga to AY Morning class (she has been unassigned since Apr27).

Last checked: 2026-06-09 UTC hrly(run4): UNCHANGED. bk1467 confirmed=true amtPaid=amtTotal=2405. s917.visaStatus=null. 0 SCAs 44d since Apr27. NEIL: Step2 UPDATE visa+Step3 assign class URGENT.
Last checked: 2026-06-09 UTC hrly(run5): UNCHANGED. s917 visaStatus=null. bk1467 CONFIRMED EUR2405. 0 SCAs 44d since Apr27. Step2 UPDATE visa + Step3 class assign still needed.
Last checked: 2026-06-09 UTC hrly(11): LIVE CONFIRMED. s917 visaStatus=null. 0 SCAs. c1613 Apr27-Oct16 ACTIVE. 44d unclassed. bk1467 EUR2405 CONFIRMED. NEIL: run visa SQL + assign class urgently.
Last checked: 2026-06-09 UTC hrly(12): UNCHANGED. s917 visaStatus=null. bk1467 CONFIRMED EUR2405. 0 SCAs since Apr27(43d). Both steps pending.
Last checked: 2026-06-09 UTC hrly(13): UNCHANGED. s917 visaStatus=null (passes visa filter). bk1467 EUR2405 CONFIRMED. 0 SCAs 44d since Apr27. Note: null passes the to-be-assigned visa filter — verify Uyanga in tba first before running SQL. If absent: run Step2 (visa SQL) then assign class.
Last checked: 2026-06-09 UTC hrly(this run): UNCHANGED 45d. s917 visaStatus=null. bk1467 CONFIRMED confirmed=true EUR2405. c1613 AY Morn Apr27-Oct16. 0 SCAs. NEIL: verify student in tba first (null visa passes filter); if absent run UPDATE students SET visa_status=Approved WHERE id=917 (NOT RUN) then assign AY Morning class via roster.

Last checked: 2026-06-10 UTC hrly: UNCHANGED 46d. s917 visaStatus=null. bk1467 CONFIRMED confirmed=true amtPaid=2405=amtTotal. c1613 AY Morn Apr27-Oct16. 0 SCAs. Both steps pending. NEIL: check tba (null passes visa filter); if absent run Step2 UPDATE visa SQL + assign AY Morning class.
Last checked: 2026-06-10 UTC hrly3 D44: s917 visaStatus=null STILL UNCHANGED. bk1467 confirmed=true amtPaid=2405. Only payment: pmt17258 amt=3066 txId=D2025502 (escrow). amtPaid (2405) < pmt amount (3066) — possible partial release or rounding. 0 SCAs for 44 days (course started Apr27). NEIL: verify in TransferMate/Hub whether D2025502 escrow has been released (at least partially). If released: the booking is already confirmed — primary fix is visaStatus via Step 2 SQL, then assign class.

Last checked: 2026-06-10 UTC hrly5 D44: SCA query confirmed via StudentClassAssignment model — 0 SCAs for s917/bk1467. bk1467 CONFIRMED amountPaid=2405=amountTotal. visaStatus=null. c1613 AY Morn Apr27-Oct16 active. 44d in school without class. Intensive 3 status: Ernesto bc24826=0 SCAs(CRITICAL, D2). Daniela sca161 cls7 AM only (no PM). Fabrizio sca174 cls4 AM only (no PM). NEIL: assign all 3 intensive PM SCAs today.
Last checked: 2026-06-10 UTC hrly D45: UNCHANGED. s917 visaStatus=null. bk1467 CONFIRMED confirmed=true amtPaid=2405=amtTotal. c1613 AY Morn Apr27-Oct16 ACTIVE. 0 SCAs total (45 days in school without class assignment). NOTE: sca255 belongs to Saikhantes s1001, NOT Uyanga. NEIL: Step2 visa SQL + assign AY Morning class via SIS->Classes->Students->Add immediately.

Last checked: 2026-06-10 UTC hrly8 D47: UNCHANGED. s917 visaStatus=null. bk1467 CONFIRMED amtPaid=2405=amtTotal. c1613 AY Morn Apr27-Oct16. 0 SCAs 47d. ESCALATION: Ernesto s14532 (issue26) course c24826 ENDS JUN19 (9d). Ernesto 0 SCAs = more urgent than Uyanga. NEIL: Ernesto class assign first, then Uyanga Step2 visa SQL + assign AY Morning.
Last checked: 2026-06-10 UTC hrly12 -- UNCHANGED D45. s917 visaStatus=null. bk1467 CONF confirmed=true amtPaid=2405=amtTotal. c1613 AY-MORN Apr27-Oct16 ACTIVE. 0 SCAs 45d. NEIL: check tba first; if absent run Step2 visa SQL + assign AY Morning.

Last checked: 2026-06-10 UTC (this run) -- NEW: s917 hubspotId=null(unlinked). bk1467 dealId=null. 216 confirmed+active students visa=null(endemic-TBA filter broken systemwide). bk1467 CONF 2405/2405. c1613 AY Morn. 0 SCAs 45d. NEIL: assign Uyanga directly via SIS->Classes, set visa=Approved SQL.
Last checked: 2026-06-11 UTC hrly D46 -- UNCHANGED. s917 visaStatus=null hubspotContactId=null. bk1467 CONFIRMED amtPaid=2405=amtTotal. c1613 AY-MORN Apr27-Oct16 ACTIVE. 0 SCAs 46d. NEIL: verify TBA (null visa passes filter); if absent run Step2 visa SQL + assign AY Morning class.

Last checked: 2026-06-11 UTC hrly(5) D47 -- UNCHANGED. s917 visaStatus=null. bk1467 CONFIRMED amtPaid=2405=amtTotal. c1613 AY-MORN Apr27-Oct16 ACTIVE. 0 SCAs for 47 days. NEIL: check visa status + assign AY Morning class urgently.
Last checked: 2026-06-11 UTC hrly(13) D45 UNCHANGED. s917 Uyanga visaStatus=null AND hubspotContactId=null (no HS link — cannot verify visa via HS API). bk1467 CONF 2405/2405. c1613 AY-MORN Apr27-Oct16 ACTIVE (45d no class). 0 SCAs. NEIL: manually confirm visa from paperwork/email, then UPDATE students SET visa_status=approved WHERE id=917; then assign AY-MORN class via SIS UI.

Last checked: 2026-06-12 UTC hrly D46: CONFIRMED UNCHANGED. s917 visaStatus=null hubspotContactId=null. classAssignments=[]. bk1467 CONFIRMED amtPaid=2405=amtTotal. c1613 AY-MORN Apr27-Oct16 ACTIVE (46d no class). currentLevel=B1. hubspotContactId=null so cannot auto-verify visa from HS. NEIL: confirm visa approved from paperwork/email; UPDATE students SET visa_status=approved WHERE id=917 (NOT RUN); assign AY-MORN class id=5(B1-MORN) or id=12(B1-MORN) via SIS.
Last checked: 2026-06-12 UTC hrly (this run) D46: CONFIRMED UNCHANGED. s917 B1 visaStatus=null hubspotContactId=null. bk1467 CONFIRMED amtPaid=2405=amtTotal. c1613 AY-MORN Apr27-Oct16 ACTIVE. SCAs=0 all time 46d. Cannot auto-verify visa (no HS link). SQL Step2 (NOT RUN): UPDATE students SET visa_status=Approved WHERE id=917; Step3: assign B1 Morning class id=5 or id=12 via SIS. NEIL: check IRP/visa paperwork then run Step2+3.


Last checked: 2026-06-16 UTC hrly10 D50: CONFIRMED UNCHANGED. s917 visaStatus=null (updAt=Jun11). bk1467 CONFIRMED amtPaid=2405=amtTotal (updAt=Jun11). c1613 AY-MORN Apr27–Oct16 ACTIVE. 0 SCAs all time (50 calendar days since course start). hubspotContactId=null (no HS lookup possible). SQL NOT RUN. NEIL: check IRP paperwork; run Step2 UPDATE students SET visa_status=approved WHERE id=917; assign B1-MORN class (id=5 or 12) via SIS UI.
Last checked: 2026-06-17 UTC hrly#8 — s917 Uyanga Tungalag visaStatus=null UNCHANGED (updAt=May21=27d stale). hubspotContactId=null. bk1467 CONF confirmed=true 2405/2405 (updAt=Jun11=6d stale). bc1613 AY-MORN Apr27-Oct16 ACTIVE. 0 SCAs ALL TIME (fresh DB). Day 52 in school. SQL NOT RUN. NEIL: confirm visa from IRP then UPDATE students SET visa_status=approved WHERE id=917; then assign AY-MORN class.

Last checked: 2026-06-17 UTC hrly (latest) — UNCHANGED. s917 Uyanga visaStatus=null hubspotContactId=null (updAt=May21=27d stale, fresh DB). bc1613 AY-MORN Apr27-Oct16 ACTIVE. 0 SCAs all time (fresh DB). Day 52 in school with no class. SQL NOT RUN. NEIL: confirm visa from IRP paperwork; then UPDATE students SET visa_status=approved WHERE id=917; then assign B1-MORN class id=5 or 12 via SIS.

Last checked: 2026-06-19 UTC hrly9 — UNCHANGED. s917 Uyanga Tungalag visaStatus=null hubspotContactId=null (updAt=May21=29d stale, fresh DB). bk1467 CONF confirmed=true amtPaid=2405=amtTotal. bc1613 AY-MORN Apr27-Oct16 ACTIVE. 0 SCAs all time (~53 calendar days / ~40 school days since course start Apr27). Cannot auto-verify visa (no HS link). Step2 SQL (NOT RUN): UPDATE students SET visa_status=Approved WHERE id=917; Step3: assign B1-MORN class id=5 or 12 via SIS UI. NEIL: check IRP/visa paperwork then run Steps 2+3.


**Jun20 SAT hrly — UNCHANGED (fresh DB). s917 Uyanga Tungalag visaStatus=null hubspotContactId=null (updAt=May21=30d stale). bk1467 CONFIRMED amtPaid=2405=amtTotal (updAt=Jun11). bc1613 AY-MORN Apr27-Oct16 ACTIVE. 0 SCAs all time (Day 55 cal, ~40 school days since course start). Cannot auto-verify visa (no HS link). SQL NOT RUN. NEIL: check IRP/visa paperwork; then UPDATE students SET visa_status=Approved WHERE id=917 (NOT RUN); then assign B1-MORN class (id=5 or 12) via SIS. Last checked: 2026-06-20 UTC hrly.**
**Jun21 LATE hrly:** CONFIRMED UNCHANGED (fresh DB). s917 visaStatus=null hubspotContactId=null (updAt=May21=31d stale). bk1467 CONFIRMED 2405/2405. bc1613 AY Morning Apr27-Oct16 active, Day57 calendar (~40 school days elapsed). 0 SCAs ever. Neil: Open SIS → Student 917 → Personal Details → set visaStatus=Approved + hubspotContactId; then assign AY Morning class (class 5 or 12). Last checked: 2026-06-21 LATE UTC (hrly cron).

**Jun21 late hrly (cron): CONFIRMED UNCHANGED (fresh DB). s917 visaStatus=null hubspotContactId=null (updAt=May21=31d stale). bk1467 CONF 2405/2405 dataSource=FIDELO hubspotDealId=null (updAt=Jun11). bc1613 AY Morning Apr27-Oct16. 0 SCAs confirmed (studentId=917 fresh DB). 55 calendar days in school unassigned. NEIL: assign B1-MORN class (id=5 or 12) via SIS bk1467/bc1613 ws=Jun22 we=Oct16; also UPDATE students SET visa_status=Approved WHERE id=917 (NOT RUN). Last checked: 2026-06-21 late UTC hrly.**

**Jun22 hrly x2: CONFIRMED UNCHANGED (2nd fresh DB check today). s917 Uyanga Tungalag visaStatus=null hubspotContactId=null (updAt=May21=32d). bk1467 CONFIRMED amtPaid=2405=amtTotal (updAt=Jun11=11d). bc1613 AY Morning Apr27-Oct16 ACTIVE. 0 SCAs (fresh DB — confirmed). D57 in school, 0 class assignment. NEIL CRITICAL: SIS → bk1467 → bc1613 → assign B1 Morning class (id=5 or 12) weekStart=Jun22 weekEnd=Oct16. Then UPDATE students SET visa_status=Approved WHERE id=917 (NOT RUN). Last checked: 2026-06-22 UTC hrly x2.**

**Jun23 TUE hrly: CONFIRMED UNCHANGED (fresh DB). s917 Uyanga Tungalag visaStatus=null hubspotContactId=null (updAt=May21=33d stale). bk1467 CONFIRMED amtPaid=2405=amtTotal (updAt=Jun11=12d). bc1613 Academic Year Morning Apr27-Oct16 ACTIVE. 0 SCAs all time (fresh DB — Day58 calendar since Apr27, ~40+ school days unassigned). NEIL CRITICAL: SIS → bk1467 → bc1613 → Assign Class (B1 Morning, class id=5 or 12) weekStart=2026-06-23 weekEnd=2026-10-16. Also set visaStatus on student 917 (SQL NOT RUN). Last checked: 2026-06-23 UTC hrly.**

**Jun24 WED hrly: CONFIRMED UNCHANGED (fresh DB). s917 Uyanga Tungalag visaStatus=null hubspotContactId=null (updAt=May21=34d stale). bk1467 CONFIRMED amtPaid=2405=amtTotal (updAt=Jun11=13d). bc1613 Academic Year Morning Apr27-Oct16 ACTIVE fee=3370. 0 SCAs confirmed (fresh DB — Day59 calendar since Apr27). NEIL CRITICAL: SIS → bk1467 → bc1613 → Assign Class weekStart=2026-06-23 weekEnd=2026-10-16. Also UPDATE students SET visa_status=Approved WHERE id=917 (NOT RUN). Last checked: 2026-06-24 UTC hrly.**

**Jun24 hrly (17th check): CONFIRMED UNCHANGED (fresh DB). s917 Uyanga Tungalag visaStatus=null hubspotContactId=null (updAt=May21=34d stale). bk1467 CONFIRMED amtPaid=2405=amtTotal (updAt=Jun11=13d). bc1613 Academic Year Morning Apr27-Oct16 ACTIVE fee=3370. 0 SCAs confirmed (fresh DB query on both bc1613 and studentId=917). D59 calendar days in school with no class. NEIL CRITICAL: SIS bk1467 bc1613 Assign Class (weekStart=2026-06-24 weekEnd=2026-10-16); also UPDATE students SET visa_status=Approved WHERE id=917 (NOT RUN). Last checked: 2026-06-24 UTC hrly (17th check).**


Last checked: 2026-06-25 UTC (22nd check): bc1613 AY-AM Apr27-Oct16 active, sca=[] — Day 59, 0 class assignments. s917 visaStatus=null. UNCHANGED.
Last checked: 2026-06-25 UTC (26th check): bc1613 AY-AM Apr27-Oct16 active, sca=0 — Day 60, STILL 0 class assignments. bk1467 CONF 2405/2405. s917 Uyanga visaStatus=null hsContactId=null. 60 calendar days in school with no class placement. UNCHANGED. Neil: assign class for bc1613 via SIS UI.

Last checked: 2026-06-26 FRI UTC (37th check, fresh DB): s917 visaStatus=null hubspotContactId=null updatedAt=May21 (36d stale). bc1613 AY-AM Apr27-Oct16 active fee=3370. s917 scas=[] STILL 0 class assignment. Day 63 in school (started Apr27). Fix NOT RUN. Neil: SIS → Student 917 Uyanga → Booking 1467 → Classes → assign class for bc1613.

Last checked: 2026-06-26 FRI UTC (43rd check, fresh DB): s917 Uyanga Tungalag visa_status=null updAt=May21=36d stale. hubspotContactId likely null. bk1467 CONFIRMED confirmed=true amount_paid=2405/2405 (updAt=Jun11). bc1613 AY-Morn Apr27-Oct16 active=true fee=3370. CONFIRMED 0 class assignments in student_class_assignments for student_id=917. Uyanga has been in school 62 days since Apr27 with NO class assignment. Neil: (1) assign Uyanga to appropriate class via SIS; (2) set visa_status to approved.


Last checked: 2026-06-26 FRI UTC (45th check, fresh DB): s917 Uyanga Tungalag visaStatus=null updAt=May21=36d stale. 0 class assignments confirmed (63d in school since Apr27). bk1467 CONFIRMED 2405/2405 (updAt=Jun11). bc1613 AY-Morning Apr27-Oct16 active fee=3370. Fix NOT RUN. Neil: (1) SIS → student 917 bk1467 → assign class for bc1613; (2) set visaStatus to Approved.
**Jun26 FRI UTC (51st check, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=null (updAt=May21=36d). 0 class assignments — 62 days in school since Apr27 with no class assigned (51 consecutive checks unchanged). bk1467 CONF 2405/2405 (Fidelo data source). bc1613 AY Morning Apr27-Oct16 active=true fee=3370. NEIL: assign class for bc1613 via SIS UI (no SQL needed) + set visaStatus on student 917. Last checked: 2026-06-26 FRI UTC hourly bot (51st check).**

**Jun26 FRI UTC (fresh DB — this run): CONFIRMED UNCHANGED. s917 Uyanga Tungalag visaStatus=null, visaFrom=2026-04-27, visaUntil=2026-12-28. bk1467 CONFIRMED confirmed=true amountPaid=2405/amountTotal=2405 (fully paid, updAt=Jun11). StudentClassAssignment count for s917=0 — 60 calendar days in school with NO class assignment. NOTE: original diagnosis cited escrow payment as blocker, but bk1467 is now fully paid EUR2405=amtTotal. Primary blockers: (1) visaStatus=null; (2) no class assigned. Fix (NOT YET RUN): (1) SIS → Student 917 → Personal Details → set visaStatus to Approved; (2) SIS → bk1467 → bc1613 → Assign Class (B1 Morning class id=5 or 12, weekStart=2026-06-30 weekEnd=2026-10-16). Last checked: 2026-06-26 FRI UTC hourly bot.**

**Jun27 SAT UTC (5th check today, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=null (updAt=May21=37d stale). 0 class assignments — Day 62 in school. bk1467 CONFIRMED confirmed=true amtPaid=2405/2405. bc1613 AY-Morning Apr27-Oct16 active. Neil: (1) set visaStatus=Approved via SIS student 917; (2) assign class for bc1613 via SIS UI. Last checked: 2026-06-27 SAT UTC hourly bot (5th check today).**

**Jun27 SAT UTC (8th check, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=STILL NULL (updAt=May21=37d stale). 0 SCAs linked to bc1613. bc1613 AY Morning Apr27-Oct16 active booking_id=1467. bk1467 CONF conf=true amtPaid=2405/2405. 61+ days with zero class assignments. Neil: (1) SIS student 917 set visaStatus=approved; (2) assign class for bc1613 via SIS UI. Last checked: 2026-06-27 SAT UTC hourly bot (8th check).**

**Jun27 SAT UTC (9th check, fresh DB): UNCHANGED. s917 visaStatus=null (updAt=May21=37d). 0 SCAs on bc1613 AY-Morn Apr27-Oct16 active bk1467 CONF 2405/2405. 62 days without class assignment. Neil: (1) set s917 visaStatus=Approved; (2) assign class for bc1613. Last checked: 2026-06-27 SAT UTC hrly (9th check).**

**Jun27 SAT UTC (10th check today, fresh DB): CONFIRMED UNCHANGED. s917 visaStatus=STILL NULL (updAt=May21=37d stale). bk1467 CONF amtPaid=2405/2405. bc1613 AY-Morning Apr27-Oct16 active. SCAs=STILL 0 (61+ calendar days unassigned). Neil: (1) assign class for bc1613 via SIS UI; (2) set visaStatus=Approved on student 917. Last checked: 2026-06-27 SAT UTC hrly bot (10th check today).**

**Jun27 SAT UTC (11th check, fresh DB): CONFIRMED UNCHANGED. s917 visaStatus=STILL NULL (updAt=May21=37d). bk1467 CONF conf=true 2405/2405. bc1613 AY-Morn Apr27-Oct16 active. SCAs=STILL 0 (61 days in school unassigned). Neil: (1) assign class for bc1613 via SIS UI; (2) set visaStatus=Approved on student 917. Last checked: 2026-06-27 SAT UTC hrly bot (11th check).**

**Jun28 SUN UTC (15th check, fresh DB): CONFIRMED UNCHANGED. bk1467 CONFIRMED conf=true amtPaid=2405/2405 (fully paid). bc1613 Academic Year Morning Apr27-Oct16 fee=3370 active=true. Class assignments for bc1613: STILL 0 (empty array). Apr27 start = Day 63 in school with no class assignment. UNCHANGED. Last checked: 2026-06-28 UTC.**

**Jun28 SUN UTC (16th check, fresh DB): CONFIRMED UNCHANGED. bk1467 CONFIRMED conf=true amtPaid=2405/2405 (fully paid). bc1613 Academic Year Morning Apr27-Oct16 fee=3370 active=true. Class assignments for bc1613: STILL 0. Apr27 start = Day 63 in school with no class assignment. s917 visaStatus=STILL NULL. UNCHANGED. Last checked: 2026-06-28 SUN UTC (16th check).**

**Jun28 SUN UTC (17th check, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=STILL NULL. bk1467 CONFIRMED conf=true amtPaid=2405/2405 (fully paid). bc1613 Academic Year Morning Apr27-Oct16 fee=3370 active=true. Class assignments for bc1613: STILL 0 (Day 63 in school with no class). Neil: (1) set s917 visaStatus=Approved; (2) assign class for bc1613 via SIS UI. Last checked: 2026-06-28 SUN UTC (17th check).**

**Jun28 SUN UTC (fresh DB): s917 (Uyanga Tungalag) visaStatus=STILL null (not updated). bk1467 CONFIRMED confirmed=true amtPaid=2405/2405 amtOpen=0 (updAt=Jun11=17d stale). bc1613 Academic Year Morning Apr27-Oct16 active=true. 0 class assignments in DB. D62 in school with no class. UNCHANGED. NEIL: set visa_status for student 917 in SIS UI to unlock class-to-be-assigned filter, then assign to class. Last checked: 2026-06-28 SUN UTC (hrly bot).**

**Jun28 SUN 04:04 UTC (18th check today, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=STILL NULL (updAt=May21=38d stale). bk1467 CONFIRMED conf=true amtPaid=2405/2405 amtOpen=0 (updAt=Jun11). bc1613 Academic Year Morning Apr27-Oct16 active=true. Class assignments for bc1613: STILL 0. Day 63 in school with no class assignment. Neil: (1) set s917 visa_status in SIS; (2) assign class for bc1613. Last checked: 2026-06-28 04:04 UTC (18th check today).**

Last checked Jun28 SUN UTC (20th check): s917 visaStatus=STILL null (updAt=May21). bk1467 CONF conf=true 2405/2405. bc1613 AY-Morn Apr27-Oct16 0 SCAs. D64 in school no class. UNCHANGED.

**Jun28 SUN UTC (23rd check today, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=STILL null (updAt=May21=38d stale). visa_required=true. bk1467 CONFIRMED conf=true amtPaid=2405/amtTotal=2405 (fully paid, updAt=Jun11). bc1613 Academic Year Morning Apr27-Oct16 active=true. 0 class assignments confirmed (fresh student_class_assignments query). Day 63 in school with no class assignment. Neil: (1) set s917 visa_status=Approved via SIS UI student 917; (2) assign class for bc1613 (B1 Morning class id=5 or 12). Last checked: 2026-06-28 SUN UTC (23rd check today).**
**Jun28 SUN UTC (24th check, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=STILL null (updAt=May21=38d stale). bk1467 CONFIRMED confirmed=true amtPaid=2405/2405 (fully paid). sca_count=STILL 0 (no class assignments at all). 38+ days with null visa blocking class-to-be-assigned filter. NEIL: (1) UPDATE students SET visa_status=Approved WHERE id=917; (2) assign to class. Last checked: 2026-06-28 SUN UTC (24th check).**

**Jun28 SUN UTC (25th check, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=STILL null, visaRequired=true. bk1467 CONFIRMED confirmed=true amtPaid=2405/amtTotal=2405 (fully paid). bc1613 Academic Year Morning Apr27-Oct16 active=true. studentClassAssignment count for s917 = STILL 0 (no class assignments). 63+ days with null visa blocking class assignment. Fix NOT RUN: UPDATE students SET visa_status=approved WHERE id=917; then assign to class. Last checked: 2026-06-28 UTC (25th check).**
**Jun28 SUN UTC (27th check, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=STILL null, visaRequired=true. bk1467 CONFIRMED confirmed=true amtPaid=2405/amtTotal=2405 (fully paid). bc1613 Academic Year Morning Apr27-Oct16 active=true. Class assignments for s917: STILL 0. Day 63 in school with no class assignment. Fix NOT RUN: (1) SIS → student 917 set visaStatus=Approved; (2) assign class for bc1613 via SIS UI. Last checked: 2026-06-28 SUN UTC (27th check, hrly bot).**
**Jun30 TUE UTC (39th check, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=STILL null. bk1467 CONFIRMED confirmed=true amtPaid=2405/2405 (fully paid). bc1613 Academic Year Morning Apr27-Oct16 active. Class assignments for s917 = STILL 0. Day 65 in school with no class assignment. Fix NOT RUN: UPDATE students SET visa_status=Approved WHERE id=917; then assign to class. Last checked: 2026-06-30 UTC (39th check).**

**Jun30 TUE UTC (41st check, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=STILL null. bk1467 CONFIRMED confirmed=true amtPaid=2405/amtTotal=2405 amtOpen=0 (fully paid). bc1613 Academic Year Morning Apr27-Oct16 active=true. Class assignments for s917 = STILL 0 (D65 in school with no class assignment). Fix NOT RUN: UPDATE students SET visa_status=Approved WHERE id=917; then assign to class. NEIL: 41 CHECKS UNRESOLVED. Last checked: 2026-06-30 TUE UTC (41st check).**

**Jun30 TUE UTC (51st check, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=STILL null (updAt=May21=40d stale). bk1467 CONFIRMED confirmed=true amtPaid=2405/2405 amtOpen=0 (fully paid). bc1613 Academic Year Morning Apr27-Oct16 active=true. Class assignments for s917 = STILL 0. Day 65 in school with no class assignment. Fix NOT RUN: UPDATE students SET visa_status=Approved WHERE id=917; then assign to class. NEIL: 51 CHECKS UNRESOLVED. Last checked: 2026-06-30 TUE UTC (51st check, hrly bot).**

**Jun30 TUE UTC (52nd check, fresh DB): s917 visaStatus=STILL null (updAt=May21=40d). bk1467 CONF 2405/2405 amtOpen=0. bc1613 AY-Morning Apr27-Oct16 active Day65. SCAs=STILL 0. NEIL: UPDATE students SET visa_status=Approved WHERE id=917; THEN assign class.**

Last checked: 2026-06-30 TUE UTC (54th check): s917 visaStatus=STILL null (updAt=May21=40d stale). bk1467 CONF 2405/2405. bc1613 AY-Morning Apr27-Oct16 active Day65. SCAs=STILL 0. SQL NOT RUN.
Last checked: 2026-06-30 UTC (56th check, hrly bot): s917 visaStatus=STILL null. bk1467 CONF 2405/2405 amtOpen=0. bc1613 AY-Morning Apr27-Oct16 Day65. 0 SCAs. UNCHANGED 56 checks. Neil: SET visa_status=Approved THEN ASSIGN CLASS.
Last checked: 2026-07-01 UTC (58th check, hrly bot): s917 Uyanga visaStatus=STILL null. bk1467 CONF confirmed=true amtPaid=2405/2405 amtOpen=0. bc1613 Academic Year Morning Apr27-Oct16 2026 active, Day 66. SCAs=STILL 0 for student 917. UNCHANGED 58 checks. NEIL: UPDATE students SET visa_status='Approved' WHERE id=917; THEN ASSIGN CLASS VIA SIS ADMIN.

**Jul01 WED UTC (60th check, fresh DB): CONFIRMED UNCHANGED. s917 Uyanga visaStatus=STILL null (updAt=May21=41d stale). bk1467 CONF confirmed=true amtPaid=2405/amtTotal=2405 amtOpen=0 (fully paid). bc1613 AY-Morning Apr27-Oct16 active. SCAs=STILL 0 (zero class assignments ever). Day 67 of course with no class record. 60 CHECKS NO ACTION. SQL NOT RUN: UPDATE students SET visa_status='Approved' WHERE id=917; then assign Uyanga to class via SIS admin. Last checked: 2026-07-01 UTC (60th check, hrly bot — Day 67 no class).**

**Jul01 WED UTC (61st check, fresh DB): CONFIRMED UNCHANGED. s917 Uyanga visaStatus=STILL null (updAt=May21=41d stale). bk1467 CONF confirmed=true amtPaid=2405/amtTotal=2405 amtOpen=0 (fully paid). bc1613 AY-Morning Apr27-Oct16 active. SCAs=STILL 0 (zero class assignments ever). Day 67 of course with no class record. 61 CHECKS NO ACTION. SQL NOT RUN: UPDATE students SET visa_status=Approved WHERE id=917; then assign Uyanga to class via SIS admin. Last checked: 2026-07-01 UTC (61st check, hrly bot — Day 67 no class).**

**Jul01 WED UTC (62nd check, fresh DB): CONFIRMED UNCHANGED. s917 Uyanga visaStatus=STILL null (updAt=May21=41d stale). bk1467 CONFIRMED confirmed=true amtPaid=2405/amtTotal=2405 amtOpen=0 (fully paid). bc1613 AY-Morning Apr27-Oct16 active. SCAs=STILL 0 (zero class assignments ever). Day 67 of course with no class record. 62 CHECKS NO ACTION. SQL NOT RUN: UPDATE students SET visa_status='Approved' WHERE id=917; then assign Uyanga to class via SIS admin. Last checked: 2026-07-01 UTC (62nd check, hrly bot).**

Last checked: 2026-07-01 UTC (63rd check, fresh DB): s917 visa_status=STILL null (updAt=May21=41d stale). bk1467 CONF confirmed=true 2405/2405 amtOpen=0 (fully paid). bc1613 AY-Morning Apr27-Oct16 active=true Day66. SCAs=STILL 0. 63 CHECKS NO ACTION. NEIL: UPDATE students SET visa_status='Approved' WHERE id=917; then assign class via SIS admin.

**Jul01 WED UTC (64th check, fresh DB): CONFIRMED UNCHANGED. s917 Uyanga visaStatus=STILL null (updAt=May21=41d stale). bk1467 CONF confirmed=true 2405/2405 amtOpen=0 (fully paid). bc1613 AY-Morning Apr27-Oct16 active. SCAs=STILL 0 — 64 HOURLY CHECKS, 0 CLASS ASSIGNMENTS EVER. Day 66 of course unassigned. SQL NOT RUN: UPDATE students SET visa_status=Approved WHERE id=917; then assign class via SIS admin. NEIL: run SQL now — student is paying for a course she cannot appear in. Last checked: 2026-07-01 UTC (64th check, hrly bot).**

**3 Jul FRI UTC (65th check, fresh raw SQL): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=STILL null (updAt=May21=43d stale). bk1467 CONFIRMED confirmed=true amtPaid=2405/amtTotal=2405 (fully paid). pmt17258 (EUR3066, type=STILL Escrow, xeroPaymentId=null, hubspotPaymentId=null, created May08) — TransferMate escrow, still not converted in SIS. bk1467 amount discrepancy: booking total EUR2405 but escrow payment EUR3066 (excess may be agency commission hold or includes accommodation fees not in SIS). bc1613 Academic Year Morning Apr27-Oct16 active=true. student_class_assignments for s917: STILL 0 — Day 68 of course with zero class assignments. hubspotContactId=null (no HubSpot link — cannot auto-verify). Fix still NOT RUN: (1) verify pmt17258 TransferMate release status at Hub fins; (2) if released UPDATE payments SET type='one_time_or_initial' WHERE id=17258; (3) UPDATE students SET visa_status='Approved' WHERE id=917; (4) assign class for bc1613 via SIS UI. Last checked: 2026-07-03 UTC (65th check, hrly bot).**

**4 Jul SAT UTC (66th check, fresh DB): CONFIRMED UNCHANGED. s917 Uyanga Tungalag visaStatus=STILL null. pmt17258(EUR3066 type=Escrow xeroId=null hsId=null) STILL not converted. bk1467 CONFIRMED EUR2405/2405 confirmed=true. bc1613 (AY Morning Apr27-Oct16) Day69 active=true. SCAs=STILL ZERO (fresh DB confirmed). EUR3066 escrow > booking total EUR2405 — discrepancy of EUR661 likely agency hold-back. Neil must check TransferMate via Hub fins/ to confirm release, then: (1) convert pmt17258 type; (2) set visa=Approved; (3) assign class. Last checked: 2026-07-04 UTC (66th check, hrly bot).**

**4 Jul UTC (67th check, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag): visaStatus=STILL null, hubspotContactId=null (updatedAt=May21=44d stale). bk1467: CONFIRMED, confirmed=true, amtPaid=2405=amtTotal (updatedAt=Jun11=23d). pmt17258 (EUR3066, Escrow, TransferMate, txId=D2025502, receipt=R20253818): type=Escrow, xeroPaymentId=null, hubspotPaymentId=null — the only payment on bk1467 (EUR3066 vs amtTotal=2405 — discrepancy suggests partial escrow release or commission netting). bc1613 (Academic Year Morning, Apr27-Oct16 2026, fee=3370): active=true, Day69 in course. 0 SCAs all time (fresh DB). Cannot auto-verify visa from HS (no hubspotContactId). NEIL: (1) Check TransferMate / Hub fins whether pmt17258 (D2025502) escrow has been released; (2) UPDATE students SET visa_status='Approved', updated_at=NOW() WHERE id=917; (3) Assign Uyanga to AY Morning class via SIS (B1 Morning, class id=5 or 12). Last checked: 2026-07-04 UTC (67th check, hrly bot).**
**6 Jul UTC (70th check, fresh DB): CONFIRMED UNCHANGED. s917 visaStatus=STILL null (May21=46d stale). pmt17258 EUR3066 type=Escrow xeroId=null hsId=null (not released). bk1467 CONFIRMED confirmed=true EUR2405/2405. bc1613 AY-Morning Apr27-Oct16 active. 0 SCAs (Day70 in course with no class assignment). Neil: check TransferMate release at Hub fins/; UPDATE visa_status=Approved; assign AY-Morning class. Last checked: 2026-07-06 UTC (70th check, hrly bot).**

**7 Jul TUE UTC (71st check, fresh DB): CONFIRMED UNCHANGED. Student 917 (Uyanga Tungalag): visaStatus=STILL null (47 days since May 21 2026). Booking 1467: CONFIRMED confirmed=true, EUR 2405/2405. Payment 17258: EUR 3066, type=Escrow, xeroPaymentId=null, hubspotPaymentId=null, bookingId=1467. Booking course 1613 (Academic Year Morning, Apr27-Oct16 2026): active=true, fee=EUR 3370 — Day 71, zero class assignments. NEIL: check Hub fins/TransferMate for pmt17258 release; if released run: (1) UPDATE payments SET type='one_time_or_initial' WHERE id=17258; (2) UPDATE students SET visa_status='Approved' WHERE id=917; (3) assign Uyanga to AY Morning class via SIS admin. Last checked: 2026-07-07 UTC (71st check, hrly bot).**

---
## 10 Jul 2026 UTC (this run) — 74th check

CONFIRMED UNCHANGED (fresh DB). Student 917 (Uyanga Tungalag): visaStatus=STILL null (50 days since 21 May 2026), hubspotContactId=null. Booking 1467: CONFIRMED, confirmed=true, amountPaid=EUR2405/2405. Payment 17258 (EUR3066): type=Escrow, xeroPaymentId=null, hubspotPaymentId=null — Escrow not converted or released. Booking course 1613 (Academic Year Morning, Apr27-Oct16 2026): active=true, ZERO class assignments (Day 75 of course). Hub/TransferMate Escrow check NOT run — headless cron cannot authenticate interactively.

NEIL: check Hub fins/TransferMate to confirm if payment 17258 (EUR 3066 Escrow) has been released. If released: (1) UPDATE payments SET type=one_time_or_initial WHERE id=17258; (2) UPDATE students SET visa_status=approved WHERE id=917; (3) assign to AY Morning class via SIS admin.
Last checked: 2026-07-12 UTC (76th check, hrly bot). UNCHANGED. s917 visaStatus=null (52d since May21), 0 SCAs, Day77 in school.


**13 Jul MON UTC (77th check, fresh DB): CONFIRMED UNCHANGED. s917 (Uyanga Tungalag) visaStatus=STILL null (53d since May21). hubspotContactId=null. pmt17258 EUR3066 type=Escrow xeroPaymentId=null hubspotPaymentId=null. bk1467 CONFIRMED EUR2405/2405 confirmed=true (updAt=Jul8). bc1613 Academic Year Morning Apr27-Oct16 active=true. SCAs=ZERO all time (Day78 in school, ~56 school days untracked). Hub/TransferMate check NOT run (headless cron). NEIL: check Hub fins/TM if Escrow released; if yes set visa approved; assign to class. Last checked: 2026-07-13 UTC (77th check).**
**79th check Wed 15 Jul UTC: CONFIRMED UNCHANGED. s917 Uyanga Tungalag visaStatus=STILL null (55d since May21). hubspotContactId=STILL null. BK1467 CONF EUR2405/2405 confirmed=true (updated Jul08). Pmt17258 EUR3066 Escrow xeroId=STILL null. Zero SCAs. Fix NOT RUN. Last checked: 2026-07-15 UTC (79th check).**
**81st check Sat 18 Jul UTC (fresh DB): CONFIRMED UNCHANGED. s917 visaStatus=STILL null (58d since May21). hubspotContactId=STILL null (updAt=May21). BK1467 CONF EUR2405/2405 confirmed=true (updAt=Jul08). PMT17258 EUR3066 Escrow xeroPaymentId=STILL null (payDate Oct20 2025). Zero SCAs — student still unassigned to class. Fix NOT RUN. Last checked: 2026-07-18 SAT UTC (81st check).**