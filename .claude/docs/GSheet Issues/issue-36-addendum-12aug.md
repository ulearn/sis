# Issue 36 — Attendance Sheet Bugs (Code check 37, Wed 12 Aug 2026)

**Reporter:** Staff  **Area:** Attendance sheets  **Sheet row:** 37

## Symptom
Bug A: Attendance sheets missing homework section (confirmed by Paul).
Bug B: Holiday/bank holiday filter not applied when generating week occurrences.

## Root cause (evidence from 12 Aug 2026 code check)

### Bug A — Homework block missing
- renderSheetHtml() in src/routes/attendance.ts lines 36-128 generates the attendance sheet HTML
- Output: header, meta table, student grid (name + IN/OUT x 5 days), head count row
- No homework section in the output — function ends at line 128 with closing </section>
- Awaiting spec from Paul/Neil on exact format

### Bug B — Holiday filter missing from week occurrence generation
- getWeekAttendance() in src/scripts/attendance.ts lines 102-106 calls ensureOccurrence() for all 5 days unconditionally
- filterOutHolidayDates() defined in src/scripts/attendance-pct.ts, only used in attendance-pct context (line 351+)
- Result: bank holidays and school closures get occurrences created even when school is closed
- No spec needed — school_closures table already exists

## Fix recipe (NOT YET RUN)

### Bug B — Apply holiday filter in getWeekAttendance() (implementable now)
File: src/scripts/attendance.ts around line 102

Replace the unconditional 5-day loop with a check against school_closures:
```typescript
const closures = await prisma.schoolClosure.findMany({
  where: { date: { in: days } },
  select: { date: true },
});
const closedDates = new Set(closures.map(c => c.date));
const occurrences: any[] = [];
for (const d of days) {
  if (!closedDates.has(d)) {
    occurrences.push(await ensureOccurrence(classId, d));
  }
}
```
Verify model name (schoolClosure?) and date field format before applying.

### Bug A — Homework block (awaiting spec)
Once format is confirmed, add homework section to renderSheetHtml() in src/routes/attendance.ts
after line 127 (end of student grid, before closing </section>).

## Risk / category
- Code — Bug B: low risk, additive change only. Existing occurrences unaffected.
- Bug A: low risk, additive HTML change. No DB writes.
- Blast radius: attendance sheet rendering only.

## Status
Both bugs open. Bug B implementable now. Bug A awaiting spec.

**Last checked:** 2026-08-12 UTC