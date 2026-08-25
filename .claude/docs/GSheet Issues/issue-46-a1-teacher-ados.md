# Issue 46 — A1 Class Attendance Sheet Shows ADoS Instead of Dave Booth

**Reporter:** AC (staff) | **Area:** Attendance / A1 class | **Sheet row:** 48

## Symptom

Attendance sheet for class A1 prints teacher as "ULearn ADoS". Paul confirmed Dave Booth is the class teacher.

## Root Cause

Two class_teachers records for class 7 (A1) both have end_date = NULL — both appear "currently active":

- class_teacher id=34: Dave Booth (teacher_id=4), start 2026-06-08, end_date=NULL — legitimate
- class_teacher id=46: ULearn ADoS (teacher_id=3), start 2026-06-25, end_date=NULL — stale overlap

The attendance script (src/scripts/attendance.ts line 178) uses `classTeachers?.[0]?.teacher` with no orderBy on the classTeachers include. Without explicit ordering, Postgres may return either record at index 0. When ADoS (id=46) lands at [0], the wrong name prints.

Most likely cause: ADoS was assigned to cover A1 around 25 June via a permanent class_teacher record instead of TeacherCover. End date was never set.

## Fix Recipe (NOT YET RUN)

### Option A — Set end_date on the ADoS record (recommended)

```sql
UPDATE class_teachers
SET end_date = '2026-06-27'
WHERE id = 46;
```

Verify:
```sql
SELECT ct.id, ct.teacher_id, ct.start_date, ct.end_date, t.first_name, t.last_name
FROM class_teachers ct
JOIN teachers t ON t.id = ct.teacher_id
WHERE ct.class_id = 7
ORDER BY ct.start_date;
```
Expected: only Dave Booth (id=34, end_date=null) is current.

### Option B — Delete the ADoS record (if purely erroneous)

```sql
DELETE FROM class_teachers WHERE id = 46;
```

## Risk / Category

- Category: data-hygiene / classes
- Reversible: Yes (Option A adds end_date; Option B deletes stale junction row)
- Blast radius: Class 7 (A1) attendance sheet only — no financial or booking impact

## Status

Open — recipe written, fix not applied.
Last checked: 2026-07-06 UTC (5th check)

**6 Jul UTC (5th check, fresh DB): CONFIRMED UNCHANGED. CT id=34 Dave Booth (teacher 4) Jun08 endDate=null. CT id=46 ADoS (teacher 3) Jun25 endDate=null — STILL OPEN. CT id=50 (teacher 17) May25-Jun05 endDate=Jun05 (closed, OK). Two active records on class 7. FIX NOT RUN: UPDATE class_teachers SET end_date=2026-06-27 WHERE id=46.**
**6 Jul UTC (6th check, fresh DB): CONFIRMED UNCHANGED. Class 7 (A1) still has two active class_teacher records: CT id=34 (Dave Booth, teacher 4, assigned Jun 8, end_date=null — legitimate current teacher) and CT id=46 (ULearn ADoS, teacher 3, assigned Jun 25, end_date=null — overlap, should be closed). CT id=50 (Margaret Woods, teacher 17, May 25–Jun 5) closed (OK). Attendance sheets continue to print wrong teacher. Fix NOT RUN — UPDATE class_teachers SET end_date=2026-06-27 WHERE id=46. Last checked: 2026-07-06 UTC (6th check, hrly bot).**

**7 Jul UTC (8th check, fresh DB): CONFIRMED UNCHANGED. CT id=34 (Dave Booth, teacher 4, Jun08, end_date=null — correct). CT id=46 (ULearn ADoS, teacher 3, Jun25, end_date=STILL null — overlap). CT id=50 (Margaret Woods, Jun5, closed). FIX NOT RUN: UPDATE class_teachers SET end_date=2026-06-27 WHERE id=46. A1 sheets still showing ADoS. Last checked: 2026-07-07 UTC (8th check).**

**7 Jul TUE UTC (11th check, fresh DB): CONFIRMED UNCHANGED. Class 7 (A1): record 34 = Dave Booth (teacher 4), assigned 8 Jun 2026, end_date=null — correct current teacher. Record 46 = ADoS (teacher 3), assigned 25 Jun 2026, end_date=STILL null — duplicate active record, should be closed 27 Jun 2026. Record 50 = Margaret Woods (teacher 17), assigned 25 May, end_date=5 Jun — correctly closed. A1 attendance sheets continue printing ULearn ADoS instead of Dave Booth. Fix NOT RUN: UPDATE class_teachers SET end_date=2026-06-27 WHERE id=46. Last checked: 2026-07-07 UTC (11th check, hrly bot).**

**7 Jul TUE UTC (13th check, fresh DB): CONFIRMED UNCHANGED. Class 7 (A1): record 34 = Dave Booth (teacher 4), assigned 8 Jun 2026, end_date=null — correct current teacher. Record 46 = ADoS (teacher 3), assigned 25 Jun 2026, end_date=STILL null — duplicate active record, should be closed 27 Jun 2026. Record 50 = Margaret Woods (teacher 17), assigned 25 May, end_date=5 Jun — correctly closed. A1 attendance sheets continue printing ULearn ADoS instead of Dave Booth. Fix NOT RUN: UPDATE class_teachers SET end_date=2026-06-27 WHERE id=46. Last checked: 2026-07-07 UTC (13th check, hrly bot).**
