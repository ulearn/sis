# Issue 31 -- Attendance Sheets: Week-start Sunday bug + stale students

Reporter: AC  Area: attendance sheets  Sheet row: 32  Last checked: 2026-06-12 UTC

## Symptom
1. Printed sheets show week starting 14/06/2026 (Sunday) instead of 15/06/2026 (Monday).
2. Completed students still appear on attendance sheets.
3. Print only from Attendance section, not Classes section.

## Root cause

### Bug 1 -- Week label shows Sunday (CONFIRMED via live server probe)

Server runs BST (UTC+1, getTimezoneOffset=-60). In src/scripts/attendance.ts getWeekAttendance():

  const monday = new Date(weekOf);         // Jun15 00:00 UTC
  monday.setDate(...);                     // no change (already Monday)
  monday.setHours(0, 0, 0, 0);            // BUG: Jun15 00:00 BST = Jun14 23:00 UTC
  weekStart: monday.toISOString()...      // -> 2026-06-14 (Sunday)

Proof: node -e const d=new Date(2026-06-15);d.setHours(0,0,0,0);console.log(d.toISOString())
Output: 2026-06-14T23:00:00.000Z

Same monday drives Mon-Fri day columns + Prisma filters -- all shifted 1h.

### Bug 2 -- Stale students appear

SCAs with weekEnd=null always pass the weekEnd>=monday filter (no cleanup).
Single-span SCAs (e.g. sca255 Saikhantes weekStart=Jan12, weekEnd=Jul03) stay visible.

### Non-bug 3 -- No print in Classes section (feature request)

Print routes are only in attendance route. Classes section has no print button.

## Fix recipe (NOT YET RUN)

Step 1 -- Fix BST bug in src/scripts/attendance.ts (and the /print/week/:weekOf route):
  Remove monday.setHours(0,0,0,0) -- new Date(YYYY-MM-DD) is already UTC midnight.
  Capture weekStart immediately after the setDate correction.
  Then: npm run build && touch tmp/restart.txt
  OR (simpler, no code change): add TZ=UTC to .env and restart.

Step 2 -- Clamp stale SCAs (NOT YET RUN):
  SELECT sca.id, s.first_name, bc.end_date, sca.week_end
  FROM student_class_assignments sca
  JOIN booking_courses bc ON bc.id=sca.booking_course_id
  JOIN bookings bk ON bk.id=bc.booking_id
  JOIN students s ON s.id=bk.student_id
  WHERE (sca.week_end IS NULL OR sca.week_end > bc.end_date)
    AND bc.end_date < CURRENT_DATE;
  -- then: UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=sca.booking_course_id) WHERE id IN (...);

Step 3 -- Add print to Classes section (feature):
  In showClassDetail() in admin.html add link to /sis/api/attendance/print/class/ID/WEEK.

## Risk
Bug 1: code/reversible, low blast radius, build required.
Bug 2: data-hygiene/reversible SQL.
Step 3: additive code change.

## Status
New issue. Root cause confirmed. No steps run yet.
Last checked: 2026-06-12 UTC (initial diagnosis).
Last checked: 2026-06-12 UTC (this run) — 9 stale SCAs confirmed (weekEnd=null, course ended):
IDs: 39(s297/bc1517/ended May22), 40(s938/bc1641/Jun12), 65(s869/bc1539/Jun12), 66(s930/bc1629/May15), 74(s769/bc1358/May15), 75(s960/bc1683/Jun12), 81(s840/bc1484/Jun05), 87(s30/bc36/Jun05), 100(s966/bc1691/May29).
Step2 UPDATE SQL (NOT YET RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN (39,40,65,66,74,75,81,87,100);

Last checked: 2026-06-12 UTC hrly (this cron run) -- CONFIRMED + CORRECTED stale SCA data:
  6 stale SCAs with courses ALREADY ended (< Jun12):
    ID 39: s297 cls6  course ended 2026-05-22
    ID 66: s930 cls9  course ended 2026-05-15
    ID 74: s769 cls10 course ended 2026-05-15
    ID 81: s840 cls11 course ended 2026-06-05
    ID 87: s30  cls11 course ended 2026-06-05
    ID 100: s966 cls12 course ended 2026-05-29
  3 stale SCAs whose courses end TODAY Jun12:
    ID 40: s938 cls6  course ends 2026-06-12
    ID 65: s869 cls9  course ends 2026-06-12
    ID 75: s960 cls10 course ends 2026-06-12
  Total: 9 stale SCAs (same list as before, now with confirmed end dates).
  Step2 SQL (NOT YET RUN - safe to run any time after Jun12):
    UPDATE student_class_assignments
    SET week_end = (SELECT end_date FROM booking_courses
                    WHERE id = student_class_assignments.booking_course_id)
    WHERE id IN (39, 40, 65, 66, 74, 75, 81, 87, 100);
  Bug1 still not fixed. K set to 'code fix needed'.
Last checked: 2026-06-12 UTC hrly-latest: sca40(s938/Isabela)+sca65(s869/Willians)+sca75(s960/Javkhlan) courses ENDED TODAY Jun12 — all 3 week_end still NULL (not clamped). Full stale list: 6 ended(ids:39,66,74,81,87,100) + 3 ended-today(ids:40,65,75). 34 ongoing SCAs week_end=null=OK. BST bug NOT FIXED — attendance sheet will show Sun Jun14 instead of Mon Jun15 for NEXT WEEK (wb Jun15). NEIL MUST act before Monday. SQL (NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN (39,40,65,66,74,75,81,87,100); Code fix: remove setHours(0,0,0,0) from attendance.ts getWeekAttendance() OR add TZ=UTC to .env.

Last checked: 2026-06-12 UTC (this run) EOD: ALL 9 stale SCAs now have courses ended. IDs 40(s938/bc1641), 65(s869/bc1539), 75(s960/bc1683) courses ended TODAY Jun12. IDs 39/66/74/81/87/100 ended May15-Jun05. week_end=null persists on all 9. BST bug NOT FIXED — Mon Jun15 attendance sheet WILL show Sun Jun14 instead of Mon Jun15. Total null week_end in DB: 43(34 are ongoing students = OK). NEIL: run SQL TONIGHT + fix code before Mon. SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100); Code fix: remove setHours(0,0,0,0) from src/scripts/attendance.ts getWeekAttendance() OR add TZ=UTC to .env+restart.

Last checked: 2026-06-12 UTC hrly (this cron run) FINAL FRIDAY: BST bug NOT FIXED. 9 stale SCAs (ids:39,40,65,66,74,75,81,87,100): 6 with end_date<Jun12 + 3 ended today Jun12. Mon Jun15 att sheet WILL show Sun Jun14. Total week_end=null in DB=45(36 ongoing=OK). SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100); Code fix NOT RUN: rm setHours(0,0,0,0) from attendance.ts OR add TZ=UTC to .env+restart. NEIL: BOTH FIXES TONIGHT.

Last checked: 2026-06-12 UTC hrly (cron) — UNCHANGED. BST bug NOT FIXED. 9 stale SCAs week_end=null (ids:39,40,65,66,74,75,81,87,100) — all booking courses now ended (3 ended TODAY Jun12: bc1539/1641/1683). Mon Jun15 att sheet WILL show Sun Jun14. Total week_end=null in DB=45 (36 ongoing=OK, 9 stale). SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100); Code fix(NOT RUN): remove setHours(0,0,0,0) from attendance.ts getWeekAttendance() OR add TZ=UTC to .env+restart. NEIL: BOTH FIXES TONIGHT.

Last checked: 2026-06-12 UTC hrly (this run) CONFIRMED: BST code bug NOT FIXED. 9 stale SCAs week_end=null still present (IDs:39,40,65,66,74,75,81,87,100; all courses ended <=Jun12). Mon Jun15 att sheet WILL show Sun Jun14. Both fixes NOT RUN. TODAY FRIDAY = LAST CHANCE.

Last checked: 2026-06-12 UTC hrly (cron FINAL) — DB verified: 45 SCAs week_end=null total (36 active courses=OK; 9 ended IDs 39,40,65,66,74,75,81,87,100). Bug attendance.ts:213-214: new Date(weekOf)=UTC midnight, setHours(0,0,0,0)=BST midnight=Jun14 23:00 UTC->toISOString()="2026-06-14"=Sunday. Fix1(NOT RUN): setHours->setUTCHours(0,0,0,0) then npm run build && touch tmp/restart.txt. Fix2 SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100). NEIL: BOTH FIXES TONIGHT.
Last checked: 2026-06-13 UTC hrly SAT — BST BUG NOT FIXED. 9 stale SCAs week_end=null all courses ended <=Jun13 (IDs:39,40,65,66,74,75,81,87,100). Total null week_end in DB=43(34 ongoing=OK, 9 stale). Bug confirmed in BOTH files: routes/attendance.ts lines 212-214 AND scripts/attendance.ts lines 32-34+38-39. Fix: replace getDay()->getUTCDay(), setDate->setUTCDate, setHours->setUTCHours throughout both files; then npm run build && touch tmp/restart.txt. Fix2 SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100); NEIL: BOTH FIXES MUST RUN before Monday 07:00.

Last checked: 2026-06-13 UTC hrly2 SAT — NEW FINDING: TZ=UTC NOT in .env. SIMPLER FIX: add TZ=UTC to .env + touch tmp/restart.txt (no build needed). Fix2 SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100). Stale SCAs: 39(Aika/May22),40(Isabela/Jun12),65(Willians/Jun12),66(Eduardo/May15),74(Gabriel/May15),75(Javkhlan/Jun12),81(Diego/Jun05),87(Teofilo/Jun05),100(Luca/May29). Mon Jun15 att sheet WILL show Sun Jun14 if not fixed. DEADLINE: Mon 07:00.
Last checked: 2026-06-13 UTC hrly SAT (this run) — BST BUG CONFIRMED NOT FIXED. scripts/attendance.ts:34+routes/attendance.ts:214 both still have setHours(0,0,0,0). TZ=UTC NOT in .env. 9 stale SCAs (courses all ended <=Jun12, week_end=null): IDs 39,40,65,66,74,75,81,87,100. Total null week_end in DB=43 (34 ongoing=OK, 9 stale). Both fixes NOT RUN. K changed to fix-before-Mon-07:00.

Last checked: 2026-06-13 UTC hrly SAT (cron) -- BST BUG STILL NOT FIXED. TZ=UTC NOT in .env confirmed. All 9 stale SCAs weekEnd=null (IDs:39,40,65,66,74,75,81,87,100; courses all ended <=Jun12). Occurrences correctly Jun15(Mon) in DB. Mon Jun15 att sheet WILL show Sun Jun14 heading. DEADLINE: Mon 07:00. FIX1(NOT RUN): echo TZ=UTC >> .env && touch tmp/restart.txt. FIX2 SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100).

Last checked: 2026-06-13 UTC hrly SAT (this run) — CONFIRMED UNCHANGED. TZ=UTC NOT in .env. All 9 SCAs week_end=null (IDs:39,40,65,66,74,75,81,87,100; all booking_courses ended <=Jun12). Mon Jun15 att sheet WILL show Sun Jun14. BOTH FIXES NOT RUN. NEIL: FIX1 echo TZ=UTC>>.env+touch tmp/restart.txt; FIX2 SQL: UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100). DEADLINE Mon 07:00.

Last checked: 2026-06-13 UTC hrly2 SAT — <19h TO DEADLINE. BOTH FIXES NOT RUN. DB raw SQL: 9 stale SCAs week_end=null(IDs:39=Aika/May22,40=Isabela/Jun12,65=Willians/Jun12,66=Eduardo/May15,74=Gabriel/May15,75=Javkhlan/Jun12,81=Diego/Jun05,87=Teofilo/Jun05,100=Luca/May29). TZ=UTC NOT in .env. 121 active SCAs(112 ongoing+9 stale). Mon att sheet WILL show Sun Jun14+9 stale students. NEIL: TONIGHT — FIX1: echo TZ=UTC>>.env && touch tmp/restart.txt(NO BUILD); FIX2 SQL: UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100).

Last checked: 2026-06-13 UTC hrly SAT#3 — BOTH FIXES NOT RUN. TZ=UTC NOT in .env confirmed. 9 stale SCAs week_end=null (IDs:39,40,65,66,74,75,81,87,100; all booking_courses ended<=Jun12). Total 43 SCAs week_end=null in DB (34 ongoing=OK, 9 stale). Mon Jun15 att sheet WILL show Sun Jun14 heading + 9 ghost students. ~14h to Mon 07:00 deadline. NEIL TONIGHT: FIX1: echo TZ=UTC>>.env && touch tmp/restart.txt (NO BUILD NEEDED); FIX2 SQL (NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100).

Last checked: 2026-06-13 UTC hrly SAT#4 — CONFIRMED UNCHANGED. TZ=UTC NOT in .env (grep confirmed). routes/attendance.ts:214 + scripts/attendance.ts:34 still setHours(0,0,0,0). 9 stale SCAs week_end=null UNCHANGED: 39(Aika/May22),40(Isabela/Jun12),65(Willians/Jun12),66(Eduardo/May15),74(Gabriel/May15),75(Javkhlan/Jun12),81(Diego/Jun05),87(Teofilo/Jun05),100(Luca/May29). Total DB null=43(34 ongoing=OK). FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2 SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100). DEADLINE: Mon 07:00.

Last checked: 2026-06-13 UTC hrly SAT#5 — CONFIRMED UNCHANGED. TZ=UTC NOT in .env. All 9 stale SCAs week_end=null (IDs:39,40,65,66,74,75,81,87,100; all courses ended <=Jun12). Total null week_end in DB=43 (34 ongoing=OK, 9 stale). Mon Jun15 att sheet WILL show Sun Jun14+9 ghosts. BOTH FIXES NOT RUN. DEADLINE Mon 07:00. FIX1(NOT RUN): echo TZ=UTC>>.env+touch tmp/restart.txt. FIX2 SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100).

Last checked: 2026-06-13 UTC hrly SAT (this run) — CONFIRMED UNCHANGED. TZ=UTC NOT in .env (grep confirmed). routes/attendance.ts:214+scripts/attendance.ts:34 both still have setHours(0,0,0,0). All 9 stale SCAs week_end=null (IDs:39,40,65,66,74,75,81,87,100; all booking_courses ended <=Jun12): 39(Aika/May22),40(Isabela/Jun12),65(Willians/Jun12),66(Eduardo/May15),74(Gabriel/May15),75(Javkhlan/Jun12),81(Diego/Jun05),87(Teofilo/Jun05),100(Luca/May29). Total DB null=43(34 ongoing=OK). Mon Jun15 att sheet WILL show Sun Jun14+9 ghost students. BOTH FIXES NOT RUN. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2 SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100). DEADLINE: Mon 07:00 = <19h.

Last checked: 2026-06-13 UTC hrly SAT (FINAL RUN) — CONFIRMED UNCHANGED. TZ=UTC NOT in .env. All 9 stale SCAs week_end=null(IDs:39,40,65,66,74,75,81,87,100). Total 45 null-weekEnd SCAs in DB(9 stale+36 active). UPDATED FIX2 SQL: use broader WHERE week_end IS NULL (not just the 9 IDs) to prevent future ghost-student buildup as active courses end. UPDATED FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL; BOTH FIXES NOT RUN. DEADLINE Mon 07:00.

Last checked: 2026-06-13 UTC hrly3 -- BOTH FIXES NOT RUN. TZ=UTC absent .env (grep confirmed). scripts/attendance.ts:34+routes/attendance.ts:214 still setHours(0,0,0,0). 43 null-weekEnd SCAs (34 ongoing=OK, 9 stale). Stale IDs: 39(Aika/May22),40(Isabela/Jun12),65(Willians/Jun12),66(Eduardo/May15),74(Gabriel/May15),75(Javkhlan/Jun12),81(Diego/Jun05),87(Teofilo/Jun05),100(Luca/May29). Mon Jun15 att sheet WILL show Sun Jun14+9 ghost students. ~36h to Mon 07:00 IST deadline. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL; (use NULL filter, not ID list, to catch future stale SCAs).

---
**Last checked Jun13 SAT hrly4:** BOTH FIXES NOT RUN(confirmed). TZ=UTC absent .env. 9 ghost SCA IDs:39,40,65,66,74,75,81,87,100 week_end=null(all courses ended<=Jun12). Total nullWeekEnd=43(34 ongoing=OK). Mon Jun15 att sheet WILL show Sun Jun14+9 ghost students. NEIL: FIX1+FIX2 TONIGHT <12h to Mon 07:00.

**Last checked Jun13 SAT hrly6:** CONFIRMED UNCHANGED. TZ=Europe/Dublin NOT UTC. All 9 ghost SCAs week_end=null (IDs:39,40,65,66,74,75,81,87,100; all bc ended <=Jun12). Total null=43(34 ongoing=OK, 9 stale). Mon Jun15 att sheet WILL show Sun Jun14+9 ghost students. BOTH FIXES NOT RUN. <24h to Mon 07:00. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2 SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL;

**Last checked Jun13 SAT hrly7 23:00IST:** DB RECHECKED. 43 SCAs week_end=null CONFIRMED (9 stale ended<=Jun12 + 34 active ongoing, all created Apr6 migration). TZ=UTC NOT in .env. BOTH FIXES NOT RUN. ~32h to Mon 07:00 IST deadline. SQL covers all 43.

**Last checked Jun14 SUN hrly:** TZ NOT SET confirmed(grep ^TZ= .env=0 results). routes/attendance.ts:214+scripts/attendance.ts:34 STILL setHours(0,0,0,0). All 9 stale SCAs week_end=null UNCHANGED: sca39(s297/bc1517 May22),sca40(s938/bc1641 Jun12),sca65(s869/bc1539 Jun12),sca66(s930/bc1629 May15),sca74(s769/bc1358 May15),sca75(s960/bc1683 Jun12),sca81(s840/bc1484 Jun05),sca87(s30/bc36 Jun05),sca100(s966/bc1691 May29). Mon Jun15 att sheet WILL show Jun14(Sun)+9 ghost students. BOTH FIXES NOT RUN. NEIL: FIX BEFORE 08:00 MON. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2 SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100).

**Last checked Jun14 SUN hrly2:** UNCHANGED. TZ NOT SET in .env (confirmed grep ^TZ= = no results). All 9 stale SCAs week_end=null: sca39(Aika Narita/B2+C1PM/bcEnd=May22), sca40(Isabela Percon Peixoto/B2+C1PM/bcEnd=Jun12), sca65(Willians dos Santos Coelho/A2PM/bcEnd=Jun12), sca66(Eduardo Gubert Barreto/A2PM/bcEnd=May15), sca74(Gabriel dos Santos Toledo/IELTS/bcEnd=May15), sca75(Javkhlan Gantsooj/IELTS/bcEnd=Jun12), sca81(Diego Alves da Silva Molina/B1PM/bcEnd=Jun05), sca87(Teofilo Jabato/B1PM/bcEnd=Jun05), sca100(Luca Feola/B1AM2/bcEnd=May29). Postgres TZ=Europe/Dublin (correct). routes/attendance.ts:214+scripts/attendance.ts:34 still have setHours(0,0,0,0). BOTH FIXES NOT RUN. Mon Jun15 att sheet WILL show Sun Jun14+9 ghost students. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2 SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE id IN(39,40,65,66,74,75,81,87,100).

**Last checked Jun14 SUN hrly3 — SCOPE UPDATE:** DB live query: 43 SCAs with week_end=null total. 9 GHOST past-end (IDs: 39/40/65/66/74/75/81/87/100, all bc_end<=Jun12). 34 ACTIVE ongoing students also week_end=null — Apr6 migration; SCA creation code never sets week_end. TZ=NOT SET confirmed (process.env.TZ empty). BOTH FIXES NOT RUN. Mon Jun15 att sheet WILL show Sun Jun14+9 ghost students. UPDATED FIX2: broader WHERE week_end IS NULL covers all 43 safely (each SCA gets its own bc.end_date). FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL; NEIL: both before 08:00 Mon.
**Last checked Jun14 SUN hrly4:** CONFIRMED UNCHANGED. TZ NOT SET .env (grep ^TZ= confirms). 43 SCAs week_end=null: 9 GHOST past-end (IDs:39/40/65/66/74/75/81/87/100, all bc_end<=Jun12) + 34 ACTIVE ongoing. BOTH FIXES NOT RUN. Mon Jun15 att sheet WILL show Sun Jun14 heading+9 ghost students. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL; NEIL: BOTH FIXES TONIGHT.
Status Jun14 hrly6 - TONIGHT URGENT:
TZ still NOT in .env(grep confirms). DB TZ=Europe/Dublin.
43 NULL week_end SCAs: 9 ghost(IDs:39/40/65/66/74/75/81/87/100 bc<=Jun12)+34 active ongoing.
Mon att sheet WILL show wrong week heading (Sun Jun14) and 9 ghost students.
BOTH FIXES NOT RUN. NEIL: apply tonight before midnight.
FIX1(NOT RUN): echo TZ=UTC >> .env && touch tmp/restart.txt
FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL;
Last checked: 2026-06-14 UTC hrly6

**Last checked Jun14 SUN hrly7:** CONFIRMED UNCHANGED. TZ NOT SET in .env (grep ^TZ= = null). 43 NULL week_end SCAs: 9 ghost past-end (IDs:39/40/65/66/74/75/81/87/100 all bc<=Jun12) + 34 active ongoing. BOTH FIXES NOT RUN. Mon Jun15 att sheet WILL show Sun Jun14 heading + 9 ghost students. NEIL: FIX BEFORE 08:00 MON. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2 SQL(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL;
**Last checked Jun14 SUN hrly9:** TZ STILL absent .env (grep ^TZ= = 0 results). 43 NULL week_end SCAs total — ghost set SHIFTED: NOW 13 ghost past-end (IDs:21/24/30/31/32/37/39/40/42/54/56/57/60) + 12 active ongoing. Old ghost IDs 65/66/74/75/81/87/100 NO LONGER in past-end set. Ghost count GROWN from 9->13. Active dropped 34->12. Mon Jun15 att sheet WILL show Sun Jun14+ghosts. BOTH FIXES NOT RUN. NEIL: FIX BEFORE 08:00 MON.
FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt
FIX2 SQL(NOT RUN - broader WHERE week_end IS NULL catches all 43):
  UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL;

**Last checked Jun14 SUN hrly10 (CORRECTION of hrly9):** hrly9 ghost/active counts were wrong (boundary check error). Verified via JOIN booking_courses.end_date: 9 ghost (IDs:39/40/65/66/74/75/81/87/100, bc_end<=Jun12, UNCHANGED from hrly7) + 34 active ongoing = 43 total. TZ STILL absent .env. Mon Jun15 att sheet WILL show Sun Jun14+9 ghost students. BOTH FIXES NOT RUN. NEIL: FIX BEFORE MIDNIGHT TONIGHT.
FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt
FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL;

**Last checked Jun15 MON hrly11:** IT IS NOW MONDAY. TZ STILL missing from .env(grep ^TZ= = 0 results). 43 null week_end SCAs(9 ghost IDs:39/40/65/66/74/75/81/87/100 + 34 active ongoing). Mon Jun15 att sheet showing Sun Jun14 heading+9 ghost students. BOTH FIXES NOT RUN. NEIL: apply FIX1+FIX2 IMMEDIATELY. FIX1(NOT RUN): echo TZ=UTC >> .env && touch tmp/restart.txt. FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL;

**Jun15 hrly12:** TZ STILL missing .env. 43 null week_end (9 ghost IDs:39/40/65/66/74/75/81/87/100; 34 active). FIX1+FIX2 NOT RUN.

**Jun14-UTC hrly (cron):** SCHOOL OPENED (Jun15 BST). TZ NOT in .env confirmed (grep ^TZ= = 0 results). DB TZ=Europe/Dublin. 43 SCAs week_end=null: 9 ghost (IDs:39/40/65/66/74/75/81/87/100 all bc_end<=Jun12) + 34 active ongoing. Att sheet shows Sun Jun14 heading for current week. BOTH FIXES NOT RUN. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL;
**Jun15-UTC hrly14 (cron):** SCHOOL OPEN. TZ NOT SET confirmed (grep ^TZ= = 0). DB TZ=Europe/Dublin. 43 SCAs week_end=null: 9 ghost (IDs:39/40/65/66/74/75/81/87/100 bc_end<=Jun12) + 34 active ongoing. Att sheet shows Sun Jun14 heading. BOTH FIXES NOT RUN. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL; NEIL: FIX BOTH IMMEDIATELY.

**Jun14-UTC 20:03:** BOTH FIXES NOT RUN. TZ NOT SET(.env confirmed grep ^TZ= = 0). DB TZ=Europe/Dublin. 43 SCAs week_end=null: 9 ghost past-end(IDs:39/40/65/66/74/75/81/87/100 bc_end<=Jun12)+34 active ongoing. School opens ~07:30 UTC Mon Jun15(~11.5h). Mon att sheet WILL show Sun Jun14 heading+9 ghost students. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL;


**Jun15-UTC hrly15:** SCHOOL OPEN. TZ STILL missing .env (grep ^TZ= = 0 results). DB TZ=Europe/Dublin. 43 SCAs week_end=null total: 9 GHOST past-end (IDs:39/40/65/66/74/75/81/87/100, all bc_end<=Jun12) + 34 active ongoing. Live DB confirms 5+ ghost SCAs (bc.end_date<Jun15) still pulling into attendance queries. Mon Jun15 att sheet shows Sun Jun14 heading + 9 ghost students RIGHT NOW. BOTH FIXES NOT RUN. FIX1(NOT RUN): echo TZ=UTC >> .env && touch tmp/restart.txt. FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL; NEIL: APPLY BOTH IMMEDIATELY.

**Jun15 hrly16 (cron):** SCHOOL OPEN. TZ STILL absent .env (grep ^TZ= = 0 results). 43 null week_end SCAs: 9 ghost past-end (IDs:39/40/65/66/74/75/81/87/100, all bc_end<=Jun12) + 34 active ongoing. 8 active courses with null week_end: bc1666(ends Jun19), bc1693(Jun26), bc1526(Jun26), bc1462(Jun26), bc1650(Jul10), bc1653(Jul10), bc1765(Jul17), bc1503(Jul17). Att sheet showing Sun Jun14 heading + 9 ghost students LIVE during school hours. BOTH FIXES NOT RUN. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL; NEIL: BOTH FIXES IMMEDIATELY.

**Jun15 hrly18:** SCHOOL OPEN day active. TZ absent .env confirmed(TZ= only embedded in Gmail OAuth token, not as standalone env var). 43 null week_end SCAs(9 ghost IDs:39/40/65/66/74/75/81/87/100 bc_end<=Jun12; 34 active ongoing). Att sheet shows Sun Jun14 heading+9 ghost students LIVE. BOTH FIXES NOT RUN. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL; NEIL: APPLY BOTH IMMEDIATELY.

**Jun15 hrly (this run):** TZ still ABSENT from .env (grep confirmed no TZ= line). 43 SCAs week_end=null UNCHANGED. Attendance sheets remain broken. NEIL: run FIX1 (append TZ=UTC to .env + touch tmp/restart.txt) ASAP.

**Jun15 hrly(cron): CONFIRMED UNCHANGED (this run).** TZ absent .env. 43 SCAs week_end=null. Both fixes NOT RUN. Att sheets still broken. Sheet J32 updated.

**Jun15 hrly(cron#2):** TZ still ABSENT from .env (grep ^TZ= = 0 results). 43 SCAs week_end=null UNCHANGED: 9 ghost past-end (IDs:39/40/65/66/74/75/81/87/100 all bc_end<=Jun12)+34 active ongoing. Att sheets showing Sun Jun14 heading+9 ghost students LIVE. BOTH FIXES NOT RUN. FIX1(NOT RUN): echo TZ=UTC >> .env && touch tmp/restart.txt. FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL; NEIL: FIX1 is 10 seconds.

**Jun15 hrly(cron#3):** TZ STILL absent .env (confirmed). 42 null week_end SCAs (was 43 — 1 active SCA now has week_end via new booking created correctly; fix SQL NOT run). Ghost IDs:39/40/65/66/74/75/81/87/100 ALL STILL null (9 stale UNCHANGED). Active null: 33. Att sheet still showing Sun Jun14+9 ghost students LIVE. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. FIX2(NOT RUN): UPDATE student_class_assignments SET week_end=(SELECT end_date FROM booking_courses WHERE id=booking_course_id) WHERE week_end IS NULL; NEIL: school OPEN — att sheets BROKEN LIVE. Last checked: 2026-06-15 UTC hrly(cron#3).

**Jun15 cron: CONFIRMED UNCHANGED. TZ STILL absent .env. 42 null weekEnd SCAs (9 ghost IDs:39/40/65/66/74/75/81/87/100 + 33 active ongoing). Att sheets showing Sun Jun14+9 ghost students LIVE. BOTH FIXES NOT RUN. FIX1(NOT RUN): echo TZ=UTC>>.env && touch tmp/restart.txt. Last checked: 2026-06-15 UTC cron.


**Jun16 hrly4 — NULL WEEK_END BUG RESOLVED:** DB live query: null_week_end SCA count = 0 (down from 42 on Jun15). All SCAs now have week_end set. Fix 2 (UPDATE student_class_assignments SET week_end=...) was applied — either via the recipe SQL or the SCA creation code was updated to always set week_end. Ghost students should no longer appear on attendance sheets. Bug 1 (BST Sunday heading): UNVERIFIED — no code/env read this run. NEIL: check attendance sheet for current week shows Mon Jun 15 heading + no ghost students. If both issues fixed, mark K=fixed. Last checked: 2026-06-16 UTC hrly4.
**Jun16 hrly(Tue) THIS RUN:** null_end=0 CONFIRMED (5th consecutive check, total SCAs=236). Bug 2 (stale students) = RESOLVED. Bug 1 (BST Sunday heading): code fix NOT applied. src/routes/attendance.ts:213-214 still uses monday.getDay() (local) and setHours(0,0,0,0). Proof: new Date(2026-06-16)=UTC-midnight, BST-local=Tue01:00, getDay()=2, setDate(15)=Jun15-BST-01:00, setHours(0,0,0,0)=Jun14-23:00-UTC, toISOString()=2026-06-14=Sunday. Fix: remove line 214 setHours(0,0,0,0) from BOTH routes/attendance.ts:214 AND scripts/attendance.ts:34 then npm run build && touch tmp/restart.txt. Last checked: 2026-06-16 UTC hrly(Tue).

**Jun17 hrly #2:** null_end=0 CONFIRMED (7th consecutive check, total SCAs=236). PARTIAL FIX STATUS: scripts/attendance.ts lines 36-37 NOW use UTC methods (setUTCDate/getUTCDay/setUTCHours + comment referencing issue #31) — this file IS fixed. routes/attendance.ts lines 213-214 STILL use local-time (monday.setDate(monday.getDate() - ((monday.getDay()+6)%7)) then monday.setHours(0,0,0,0)) — this is the REMAINING BUG. Exact fix needed (2 lines): line 213: change getDate()->getUTCDate(), getDay()->getUTCDay(); line 214: change setHours->setUTCHours. Then npm run build && touch tmp/restart.txt. NEIL: apply 2-line fix to routes/attendance.ts or mark wont-fix. Last checked: 2026-06-17 UTC hrly#2.

Last checked: 2026-06-17 UTC hrly (10th check) — src/routes/attendance.ts L212-214 STILL local-time getDay/setHours on UTC-midnight dates (bug NOT fixed). scripts/attendance.ts L36-37 confirmed UTC (already fixed). Fix is 2 lines: replace getDay() with getUTCDay(), getDate() with getUTCDate(), setHours() with setUTCHours(). 119 active SCAs in DB. NOT APPLIED. NEIL: apply or mark wont-fix.

Last checked: 2026-06-19 UTC hrly3 — UNCHANGED. src/routes/attendance.ts L213 getDay()/getDate() + L214 setHours() STILL local-time (fresh code). src/scripts/attendance.ts L36-37 confirmed UTC (fixed earlier). 2-line fix in routes file NOT applied. Bug reproduces on any BST/UTC midnight boundary. NEIL: apply or mark wont-fix.

**Last checked: 2026-07-08 UTC — CONFIRMED FIXED.**
routes/attendance.ts /print/week/:weekOf route now uses UTC methods (setUTCDate/getUTCDay/setUTCHours). Code comment references Issue 31. BST Sunday-shift bug resolved. Sub-issue (holiday display in attendance) tracked in Issue 36.
