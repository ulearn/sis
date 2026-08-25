Issue 15 - Saikhantes Shagdarsuren - Class Assignment - Addendum 23 Jul 2026 (B)

Sheet row: 16 | Check: Thu 23 Jul 2026 UTC

Status: Holiday in progress; 2 weeks permanently missed; assign on return Mon 24 Aug

Evidence (fresh DB, 23 Jul 2026 UTC):
- Student 1001 (Saikhantes Shagdarsuren): booking 18151
- SCA 255 (class 11 B1 PM, BC 24925): weekEnd = 3 Jul 2026 - expired 20 days ago
- BC 24925 (Academic Year Afternoon, 9 Mar - 2 Oct 2026): active = true, bookingId = 18151
- Holiday 2500 (booking 18151): 20 Jul - 21 Aug 2026, 5 weeks, 25 weekdays pushed
  Student returns Mon 24 Aug 2026
- Permanently missed: weeks 6-10 Jul and 13-17 Jul 2026 - irrecoverable (20 school days)
- Holiday period (20 Jul - 21 Aug): no school days missed in this window

Fix Recipe (NOT YET RUN):

Create new SCA on BC 24925 for class 11 (B1 PM) from 24 Aug:
  INSERT INTO "StudentClassAssignment"
    ("bookingCourseId", "studentId", "classId", "weekStart", "weekEnd", "createdAt")
  VALUES (24925, 1001, 11, '2026-08-24', '2026-10-02', NOW());

Or via SIS admin UI: Booking 18151 -> Class Assignment -> class 11 (B1 PM) from 24 Aug.

Note: 2 missed weeks (6-10 Jul, 13-17 Jul) are irrecoverable - note for student record only.

Risk: Low. New SCA only, no deletions. Reversible.

Last checked: Thu 23 Jul 2026 UTC