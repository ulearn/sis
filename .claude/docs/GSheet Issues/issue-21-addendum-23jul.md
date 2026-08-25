Issue 21 - Maurivan Kuhl - Stale Booking Course - Addendum 23 Jul 2026

Sheet row: 22 | Check: 3rd (Thu 23 Jul 2026 UTC)

Status: UNCHANGED - BC 1604 stale 20 days

Evidence (fresh DB, 23 Jul 2026 UTC):
- Original issue (A1 AM + A2 AM double appearance): RESOLVED Jun 2026
- BC 1604 (Morning General, 5 Jan - 3 Jul 2026): active = true - 20 days stale
- SCA 156 (class 8, A2 AM): weekEnd = 2 Jul 2026 - expired 21 days ago (historical)
- Booking 1461: Confirmed, EUR 1509.60 / 1509.60 fully paid - student term complete

Fix Recipe (NOT YET RUN):

  UPDATE "BookingCourse" SET active = false
  WHERE id = 1604 AND "endDate" < NOW();

SCA 156 is expired but harmless - no deletion needed.

Risk: Low. Cosmetic. Reversible.

Last checked: Thu 23 Jul 2026 UTC