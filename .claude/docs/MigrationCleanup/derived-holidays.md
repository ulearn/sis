# Derived Holidays — recovered from Fidelo "gap-course" splits

**Date:** 2026-06-04 · **Status:** REPORT ONLY (no DB changes) · Raised by Neil

## The idea
Fidelo never stored holidays as a discrete entity. It encoded a holiday by **splitting the
course into two segments with a date gap** between them. The 14-May `reconcile-fidelo-courses.ts`
backfill imported each segment as a separate `BookingCourse`, so a student who took a holiday now
shows **2+ courses in one booking with a gap**. We can therefore *derive* the holidays that were
otherwise invisible.

## Method
Scan **current** bookings only (`serviceEnd >= today` — historical deliberately skipped), filter to
**Academic Year / LifePass**, keep those with **≥2 courses**, and classify each consecutive-segment
gap. Three confounds must be stripped before a gap counts as a personal holiday:

| Gap shape | Meaning | Counts as personal holiday? |
|---|---|---|
| **OVERLAP** (seg-2 starts before seg-1 ends) | reconcile duplicate (e.g. Fangjia #24674) | No |
| **MOVE** (different session MORNING↔AFTERNOON) | class move | No |
| **XMAS** (ends ~Dec 15-23 → resumes ~Jan 2-9) | school-wide Christmas closure | No |
| **REENROL** (gap > 77 days / 11 wk) | two separate enrolment years in one booking | No |
| **HOLIDAY** (same session, in-term gap ≤ 11 wk) | **a real personal holiday** | **Yes** |

Raw pool: **50** current AY/LifePass bookings with ≥2 courses. After stripping Christmas (~30) and
year-gaps (~6): **18 students with genuine in-term holidays, ~41.2 weeks total.**

## The 18 (derived personal holidays)

| Student | # | bk# | Nat | Holiday(s) (seg→seg) | Weeks |
|---|---|---|---|---|---|
| Felix Edgardo Lopez Rivera | 14 | 17 | El Salvador | 2026-02-27 → 03-09 | 1.2 |
| Yeongjae Jang | 959 | 1510 | South Korea | 2026-02-27 → 03-23 | 3.2 |
| Aurora Madril Oliveira Molina | 841 | 1387 | — | 2026-02-13 → 02-23 | 1.2 |
| Diego Alves da Silva Molina | 840 | 1386 | BR | 2026-02-13 → 02-23 | 1.2 |
| Sodnom Bat-Erdene | 946 | 1497 | Mongolia | 2026-03-27 → 04-20 | 3.2 |
| Tsengelbayar Mendsaikhan | 948 | 1499 | — | 03-27→04-06 + 04-24→05-11 | 3.4 |
| Ignacio Giovanelli Barrio | 968 | 1519 | **Italy (EU ⚠)** | 2026-02-20 → 03-02 | 1.2 |
| Enkhmaa Bayasgalan | 943 | 1494 | Mongolia | 2026-03-20 → 03-30 | 1.2 |
| Regzeddagva Boldbaatar | 944 | 1495 | Mongolia | 2026-03-20 → 03-30 | 1.2 |
| Maria Eduarda Alves Paiva | 1028 | 1581 | Brazil | 2026-07-17 → 08-03 | 2.2 |
| Thiago Meirelles de Macedo | 993 | 1544 | Brazil | 2026-03-27 → 04-06 | 1.2 |
| Ariuntsetseg Gansukh | 981 | 1532 | Mongolia | 2026-03-20 → 03-30 | 1.2 |
| Rafael Ferreira Gomes | 1005 | 1557 | Brazil | 2026-03-13 → 03-23 | 1.2 |
| Amanda Soares Pereira | 803 | 1347 | Brazil | 2025-07-11 → 07-21 | 1.2 |
| Henrique Rodrigues dos Santos | 824 | 1368 | Brazil | 2025-11-28 → 12-08 | 1.2 |
| Ana Luiza De Sousa | 744 | 1286 | Brazil | 2025-07-11 → 07-21 | 1.2 |
| Undralbat Ganbaatar | 953 | 1504 | Mongolia | 2026-02-27 → 03-09 | 1.2 |
| **Enshi Lu** | 397 | 787 | China | **CORRUPT — see flags** | (13.6) |

## Data flags — do NOT auto-record these
1. **Enshi Lu #397** — course #828 runs `[2026-03-02 → 2026-02-27]` (ends *before* it starts).
   His gaps overlap and the 13.6 wk is meaningless. Corrupt Fidelo segment → manual review only.
2. **Ignacio #968 is Italian (EU)** — per the holiday rule (non-EU AY/LifePass only) EU students
   can't take holidays, yet Fidelo logged a 1-wk gap. School-closure artifact or Fidelo exception
   → flag, don't record.

## Notes
- Several here (Aurora, Ignacio, Enkhmaa, Regzeddagva, Undralbat) were touched in the earlier
  `holiday-split-courses.md` cleanup — but that pass only removed **exact duplicate/overlap**
  segments. These **legitimate gap-splits** were deliberately left, so the holiday data still lives
  implicitly in the gaps. This report recovers it.
- The course **end date already reflects the holiday shunt** (last segment's end is pushed out),
  so the SIS model is satisfied in effect — the only thing missing is a discrete holiday *record*.
- If we ever escalate beyond report-only: (B) insert `BookingHoliday` rows per gap as annotation
  (reversible, no structural change), or (C) collapse segments to one course (repoints class
  assignments — same hazard as the split-course cleanup). Both deferred; Paul/Antonella to eyeball
  this list first.

Relates to `holiday-split-courses.md`, `project_holiday_spec` (memory), and the Fangjia correction.
