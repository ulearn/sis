Issue 8 -- Stale BCs Diego/Pedro/Aurora/Cibele (36th check)

Reporter: AC | Area: Doc Gen/Certs | Sheet row: 9 | Last checked: 2026-08-22 UTC

SYMPTOM: Booking Courses remain active past end date, blocking ILEP certificate generation.

ROOT CAUSE (36th check -- 4 new BCs identified, total now 11 vs 7 previously):

Diego Alves da Silva Molina (student 840):
- BC 1482: ended 2025-12-19 -- 246d stale, ILEP 0318/0003, 0 SCAs
- BC 1483: ended 2026-02-13 -- 190d stale, ILEP 0318/0003, 0 SCAs
- BC 1484: ended 2026-06-05 -- 78d stale, ILEP 0318/0021, 1 SCA (verify)

Aurora Madril Oliveira Molina (student 841):
- BC 1485: ended 2025-12-19 -- 246d stale, ILEP 0318/0003, 0 SCAs
- BC 1486: ended 2026-02-13 -- 190d stale, ILEP 0318/0003, 0 SCAs
- BC 1487: ended 2026-06-05 -- 78d stale, ILEP 0318/0003, 2 SCAs (verify)

Cibele dos Santos Eugenio (student 842):
- BC 1488: ended 2025-09-19 -- 337d stale, no ILEP, 0 SCAs
- BC 1489: ended 2025-12-19 -- 246d stale, no ILEP, 0 SCAs [NEW - not in prior reports]
- BC 1490: ended 2026-02-13 -- 190d stale, no ILEP, 0 SCAs [NEW - not in prior reports]

Pedro De Pauli Pastre (student 911):
- BC 1602: ended 2025-12-19 -- 246d stale, ILEP 0318/0011, 0 SCAs [NEW]
- BC 1603: ended 2026-06-05 -- 78d stale, ILEP 0318/0012, 2 SCAs (verify) [NEW]

FIX RECIPE (NOT YET RUN):

Step 1 - Deactivate 8 BCs with 0 SCAs (safe):
  UPDATE "BookingCourse" SET active = false WHERE id IN (1482,1483,1485,1486,1488,1489,1490,1602);

Step 2 - Verify SCAs on BCs 1484, 1487, 1603 before deactivating:
  SELECT id, booking_course_id, week_start, week_end FROM "StudentClassAssignment"
  WHERE booking_course_id IN (1484,1487,1603) ORDER BY booking_course_id, week_start;
  If all SCAs have week_end before BC end date (historical only):
  UPDATE "BookingCourse" SET active = false WHERE id IN (1484,1487,1603);

Step 3 - Regenerate ILEP certificates for Diego, Aurora, Pedro after BCs deactivated.

RISK: Data hygiene. Reversible. Medium risk on 1484/1487/1603 (have SCAs). No financial impact.

STATUS: 337 days max stale. 11 total stale BCs (was 7). Fix pending Neil approval.
Last checked: 2026-08-22 UTC (36th check)