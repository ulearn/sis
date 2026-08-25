# Issue 47 — RAFAEL FERREIRA DE LIMA

Reporter: TB | Area: Attendance | Sheet row: 49

## Symptom

"For the week of July 6th-10th he was present for the whole week."

## Root Cause

Rafael (student 830, booking 1374) had his SCA changed from class 7 (A1) to class 8 (A2 AM) on 2026-07-06:

- SCA 153: Class 7 (A1), Apr 27 to Jul 5 2026 (expired)
- SCA 296: Class 8 (A2 AM), Jul 6 to Oct 9 2026 (active)

The system pre-generated attendance records for class 7 on 2026-07-03 for the week of Jul 6-10,
marking Rafael ABSENT_UNCERTIFIED (one per day Mon-Fri). These were not cleaned up when his SCA
moved to class 8. The class 8 teacher entered correct PRESENT records retroactively on 2026-07-13.
Rafael now has 10 attendance records for that week: 5 orphaned absences in A1 + 5 correct presences in A2 AM.

Stale records to DELETE (class 7 / A1, all ABSENT_UNCERTIFIED, created 2026-07-03):
  Att 4886, 2026-07-06, occ 1825, ABSENT_UNCERTIFIED, 0h
  Att 4887, 2026-07-07, occ 1826, ABSENT_UNCERTIFIED, 0h
  Att 4888, 2026-07-08, occ 1827, ABSENT_UNCERTIFIED, 0h
  Att 4889, 2026-07-09, occ 1828, ABSENT_UNCERTIFIED, 0h
  Att 4890, 2026-07-10, occ 1829, ABSENT_UNCERTIFIED, 0h

Correct records to KEEP (class 8 / A2 AM, all PRESENT, created 2026-07-13):
  Att 5956, 2026-07-06, occ 1959, PRESENT, 3h
  Att 5957, 2026-07-07, occ 1960, PRESENT, 3h
  Att 5958, 2026-07-08, occ 1961, PRESENT, 3h
  Att 5959, 2026-07-09, occ 1962, PRESENT, 3h
  Att 5960, 2026-07-10, occ 1963, PRESENT, 3h

Attendance impact:
  Current:    55 records, 47 PRESENT / 8 ABSENT_UNCERTIFIED = 85.5%
  After fix:  50 records, 47 PRESENT / 3 ABSENT_UNCERTIFIED = 94%

Note: stale records show updated_at = 2026-07-10 (attendance lock ran that day, left them absent).

## Fix Recipe (NOT YET RUN)

Step 1 — Verify stale records:
  SELECT id, student_id, occurrence_id, status, hours, created_at, updated_at
  FROM attendance WHERE id IN (4886, 4887, 4888, 4889, 4890);
  -- Expected: 5 rows, ABSENT_UNCERTIFIED, student_id=830, Jul 6-10

Step 2 — Verify class 8 records intact:
  SELECT id, student_id, occurrence_id, status, hours
  FROM attendance WHERE id IN (5956, 5957, 5958, 5959, 5960);
  -- Expected: 5 rows, PRESENT, hours=3, student_id=830

Step 3 — Delete the 5 stale class 7 records:
  DELETE FROM attendance WHERE id IN (4886, 4887, 4888, 4889, 4890);
  -- Expected: DELETE 5

Step 4 — Confirm:
  SELECT COUNT(*) FROM attendance WHERE student_id = 830;
  -- Expected: 50
  SELECT status, COUNT(*) FROM attendance WHERE student_id = 830 GROUP BY status;
  -- Expected: PRESENT=47, ABSENT_UNCERTIFIED=3
  SELECT a.id, a.status, a.hours, o.date, o.class_id
  FROM attendance a JOIN class_occurrences o ON o.id = a.occurrence_id
  WHERE a.student_id=830 AND o.date BETWEEN '2026-07-06' AND '2026-07-10'
  ORDER BY o.date;
  -- Expected: 5 rows, all PRESENT, class_id=8

## Risk
Category: attendance / data-hygiene. Money: no. Reversible: yes (rows were ABSENT_UNCERTIFIED hours=0; class 8 records untouched). Blast radius: minimal (5 rows, 1 student, 1 week).

## Underlying Pattern
When an SCA changes, attendance the student had in the OLD class (register rows the
weekly lock left ABSENT_UNCERTIFIED, or any rows on/after the move) was not cleaned up.
Related to Issues 22 and 26.

## ROOT-CAUSE FIX APPLIED 2026-07-15 (code)
Added `pruneOrphanAttendance(db, studentId, classId, from, to?)` in `src/scripts/classes.ts`
and wired it into all three SCA-change paths so this stops recurring:
- **moveStudent** — in-txn, deletes OLD-class attendance from the cutover forward.
- **endAssignment** — deletes that class's attendance from the clip week (weekStart) forward.
- **removeAssignment** — deletes that class's attendance across the removed window.
Guarded (mirrors bookings.ts teardown): skips if any remaining SCA for the same
student+class still covers the window, so a parallel booking is never touched.
Verified read-only against student 830: active class 8 → protected (SCA#296); pre-cutover
class 7 → protected (SCA#153); old class 7 from cutover → prune allowed. No pre-generation
of ABSENT rows exists in code (attendance is only written by the teacher register /
markAttendance); the leak was purely the missing cleanup on reassignment.

Status: RESOLVED 2026-07-15 — deleted att 4886–4890 (guarded delete, all confirmed ABSENT_UNCERTIFIED / student 830 / 0h / class 7 before removal). Student 830 now 50 records, 47 PRESENT / 3 ABSENT_UNCERTIFIED = 94.0%; week Jul 6–10 all PRESENT in class 8. Class-8 rows (5956–5960) untouched. Sheet K49 = fixed. Last checked: 2026-07-15 UTC