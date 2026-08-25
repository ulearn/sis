Issue 15 - Saikhantes Shagdarsuren service_end + SCA expired - 109th check Thu 13 Aug 2026 UTC

ROOT CAUSE:
- Booking 18151 service_end=2026-08-07 (expired 6d); correct=2026-10-02
- SCA 255 weekEnd=2026-07-03 (expired 41d); correct=2026-10-02
- BC 24925 (Academic Year Afternoon, ends Oct 2): active=true, endDate=2026-10-02
- Booking fully paid EUR 1339.20; last updated Jul 8 (36d ago)

FIX RECIPE (NOT YET RUN):
1. UPDATE booking SET service_end=2026-10-02, updated_at=NOW() WHERE id=18151;
2. UPDATE student_class_assignment SET week_end=2026-10-02, updated_at=NOW() WHERE id=255;
3. Verify: SELECT service_end FROM booking WHERE id=18151; Expected: 2026-10-02
   SELECT week_end FROM student_class_assignment WHERE id=255; Expected: 2026-10-02

RISK: bookings/data-hygiene | Reversible: yes | Blast: 1 student; backfill Jul 3-Aug 13 may be needed
STATUS: OPEN. 109th check. Unchanged. Fix NOT RUN.