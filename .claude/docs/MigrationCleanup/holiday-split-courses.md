# Holiday-split redundant courses — 14-May reconcile batch (2026-06-04)

`reconcile-fidelo-courses.ts` (run 14 May) imported Fidelo holiday-split segments as separate SIS courses. Each overlaps the real continuous course. Andrea #918 + Ignacio #968 already fixed. Remaining:

## READY — holiday already recorded, just delete segment + align serviceEnd (like Ignacio): 1

| course | bk | student | redundant segment | overlaps main | aligned holiday |
|---|---|---|---|---|---|
| #24669 | #32 | Kseniia Avramchenko | 2027-01-04→2027-01-08 | #34[2027-01-04→2027-03-05] | 2026-12-21→2027-01-03 |

## NEED HOLIDAY DATES from Kelly — no recorded holiday explains the segment (like Andrea): 11

Deleting blind would lose the course's correct post-holiday end date. Need the student's holiday dates (from Kelly's emails / Fidelo) to add the holiday + push the course, then delete the segment.

| course | bk | student | redundant segment | overlaps main | recorded holidays |
|---|---|---|---|---|---|
| #24674 | #1396 | Fangjia Liang | 2026-05-04→2026-07-31 | #1502[2026-01-05→2026-06-26] | NONE |
| #24677 | #1494 | Enkhmaa Bayasgalan | 2026-04-27→2026-05-01 | #1650[2026-03-30→2026-06-26] | 2025-12-22→2026-01-04 2026-03-23→2026-03-29 |
| #24678 | #1494 | Enkhmaa Bayasgalan | 2026-05-11→2026-07-10 | #1650[2026-03-30→2026-06-26] | 2025-12-22→2026-01-04 2026-03-23→2026-03-29 |
| #24679 | #1495 | Regzeddagva Boldbaatar | 2026-04-27→2026-05-01 | #1653[2026-03-30→2026-06-26] | 2025-12-22→2026-01-04 2026-03-23→2026-03-29 |
| #24680 | #1495 | Regzeddagva Boldbaatar | 2026-05-11→2026-07-10 | #1653[2026-03-30→2026-06-26] | 2025-12-22→2026-01-04 2026-03-23→2026-03-29 |
| #24681 | #1500 | Ulises Lautaro | 2026-04-20→2026-06-19 | #1666[2026-01-05→2026-06-12] | 2025-12-22→2026-01-04 |
| #24682 | #1504 | Undralbat Ganbaatar | 2026-05-04→2026-08-07 | #1672[2026-03-09→2026-07-24] | 2026-03-02→2026-03-08 |
| #24684 | #1529 | Gabriel Mastelaro | 2026-05-11→2026-09-11 | #1704[2026-03-16→2026-09-04] | NONE |
| #24685 | #1533 | Alicia Monteiro De Souza | 2026-05-11→2026-09-04 | #1709[2026-03-09→2026-08-28] | NONE |
| #24687 | #1644 | Wellington Abreu D Luca | 2026-05-11→2026-09-11 | #1832[2026-03-16→2026-09-04] | NONE |
| #24673 | #1387 | Aurora Madril Oliveira Molina | 2026-05-11→2026-06-05 | #1487[2026-02-23→2026-06-05] | 2025-12-22→2026-01-04 2026-02-16→2026-02-22 |

## LEAVE — distinct course or has roster: 5

| course | bk | student | segment | reason |
|---|---|---|---|---|
| #24671 | #100 | Hugo Tavernier | 2026-05-04→2026-05-29 | distinct course (not a dup) — leave |
| #24672 | #1276 | Johana Fournier | 2026-05-04→2026-05-29 | distinct course (not a dup) — leave |
| #24686 | #1611 | Alberto Squillace | 2026-07-20→2026-09-18 | distinct course (not a dup) — leave |
| #24670 | #93 | Abdulaziz AlRuwayti | 2026-03-23→2026-07-09 | HAS class roster — manual |
| #24675 | #1401 | Adriana Zamora Arceo | 2026-04-27→2026-05-01 | distinct course (not a dup) — leave |

---
## STATUS (2026-06-04) — DONE bar Fangjia

All redundant segments cleaned + holidays recorded (Antonella supplied the dates):
- **Andrea, Ignacio, Kseniia, Aurora** — done earlier.
- **Gabriel, Alicia, Wellington** (04/05–10/05) → course ends 10/03/10 Sep resp.
- **Enkhmaa, Regzeddagva** (20/04–27/04 + 04/05–08/05) → 09 Jul.
- **Ulises** (13/04–19/04) → 18 Jun.
- **Undralbat** (20/04–03/05) → 06 Aug.
- **Fangjia** — NOT a holiday: a morning→afternoon **session move** + absences. Left for Paul to confirm.

**Root cause confirmed:** the SIS holiday feature does NOT create courses — it shunts the end date. The redundant courses were the **14-May `reconcile-fidelo-courses.ts` backfill** importing Fidelo's own split segments (real `fideloCourseId`s, createdAt 14-May). Fidelo splits a course on BOTH holidays AND session moves; the import pulled those in. Verified: Aurora/Fangjia "new courses" created 06-Apr (migration) + 14-May (reconcile), nothing in the last 48h.

**Holiday entitlement guards added to `addHoliday`** (see memory `project_holiday_spec`): 35-week ceiling = hard block; eligibility (non-EU AY/LifePass) + 10-week cap = soft warn with override. End dates land ~1 day before Fidelo's (SIS weekday-count vs Fidelo) — immaterial, SIS-internally consistent.
