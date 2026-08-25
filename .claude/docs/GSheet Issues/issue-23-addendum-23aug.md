Issue 23 Addendum 23 Aug 2026 (19th check)
Enshi Lu | Student 397 | Booking / Class / Holiday | Sheet row 24

Symptom: Course dates do not make sense - start March, finish February (end before start).

Root cause (unchanged from 20 Aug):
- Student 397, booking 787: CONFIRMED, fully paid EUR 2,147.50
- BC 826 Academic Year Morning: ended 2025-11-28, 268 days stale, active=true, 0 SCAs
- BC 827 Academic Year Morning: ended 2026-01-30, 205 days stale, active=true, 0 SCAs
- BC 828 Academic Year Morning: start 2026-03-02, end 2026-02-27 - BACKWARDS, active=true, 0 SCAs
- BC 829 Academic Year Morning: ended 2026-06-05, 79 days stale, active=true, 1 SCA (class 8 weekEnd 2026-05-31)

Fix recipe (NOT YET RUN):
1. Fix BC 828 backwards end date: UPDATE booking_courses SET end_date = 20260605 WHERE id = 828;
2. Deactivate BC 826 (0 SCAs): UPDATE booking_courses SET active = false WHERE id = 826;
3. Deactivate BC 827 (0 SCAs): UPDATE booking_courses SET active = false WHERE id = 827;
4. Verify BC 829 SCA historical then deactivate: UPDATE booking_courses SET active = false WHERE id = 829;

Risk: bookings/data-hygiene | reversible | low-medium (verify BC 828 end date first)
Status: Fix NOT RUN. 19th check. Last checked: 2026-08-23 UTC.