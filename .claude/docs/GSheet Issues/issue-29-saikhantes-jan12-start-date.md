Issue 29 and 15 -- Saikhantes Shagdarsuren -- PARTIAL FIX: SCA weekStart/weekEnd still wrong

Reporter: PG  Area: booking/class  Sheet row: 30  Last checked: 2026-06-16 UTC hrly

SYMPTOM
Course start date showed Jan 12 in SIS. Antonella confirmed: IRP not valid until March,
correct restart = March 9. Initially also had 0 attendance records.

ROOT CAUSE
Jan 12 start date was a Fidelo migration artifact (IRP constraint, AY renewal slot mismatch).
Previous AY Morning (bk1724) ended Dec 19, 2025. New IRP not valid until March.

WHAT HAS BEEN FIXED (Jun 16 2026 -- Neil applied today)
  bc24925 startDate:  2026-01-12 -> 2026-03-09  DONE
  bc24925 endDate:    2026-07-03 -> 2026-09-11  DONE (AY extended to match correct start)
  bc24925 ilepCode:   null -> 0318/0003  DONE
  Attendance s1001:   0 records -> 5 records  DONE (student IS attending B1 PM since Mar 9)
  bk18151 updatedAt:  Jun 16 14:47 UTC (Neil working on this today)

OUTSTANDING FIX (NOT YET RUN)
SCA 255 weekStart and weekEnd are STILL WRONG:
  weekStart = 2026-01-12  (should be 2026-03-09)
  weekEnd   = 2026-07-03  (should be 2026-09-11 -- matching bc24925 endDate)
  classId=11 (B1 PM), bookingCourseId=24925, studentId=1001

FIX RECIPE -- Step 1: Fix SCA 255 (NOT YET RUN)
  Run from sis/ directory via psql or Prisma raw:
    UPDATE student_class_assignments SET week_start = '2026-03-09', week_end = '2026-09-11' WHERE id = 255;

FIX RECIPE -- Step 2: Verify (NOT YET RUN)
    SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE id = 255;
    Expected: weekStart=2026-03-09, weekEnd=2026-09-11, classId=11, bookingCourseId=24925

EVIDENCE (live Jun 16 2026)
  bk18151 CONFIRMED amountPaid=1339.20 / 1339.20  updatedAt=Jun16 14:47 UTC
  bc24925: startDate=2026-03-09 endDate=2026-09-11 ilepCode=0318/0003 (all corrected)
  sca255: classId=11, weekStart=2026-01-12 (WRONG), weekEnd=2026-07-03 (WRONG)
  att count s1001=5 (student confirmed attending B1 PM)

RISK
  Category: data-hygiene | Reversible: yes | Blast radius: single SCA row (id=255)
  Low risk: attendance exists, course dates already correct, just fixing SCA time window

STATUS
  PARTIAL FIX: course dates + ILEP corrected, attendance confirmed (5 records).
  OUTSTANDING: SCA 255 weekStart + weekEnd need one SQL UPDATE.

Last checked: 2026-06-16 UTC hrly
Last checked: 2026-06-17 UTC hrly: UNCHANGED. sca255 weekStart=Jan12 weekEnd=Jul03 classId=11 STILL WRONG (should be Mar09-Sep11). bc24925 AFT Mar09-Sep11 ACTIVE (Neil corrected Jun16). bk18151 CONF 1339.2/1339.2. Fix (NOT RUN): UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255;

Last checked: 2026-06-18 UTC hrly: UNCHANGED. sca255 weekStart=2026-01-12 weekEnd=2026-07-03 classId=11 STILL WRONG. bc24925 confirmed Mar09-Sep11 (Neil Jun16). bk18151 CONF 1339.2/1339.2 (updAt=Jun16). SCA fix NOT RUN.
Last checked: 2026-06-19 UTC hrly3 — UNCHANGED. sca255 weekStart=Jan12 weekEnd=Jul03 classId=11 STILL WRONG (fresh DB). bc24925 Mar09-Sep11 active (Neil corrected Jun16). bk18151 CONF 1339.2/1339.2. Fix NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255; Student attending B1-PM normally; SCA window wrong but not blocking.

**Jun21 late hrly (cron): CONFIRMED UNCHANGED (fresh DB). sca255 cls11 weekStart=Jan12 weekEnd=Jul03 STILL WRONG (fresh DB). bc24925 AY Afternoon Mar09-Sep11. bk18151 CONF 1339.2/1339.2 (updAt=Jun16). weekEnd expires 12 days (Jul03). Course runs to Sep11 = 10 weeks uncovered. FIX NOT RUN: UPDATE StudentClassAssignment SET weekStart=2026-03-09, weekEnd=2026-09-11 WHERE id=255; Last checked: 2026-06-21 late UTC hrly.**

**Jun22 hrly x2: CONFIRMED UNCHANGED (2nd fresh DB check today). sca255 cls11 weekStart=2026-01-12 weekEnd=2026-07-03 STILL WRONG (fresh DB — not fixed). bc24925 AY Afternoon Mar09-Sep11 (updAt=Jun16=6d). bk18151 CONF 1339.2/1339.2. weekEnd Jul03=11 days — then student invisible to B1-PM for 10 weeks through Sep11. FIX NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. Last checked: 2026-06-22 UTC hrly x2.**

**Jun23 hrly: CONFIRMED UNCHANGED (fresh DB). sca255 classId=11 weekStart=2026-01-12 weekEnd=2026-07-03 STILL WRONG — NOT FIXED. bc24925 AY-Afternoon Mar09-Sep11 active (Neil corrected Jun16). bk18151 CONF 1339.2/1339.2 (updAt=Jun16=7d). weekEnd=Jul03 = 10 days away — then Saikhantes invisible to B1-PM class for ~10 weeks through Sep11. FIX NOT RUN: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255; Last checked: 2026-06-23 UTC hrly.**

**Jun24 WED hrly: CONFIRMED UNCHANGED (fresh DB). sca255 classId=11 weekStart=2026-01-12 weekEnd=2026-07-03 STILL WRONG. bc24925 AY Afternoon Mar09-Sep11 active (Neil corrected Jun16). bk18151 CONF 1339.2/1339.2. weekEnd=Jul03 = 9 days away — then Saikhantes invisible to B1-PM for ~10 weeks through Sep11. Fix NOT RUN: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255; Last checked: 2026-06-24 UTC hrly.**

**Jun24 hrly (this run — 9d warning): CONFIRMED UNCHANGED (fresh DB). sca255 classId=11 weekStart=2026-01-12 weekEnd=2026-07-03 STILL WRONG (should be Mar09–Sep11). weekEnd Jul03 = 9 DAYS AWAY — after that Saikhantes drops off B1-PM class list for ~10 weeks through Sep11. bc24925 AY Afternoon Mar09-Sep11 active. bk18151 CONF 1339.2/1339.2. FIX NOT RUN: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255;**

**Jun24 hrly (2nd run): CONFIRMED UNCHANGED (fresh DB). sca255 classId=11 weekStart=2026-01-12 weekEnd=2026-07-03 STILL WRONG. bc24925 AY Afternoon Mar09-Sep11 active (Neil corrected Jun16). bk18151 CONF 1339.2/1339.2. weekEnd=Jul03 = 9 days away — then Saikhantes invisible to B1-PM for ~10 weeks through Sep11. Fix NOT RUN: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255;**

**Jun24 hrly (3rd run): CONFIRMED UNCHANGED (fresh DB). sca255 classId=11 weekStart=2026-01-12 weekEnd=2026-07-03 STILL WRONG (should be Mar09-Sep11). bc24925 AY Afternoon Mar09-Sep11 active fee=1102.20 (Neil corrected Jun16). bk18151 CONF 1339.2/1339.2 (updAt=Jun16). weekEnd=Jul03 = 9 days away — then Saikhantes invisible to B1-PM for ~10 weeks through Sep11. Fix NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255; Last checked: 2026-06-24 UTC hrly (3rd run).**

**Jun24 hrly (4th/5th check rows 16+30): CONFIRMED UNCHANGED (fresh DB). sca255 classId=11 weekStart=2026-01-12 weekEnd=2026-07-03 STILL WRONG (should be Mar09-Sep11). bc24925 AY Afternoon Mar09-Sep11 active fee=1102.20 (Neil corrected Jun16). bk18151 CONF 1339.2/1339.2 (updAt=Jun16). weekEnd=Jul03 = 9 days away — then Saikhantes invisible to B1-PM for ~10 weeks through Sep11. Fix NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255;**

Last checked: 2026-06-25 UTC (9th check): sca255 weekStart=Jan12 weekEnd=Jul03 classId=11 STILL WRONG. bc24925 AY-Aft Mar09-Sep11 correct. bk18151 CONF 1339.2/1339.2 (Jun16). Jul03=8 days — 10+ weeks of bc24925 uncovered after expiry. SQL NOT RUN. NEIL URGENT: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255;

**Jun25 UTC (10th check, fresh DB): sca255 classId=11 weekStart=2026-01-12 weekEnd=2026-07-03 STILL WRONG (should be Mar09-Sep11, createdAt=Jun09). bc24925 AY Afternoon Mar09-Sep11 active fee=1102.20. bk18151 CONF 1339.2/1339.2 (Jun16). weekEnd=Jul03=8 days — after expiry, Saikhantes invisible to B1-PM for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. Last checked: 2026-06-25 UTC hourly bot (10th check).**
**Jun25 UTC (12th check, fresh DB): sca255 classId=11 weekStart=2026-01-12 weekEnd=2026-07-03 STILL WRONG. bc24925 AY-Aft Mar09-Sep11 active fee=1102.20. bk18151 CONF 1339.2/1339.2. weekEnd=Jul03=8d expiry — Saikhantes drops from scheduling after that. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. Last checked: 2026-06-25 UTC hrly bot (12th check).**

**Jun26 FRI UTC (25th check rows 16+30, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12 weekEnd=2026-07-03 STILL WRONG (should be Mar09-Sep11, createdAt=Jun09). bc24925 AY Afternoon Mar09-Sep11 active. bk18151 CONF 1339.2/1339.2. weekEnd=Jul03=7 DAYS AWAY — after expiry Saikhantes invisible to B1-PM for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255; NEIL: run before Jul03. Last checked: 2026-06-26 FRI UTC hourly bot (25th check).**

**Jun26 FRI UTC (26th check, fresh DB): sca255 classId=11 weekStart=2026-01-12 weekEnd=2026-07-03 STILL WRONG (should be Mar09-Sep11). bc24925 AY Afternoon Mar09-Sep11 active fee=1102.20. bk18151 CONF 1339.2/1339.2. weekEnd=Jul03 = 7 DAYS AWAY — after expiry Saikhantes invisible to B1-PM for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255; Neil: run before Thu Jul03. Last checked: 2026-06-26 FRI UTC hourly bot (26th check).**


**Jun26 UTC (33rd check): sca255 classId=11 weekStart=Jan12(wrong) weekEnd=Jul03(wrong) studentId=1001 STILL UNCHANGED. bc24925 AY-Aft Mar09-Sep11 active. weekEnd=Jul03 now 7 DAYS away — student falls off class scheduling. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: run before Jul03. Last checked: 2026-06-26 UTC hourly bot (33rd check).**
**Jun26 FRI UTC (36th check, fresh DB): sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bcId=24925 CONFIRMED STILL UNCHANGED. bc24925 AY-Aft Mar09-Sep11 active=true fee=1102.20. weekEnd=Jul03=7 DAYS FROM NOW — expiry leaves Saikhantes invisible to B1-PM class scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: must run before Thu Jul03. Last checked: 2026-06-26 FRI UTC hourly bot (36th check).**
**Jun26 FRI UTC (37th check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bcId=24925 STILL WRONG — 20d since bc24925 was corrected by Neil on Jun16. bc24925 AY-Aft Mar09-Sep11 active=true fee=1102.20. bk18151 CONF 1339.2/1339.2. weekEnd=Jul03=7 DAYS AWAY — after that Saikhantes vanishes from B1-PM class scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255; Neil: run before Thu Jul03. Last checked: 2026-06-26 FRI UTC hourly bot (37th check).**
**Jun26 FRI UTC (38th check, fresh DB): CONFIRMED UNCHANGED. sca255 weekStart=Jan12(wrong) weekEnd=Jul03(wrong) studentId=1001 bcId=24925. bc24925 AY-Aft Mar09-Sep11 active=true fee=1102.20. weekEnd=Jul03=THIS FRIDAY=7 DAYS — if not fixed, Saikhantes vanishes from class list for 10 weeks (Mar09-Sep11 coverage lost after Jul03). SQL NOT RUN. NEIL URGENT: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255 — MUST RUN BEFORE FRIDAY JUL03. Last checked: 2026-06-26 FRI UTC hourly bot (38th check).**
**Jun27 SAT UTC (fresh DB): class assignment 255 weekStart=Jan12 weekEnd=Jul03 STILL UNCHANGED — 6 days to expiry. Fix: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. Last checked: 2026-06-27 SAT UTC hourly bot.**

**Jun27 SAT UTC (44th check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) — STILL NOT FIXED. bc24925 AY-Aft Mar09-Sep11 active=true fee=1102.20. weekEnd=Jul03=6 DAYS — then Saikhantes vanishes from class scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255. NEIL: URGENT — must run before Fri Jul03. Last checked: 2026-06-27 SAT UTC hourly bot (44th check).**


**Jun27 SAT UTC (45th+46th check rows 16+30, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bcId=24925 STILL NOT FIXED. bc24925 AY-Aft Mar09-Sep11 active. weekEnd=Jul03=6 DAYS AWAY — after that Saikhantes vanishes from B1-PM class scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: URGENT — must run before Thu Jul03. Last checked: 2026-06-27 SAT UTC hourly bot (45th+46th check).**
**Jun27 SAT UTC (48th check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) bookingCourseId=24925. bc24925 AY Afternoon Mar09-Sep11 active. bk18151 CONF 1339.2/1339.2. weekEnd=Jul03 = 6 DAYS AWAY — after expiry Saikhantes invisible to B1-PM class list for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255; Last checked: 2026-06-27 SAT UTC hourly bot (48th check). NEIL: must run before Thu Jul03.**

**Jun27 SAT UTC (49th check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) bookingCourseId=24925 — NOT FIXED. bc24925 AY Afternoon Mar09-Sep11 active. bk18151 CONF 1339.2/1339.2. weekEnd=Jul03 = 6 DAYS AWAY — after expiry Saikhantes invisible to B1-PM class scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: URGENT — must run before Thu Jul03. Last checked: 2026-06-27 SAT UTC hourly bot (49th check).**

**Jun27 SAT UTC (50th check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) bcId=24925 STILL NOT FIXED. bc24925 AY Afternoon Mar09-Sep11 active. bk18151 CONF 1339.2/1339.2. weekEnd=Jul03=6 DAYS AWAY — expiry leaves Saikhantes invisible to B1-PM for 10 weeks. SQL NOT RUN. Neil: run before Thu Jul03. Last checked: 2026-06-27 SAT UTC hrly bot (50th check).**

**Jun27 SAT UTC (51st check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) bcId=24925. bc24925 AY-Afternoon Mar09-Sep11 active. bk18151 CONF 1339.2/1339.2. JUL03=6 DAYS AWAY. SQL NOT RUN. Neil: run before Thu Jul03. Last checked: 2026-06-27 SAT UTC hrly bot (51st check).**

**Jun27 SAT UTC (53rd check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) bcId=24925 STILL NOT FIXED. bc24925 AY Afternoon Mar09-Sep11 active=true fee=1102.20. bk18151 CONF 1339.2/1339.2. weekEnd=JUL03=6 DAYS AWAY — after expiry Saikhantes vanishes from B1-PM scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255. NEIL URGENT: must run before Thu Jul03. Last checked: 2026-06-27 SAT UTC hourly bot (53rd check).**

**Jun28 SUN UTC (fresh DB): CONFIRMED UNCHANGED. sca255 STILL weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) classId=11 studentId=1001 bookingCourseId=24925. bc24925 Academic Year Afternoon Mar09-Sep11 active=true. bk18151 CONFIRMED amtPaid=1339.2/1339.2 confirmed=true (fully paid). weekEnd Jul03=5 DAYS AWAY. SQL NOT RUN. NEIL: UPDATE student_class_assignments SET week_start=<correct>, week_end=<correct> WHERE id=255 BEFORE Jul03. Last checked: 2026-06-28 UTC.**

**Jun28 SUN UTC (2nd check today, fresh DB): CONFIRMED UNCHANGED. sca255 STILL weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) classId=11 studentId=1001 bookingCourseId=24925. bc24925 Academic Year Afternoon Mar09-Sep11 active=true. bk18151 CONFIRMED amtPaid=1339.2/1339.2 confirmed=true (fully paid). weekEnd Jul03=5 DAYS AWAY. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL URGENT: must run before Thu Jul03. Last checked: 2026-06-28 SUN UTC (2nd check today).**

**Jun28 SUN UTC (fresh DB): sca255 week_start=2026-01-12 STILL WRONG (bc24925 Academic Year Afternoon starts 2026-03-09). week_end=2026-07-03 (5 days away — URGENT). bk18151 CONFIRMED confirmed=true. Student: Saikhantes Shagdarsuren (s1001). Fix NOT RUN: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255. Must run before Jul03 or student loses class. Last checked: 2026-06-28 SUN UTC.**

**Jun28 SUN UTC (4th Jun28 check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bookingCourseId=24925 STILL NOT FIXED. bc24925 AY Afternoon Mar09-Sep11 active=true fee=1102.20. bk18151 CONFIRMED amtTotal=1339.2 amtOpen=0 (fully paid). weekEnd=Jul03=5 DAYS AWAY — after expiry Saikhantes vanishes from B1-PM class scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: URGENT — must run before Thu Jul03. Last checked: 2026-06-28 SUN UTC (4th Jun28 check).**

**Jun28 SUN UTC (hrly bot, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) bookingCourseId=24925 STILL NOT FIXED. bc24925 AY-AFT startDate=2026-03-09 endDate=2026-09-11 active=true fee=1102.20. bk18151 CONFIRMED amtTotal=1339.2 amtOpen=0 (fully paid). weekEnd=Jul03=5 DAYS AWAY — after expiry Saikhantes vanishes from B1-PM scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255. NEIL: URGENT — must run before Thu Jul03. Last checked: 2026-06-28 SUN UTC (hrly bot).**

**Jun28 SUN 04:04 UTC (fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bookingCourseId=24925 STILL NOT FIXED. bc24925 AY Afternoon Mar09-Sep11 active=true fee=1102.20. bk18151 CONF amtTotal=1339.2 amtOpen=0. weekEnd=Jul03=5 DAYS AWAY — after expiry Saikhantes vanishes from B1-PM class scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: URGENT — must run before Thu Jul03. Last checked: 2026-06-28 04:04 UTC (hrly bot).**

Last checked Jun28 SUN UTC: sca255 weekStart=2026-01-12 STILL WRONG weekEnd=2026-07-03 (5d to expire). bc24925 AY-AFT Mar09-Sep11 fee=1102.20 bk18151 CONF conf=true amtPaid=1339.2/1339.2 (student 1001). SQL NOT RUN. NEIL: run before Thu Jul 03.

Last checked Jun28 SUN UTC (3rd re-check, fresh DB): sca255 weekStart=2026-01-12 STILL WRONG weekEnd=2026-07-03 — 5 days to expiry (Thu Jul03). bc24925 AY Afternoon Mar09-Sep11 confirmed bk18151. Student 1001. SQL NOT RUN: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255. Same as Issue 15. Neil: run before Thu Jul03.
**Jun28 SUN UTC (4th re-check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) STILL NOT FIXED. bc24925 AY-AFT Mar09-Sep11 active=true. weekEnd=Jul03=5 DAYS to expiry. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: 5 days — run before Thu Jul03. See also Issue 15. Last checked: 2026-06-28 SUN UTC (4th re-check).**

**Jun28 SUN UTC (5th re-check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bookingCourseId=24925 STILL NOT FIXED. bc24925 AY-Afternoon Mar09-Sep11 active=true fee=1102.20. bk18151 CONFIRMED amtPaid=1339.2/1339.2 confirmed=true (fully paid). weekEnd=Jul03=5 DAYS AWAY — after expiry Saikhantes vanishes from B1-PM class scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: URGENT — must run before Thu Jul03. Last checked: 2026-06-28 UTC (5th re-check).**
**Jun28 SUN UTC (7th re-check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bookingCourseId=24925 STILL NOT FIXED. bc24925 AY-Afternoon Mar09-Sep11 active=true fee=1102.20. bk18151 CONFIRMED amtPaid=1339.2/1339.2 confirmed=true (fully paid). weekEnd=Jul03=5 DAYS AWAY — after expiry Saikhantes vanishes from B1-PM class scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start="2026-03-09", week_end="2026-09-11" WHERE id=255. NEIL: URGENT — must run before Thu Jul03. Last checked: 2026-06-28 SUN UTC (7th re-check, hrly bot).**
**Jun29 MON UTC (12th check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bookingCourseId=24925 STILL NOT FIXED. bc24925 AY-AFT Mar09-Sep11 active=true. bk18151 CONF amtPaid=1339.2/1339.2. weekEnd=Jul03=4 DAYS AWAY — CRITICAL. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: MUST RUN BEFORE THU JUL03. Last checked: 2026-06-29 MON UTC (12th check).**

**Jun30 TUE UTC (19th check rows 15+29, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bookingCourseId=24925 STILL NOT FIXED. bc24925 AY-AFT Mar09-Sep11 active=true. bk18151 CONF amtPaid=1339.2/1339.2. weekEnd=Jul03=3 DAYS AWAY — CRITICAL. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: MUST RUN BEFORE THU JUL03. Last checked: 2026-06-30 TUE UTC (19th check).**

**Jun30 TUE UTC (21st check rows 15+29, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bookingCourseId=24925 STILL NOT FIXED. bc24925 AY Afternoon Mar09-Sep11 active=true fee=1102.20. bk18151 CONFIRMED amtPaid=1339.2/1339.2. weekEnd=Jul03 = 3 DAYS AWAY — CRITICAL. After expiry Saikhantes vanishes from B1-PM class scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: MUST RUN BEFORE THU JUL03. Last checked: 2026-06-30 TUE UTC (21st check).**

**Jun30 TUE UTC (24th check, fresh DB): SCA 255 weekStart=2026-01-12 weekEnd=2026-07-03 STILL WRONG. weekEnd EXPIRES IN 3 DAYS (Fri Jul 3 2026). bc24925 AY-Afternoon Mar09-Sep11 active=true. bk18151 CONF confirmed=true EUR1339.20. After Fri, Saikhantes drops off class 11 B1-PM through Sep11 = 10 weeks uncovered. Fix (NOT YET RUN): UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255; NEIL: 3 DAYS LEFT - RUN NOW. Last checked: 2026-06-30 TUE UTC (24th check, hourly bot).**

**Jun30 TUE UTC (25th check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bookingCourseId=24925 STILL NOT FIXED. bc24925 AY Afternoon Mar09-Sep11 active=true fee=1102.20. bk18151 CONFIRMED amtPaid=1339.2/1339.2. weekEnd=Jul03 = 3 DAYS AWAY — EXPIRES FRI 3 JUL. After expiry Saikhantes vanishes from class 11 B1-PM scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: MUST RUN BEFORE FRI JUL 3. Last checked: 2026-06-30 TUE UTC (25th check, hourly bot).**

**Jun30 TUE UTC (31st check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bookingCourseId=24925 STILL NOT FIXED. bc24925 Academic Year Afternoon Mar09-Sep11 active=true fee=1102.20. bk18151 CONFIRMED amtPaid=1339.2/1339.2. weekEnd=Jul03 = 3 DAYS AWAY. After expiry Saikhantes drops from class 11 B1-PM for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: MUST RUN BEFORE FRI JUL 3. Last checked: 2026-06-30 TUE UTC (31st check, hrly bot).**

**Jun30 TUE UTC (32nd check, fresh DB): CONFIRMED UNCHANGED. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bookingCourseId=24925 STILL NOT FIXED. bc24925 Academic Year Afternoon Mar09-Sep11 active=true. weekEnd=Jul03 = 3 DAYS AWAY. After expiry Saikhantes drops from class 11 B1-PM for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: MUST RUN BEFORE FRI JUL 3. Last checked: 2026-06-30 TUE UTC (32nd check, hrly bot).**

**Jun30 TUE UTC (33rd check, fresh DB): sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) STILL NOT FIXED. bc24925 AY-AFT Mar09-Sep11 active=true. weekEnd=JUL03=3 DAYS AWAY. SQL NOT RUN. NEIL: 3 DAYS LEFT — RUN NOW.**

Last checked: 2026-06-30 TUE UTC (38th check): sca255 weekStart=Jan12 weekEnd=Jul03 STILL UNCHANGED. EXPIRES FRI 3 JUL = 3 DAYS. SQL NOT RUN. NEIL: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255; TODAY.
Last checked: 2026-06-30 UTC (40th check, hrly bot): sca255 STILL weekStart=2026-01-12 weekEnd=2026-07-03 classId=11. BC24925 AY-Afternoon Mar09-Sep11 active. EXPIRES FRI 3 JUL = 3 DAYS. UPDATE NOT RUN — 40 CHECKS. Neil: RUN TODAY — UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255; Without this Saikhantes (student 1001) drops from class lists on Friday.
Last checked: 2026-06-30 UTC (41st check, hrly bot): sca255 STILL weekStart=2026-01-12 weekEnd=2026-07-03 classId=11. BC24925 AY-Afternoon Mar09-Sep11 active. EXPIRES FRI 3 JUL = 3 DAYS. UPDATE NOT RUN 41 CHECKS. Neil: RUN TODAY: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255; Without this Saikhantes drops from class lists on Friday.

**Jul01 WED UTC (42nd check, fresh DB): CONFIRMED UNCHANGED — EXPIRES IN 2 DAYS. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 STILL NOT FIXED. bc24925 AY Afternoon Mar09-Sep11 active=true. weekEnd=Jul03 = 2 DAYS AWAY — Saikhantes drops from class 11 B1-PM Friday and stays invisible for 10 weeks through Sep11. SQL NOT RUN 42 CHECKS. NEIL: RUN NOW: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255; Last checked: 2026-07-01 UTC (42nd check, hrly bot — 2 DAYS TO EXPIRY).**

**Jul01 WED UTC (43rd/44th check rows 15+29, fresh DB): CONFIRMED UNCHANGED — EXPIRES IN 2 DAYS. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bookingCourseId=24925 STILL NOT FIXED. bc24925 AY Afternoon Mar09-Sep11 active=true. weekEnd=Jul03 = 2 DAYS AWAY (FRIDAY). After expiry Saikhantes vanishes from class 11 B1-PM scheduling for 10 weeks through Sep11. SQL NOT RUN: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255. NEIL: MUST RUN TODAY OR TOMORROW BEFORE FRI JUL03. Last checked: 2026-07-01 UTC (43rd/44th check, hrly bot — 2 DAYS TO EXPIRY).**

**Jul01 WED UTC (45th check rows 15+29, fresh DB): CONFIRMED UNCHANGED — EXPIRES IN 2 DAYS. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bookingCourseId=24925 STILL NOT FIXED. bc24925 AY Afternoon Mar09-Sep11 active=true. weekEnd=Jul03 = FRIDAY = 2 DAYS. After expiry Saikhantes drops from class 11 (B1 PM) scheduling for 10 weeks through Sep11. SQL NOT RUN 45 CHECKS: UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255. NEIL: MUST RUN TODAY OR TOMORROW BEFORE FRI JUL03. Last checked: 2026-07-01 UTC (45th check, hrly bot — 2 DAYS TO EXPIRY).**

**Jul01 WED UTC (46th check, fresh DB): CONFIRMED UNCHANGED — EXPIRES IN 2 DAYS. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) studentId=1001 bookingCourseId=24925 (Academic Year Afternoon, bk18151) STILL NOT FIXED. bc24925 AY-Afternoon Mar09-Sep11 active=true. weekEnd=Jul03 = FRIDAY = 2 DAYS. After expiry Saikhantes drops from class 11 (B1 PM) scheduling for 10 weeks through Sep11. SQL NOT RUN 46 CHECKS: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255; NEIL: MUST RUN TODAY OR TOMORROW BEFORE FRI JUL03. Last checked: 2026-07-01 UTC (46th check, hrly bot — 2 DAYS TO EXPIRY).**

**Jul01 WED UTC (47th check, fresh DB): CONFIRMED UNCHANGED — EXPIRES IN 2 DAYS. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) STILL NOT FIXED. bc24925 AY-Afternoon Mar09-Sep11 active=true. weekEnd=Jul03 = 2 DAYS. SQL NOT RUN 47 CHECKS: UPDATE student_class_assignments SET week_start='2026-03-09', week_end='2026-09-11' WHERE id=255; NEIL: RUN TODAY OR TOMORROW. Last checked: 2026-07-01 UTC (47th check, hrly bot — 2 DAYS TO EXPIRY).**

**Jul01 WED UTC (49th check, fresh DB): CONFIRMED UNCHANGED — EXPIRES FRI 3 JUL IN 2 DAYS. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) STILL NOT FIXED. bc24925 AY-Afternoon Mar09-Sep11 active=true. weekEnd Jul03=FRIDAY=2 DAYS. SQL NOT RUN 49 CHECKS. NEIL: RUN BEFORE THU 2 JUL EOD — UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255; Last checked: 2026-07-01 UTC (49th check, hrly bot).**
**Jul01 WED UTC (52nd check, fresh DB): CONFIRMED UNCHANGED — EXPIRES FRI 3 JUL IN 2 DAYS. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) STILL NOT FIXED. SQL NOT RUN 52 CHECKS. NEIL: RUN BEFORE THU 2 JUL EOD — UPDATE student_class_assignments SET week_start=2026-03-09, week_end=2026-09-11 WHERE id=255; Last checked: 2026-07-01 UTC (52nd check, hrly bot — TODAY IS LAST BUSINESS DAY).**
**Jul02 THU UTC (57th check, fresh DB): CONFIRMED UNCHANGED — EXPIRES TOMORROW FRI 3 JUL. sca255 classId=11 weekStart=2026-01-12(WRONG) weekEnd=2026-07-03(WRONG) STILL NOT FIXED. bc24925 AY-Afternoon Mar09-Sep11 active=true. weekEnd=Jul03=FRIDAY=TOMORROW. SQL NOT RUN 57 CHECKS. NEIL: RUN TODAY THU 2 JUL EOD — UPDATE student_class_assignments SET week_end=2026-09-11 WHERE id=255; Last checked: 2026-07-02 UTC (57th check, hrly bot — TODAY IS ABSOLUTE LAST CHANCE).**
**Jul02 THU UTC (71st check, fresh DB): sca255 week_end=2026-07-03 EXPIRES TOMORROW FRIDAY. See Issue 15 (row 16) for fix. SQL NOT RUN: UPDATE student_class_assignments SET week_end='2026-10-02' WHERE id=255. Run before end of day Fri 3 Jul. Last checked: 2026-07-02 UTC (71st check, hrly bot).**

## 11th check (hrly7) — 2026-07-08 UTC

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.
SCA255 weekEnd=2026-07-03 STILL EXPIRED (5 days). 3 school days missed (Mon6+Tue7+Wed8). BC24925 AY-Afternoon active to Oct2. Dupe of Issue 15 / row 16. NEIL: UPDATE student_class_assignments SET week_end=\2026-10-02 WHERE id=255 TODAY. Last checked: 2026-07-08 UTC (hrly7).

## 12th check - 2026-07-10 UTC (Friday - end of week)

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.
- SCA255: weekEnd=2026-07-03 STILL EXPIRED (7 days since Jul3)
- BC24925 (Academic Year Afternoon): startDate=2026-03-09, endDate=2026-10-02, active=true
- School days missed this week: Mon Jul6 Tue Jul7 Wed Jul8 Thu Jul9 Fri Jul10 = 5 full school days
- At risk from Mon 13 Jul: 57 more school days through Oct2 unless fixed this weekend

FIX (NOT YET RUN):
  UPDATE student_class_assignments SET week_end = 2026-10-02 WHERE id = 255;

NEIL: Run the UPDATE above before Monday 13 July 08:00 to restore class scheduling.
Last checked: 2026-07-10 UTC (hourly bot, 12th check).

## 13th check - 2026-07-10 UTC (2nd check this day, Friday)

CONFIRMED UNCHANGED (fresh DB). No action taken. Report-only.
- SCA255: weekStart=2026-01-12, weekEnd=2026-07-03 — STILL EXPIRED (7 days)
- BC24925 (Academic Year Afternoon): startDate=2026-03-09, endDate=2026-10-02, active=true
- Only 1 class assignment on bc24925 = SCA255 (expired Jul3)
- 5 school days missed: Mon 6 Jul, Tue 7 Jul, Wed 8 Jul, Thu 9 Jul, Fri 10 Jul
- Week 2 starts Monday 13 July — 57 more school days through Oct 2 at risk

FIX (NOT YET RUN):
  UPDATE student_class_assignments SET week_end = '2026-10-02' WHERE id = 255;

NEIL: THIS IS FRIDAY. RUN BEFORE MONDAY 13 JULY 08:00.
Last checked: 2026-07-10 UTC (hourly bot, 13th check).

---
7th check 2026-07-12 SUN UTC: CONFIRMED UNCHANGED (fresh DB). Duplicate of issue 15 row 16. SCA255 weekEnd=Jul3 class11 STILL expired 9d. Mon13=TOMORROW. See row 16 recipe (issue-15-saikhantes-course-dates.md) for full fix. Sheet J30 updated.
Last checked: 2026-07-12 SUN UTC (7th check, hourly bot).
