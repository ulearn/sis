# Fidelo Attendance — Historical Backfill Instructions / Notes

**Date:** 2026-06-11
**Status:** the FULL 52-week historical backfill is **deferred / not being done right now** (deliberately). What's described here is the method for when/if we ever do it.

## What we've actually done (the part that matters now)
Backfilled the **legacy attendance % for students still in school** (booking spans today) who started **before the 04/05/2026 migration**. Source = the weekly Fidelo "FIDELO ATTENDANCE DOWNLOADS" sheets, column **`X` = "Total time frame"** (the cumulative whole-booking attendance %; confirmed by week-over-week comparison — `V` is the single week, `X`/`AA` is the running total, and "Expected attendance (absolute)" is Paul's projection idea → **ignored**). Anyone who started **on/after 04/05/2026 has no historical backfill to make by definition** — the SIS has tracked them since day one.

## The TRUE 52-week historical backfill — and why I'm NOT interested in it right now

The true historical backfill would be **52 of these weekly sheets** (a full year). The **only** reason you'd ever process all 52 is to capture the attendance of **people whose bookings *ended* that week**.

> Example: a student whose booking ended the week of 30 March (i.e. finished that Friday, ~the 4th) — the `20260330.xlsx` sheet is the useful one for them, because that's where you read their **final total attendance** as of when they finished that week.

**Why I'm not doing it now:** those students are **already gone.** And if one of them ever **comes back** (or requests a document), we don't need a bulk job — we simply:
1. look at their **booking end date**,
2. fish out the one Excel sheet for the week they finished,
3. read their **Total time frame %**,
4. and put it on their certificate / letter of cessation.

That's a trivial one-off lookup, on demand.

## How to do it properly later (if we ever want the whole year filled in)
If I really wanted to do it properly:
- Upload the **remaining ~48 sheets** (the full 52 weeks) into this folder (`sis/.claude/docs/attendance/fidelo-history/`).
- Then do a **week-by-week cross-check, working backwards** through the 52 weeks: for each weekly sheet, find **any bookings that ended that week**, and fill in that student's **total % attendance** (column `X`) onto their (now-completed) booking.
- Going back through the year that way, every completed booking gets its final attendance figure recorded.

**Not doing this now — we have enough problems.** Parking it here so the method isn't lost.

## Files
- Weekly sheets live here as `YYYYMMDD.xlsx` (date = that week).
- `_swept-attendance.csv` — the matched current-student figures (the backward sweep result).
- `students-in-school-attendance.csv` — the live "students currently in school" reconciliation (assigned/unassigned flag, backfill state, %, source sheet).
