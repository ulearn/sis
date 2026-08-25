Issue 8 - ILEP Certs / Stale BCs - Addendum 23 Jul 2026

Sheet row: 9 | Check: 7th (Thu 23 Jul 2026 UTC)

Status: Certificate issue RESOLVED Jun 2026. Stale BCs: UNCHANGED.

Evidence (fresh DB, 23 Jul 2026 UTC):
BC 1482 | booking 1386 (Diego) | Acad Year Afternoon | ended 19 Dec 2025 | 216 days stale
BC 1483 | booking 1386 (Diego) | Acad Year Afternoon | ended 13 Feb 2026 | 160 days stale
BC 1484 | booking 1386 (Diego) | Acad Year Afternoon | ended 5 Jun 2026  | 48 days stale
BC 1485 | booking 1387 (Aurora) | Acad Year Afternoon | ended 19 Dec 2025 | 216 days stale
BC 1486 | booking 1387 (Aurora) | Acad Year Afternoon | ended 13 Feb 2026 | 160 days stale
BC 1487 | booking 1387 (Aurora) | Acad Year Afternoon | ended 5 Jun 2026  | 48 days stale
BC 1602 | booking 1460 (Pedro) | Acad Year Morning   | ended 19 Dec 2025 | 216 days stale
BC 1603 | booking 1460 (Pedro) | Acad Year Morning   | ended 5 Jun 2026  | 48 days stale

Fix Recipe (NOT YET RUN):
UPDATE "BookingCourse" SET active = false
WHERE id IN (1482,1483,1484,1485,1486,1487,1602,1603) AND "endDate" < NOW();

Risk: Low. Cosmetic data hygiene. Reversible.

Last checked: Thu 23 Jul 2026 UTC