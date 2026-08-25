# Issue 36 -- Attendance Sheet Homework Section | Row 37 | 421st run

Reporter: staff (Paul confirmed) | Area: Attendance sheets (code) | Sheet row: 37

## Symptom
Attendance sheets from SIS do not include a homework section. Paul confirmed it should.

## Root Cause (Thu 20 Aug 2026, 421st run / code check 45)

Bug A -- Homework block absent from renderSheetHtml():
  File: src/routes/attendance.ts, function renderSheetHtml() (lines 36-120+).
  Generated sheet: header, meta table, attendance grid (IN/OUT Mon-Fri), head-count row.
  No homework section exists. No homework keyword in file.
  Status: awaiting spec from Paul/Neil (format TBD).

Bug B -- Holiday filter applied after-the-fact:
  getWeekAttendance() generates occurrences for all 5 weekdays without closure check.
  filterOutHolidayDates() post-processes rather than prevents generation.
  Lower priority than Bug A.

Both bugs unchanged since check 44 (Wed 19 Aug).

## Fix Recipe -- NOT YET RUN

Bug A -- Add homework block after attendance grid in renderSheetHtml():
  Awaiting spec. Once confirmed, add after closing grid table:
  NOT YET RUN (format TBD):
    <section class=homework><h3>Homework</h3><!-- format TBD --></section>

Bug B -- Move closure check into getWeekAttendance():
  Filter out school_closures dates before generating weekday rows.
  NOT YET RUN.

## Risk
Code only -- HTML template change, no DB impact. Reversible.

## Status
OPEN -- Code check 45 Thu 20 Aug. Both bugs confirmed. Awaiting spec for Bug A.
Last checked: 2026-08-20 UTC (421st run)