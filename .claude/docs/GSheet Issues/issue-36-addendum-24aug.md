# Issue 36 — Attendance Sheet: Homework Section Missing (Addendum 24 Aug 2026)

**Reporter:** AC | **Area:** Attendance sheets | **Sheet row:** 37 | **Run:** 496th (Mon 24 Aug 2026 UTC)

## Symptom
Attendance sheets from SIS have no homework section. Paul confirmed it should be included.
(G column text was updated on the sheet since 23 Aug — code diagnosis unchanged.)

## Root Cause — Current State

File: src/routes/attendance.ts

Bug A: renderSheetHtml() (lines 36–130) has no homework block anywhere.
  The function renders: header, meta table (week/class/teacher), attendance grid (IN/OUT per day), headcount row.
  No homework section — missing feature, not regression.

Bug B: getWeekAttendance() has no school_closures check.
  Sheets may show lesson slots on bank holidays / Christmas.

Both bugs need spec from Paul/Neil before implementation.

## Fix Recipe (NOT YET RUN — awaiting spec)

Step 1 — Get spec:
  - Homework layout: rows, columns, placement (below grid? separate box?)
  - Closure day behaviour: blank columns or omit?

Step 2 — Add homework block after closing </table> of .grid (~line 127):
  (Structure TBD per spec — e.g. a row per day with a homework notes column)

Step 3 — Add closure filter to getWeekAttendance():
  Query school_closures for weekStart..weekEnd; suppress those date columns.

## Risk / Category
code / documents | reversible | affects all attendance sheets

## Status
Open — awaiting spec. Last checked: 24 Aug 2026 UTC (496th run).