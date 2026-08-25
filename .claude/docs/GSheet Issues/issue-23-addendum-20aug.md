Issue 23 Addendum 20 Aug 2026 (17th check)
Enshi Lu | Booking / Class / Holiday | Sheet row 24

No change from 18 Aug (skipped Wed 19 Aug).

Root cause:
- Student 397 Enshi Lu booking 787
- Booking Course 828 Academic Year Morning startDate=2026-03-02 endDate=2026-02-27 - BACKWARDS (end before start) active=true 0 SCAs
- Booking Course 826 Academic Year Morning ended 2025-11-28 - 265 days stale active=true 0 SCAs
- Booking Course 827 Academic Year Morning ended 2026-01-30 - 202 days stale active=true 0 SCAs
- Booking Course 829 Academic Year Morning ended 2026-06-05 - 76 days stale active=true 1 historical SCA (class 8 weekEnd 2026-05-31)

Fix recipe (NOT YET RUN):
1. Fix backwards end date on BC 828 (verify against booking 787 - likely correct end is 2026-06-05):
   UPDATE booking_courses SET end_date = '2026-06-05' WHERE id = 828;
2. Deactivate BC 826 (0 SCAs): UPDATE booking_courses SET active = false WHERE id = 826;
3. Deactivate BC 827 (0 SCAs): UPDATE booking_courses SET active = false WHERE id = 827;
4. Verify SCA on BC 829 is historical (class 8 weekEnd 2026-05-31), then deactivate:
   UPDATE booking_courses SET active = false WHERE id = 829;

Risk: low-medium (verify BC 828 end date). Low for deactivations. Reversible.
Status: Low priority. Backwards dates unchanged. Fix pending Neil approval.
Last checked: 2026-08-20 UTC (17th check)