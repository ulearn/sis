Issue 15 - Saikhantes Shagdasuren (26th check Mon 3 Aug 2026 UTC, 5th today)
Reporter: PG | Area: Booking / Class | Sheet row: 16


ROOT CAUSE (fresh 3 Aug 2026 UTC, all unchanged):
- Holiday 2500: Jul 20-Aug 21 2026, booking 18151 - student on holiday (confirmed)
- BC 24925 (Academic Year Afternoon, Mar 9-Oct 2 2026): active=true, 0 new class assignments since Jul 3 (31 days without assignment)
- SCA 255: class 11, weekStart 2026-01-12, weekEnd 2026-07-03 - expired, no replacement created
- BC 1982 (Academic Year Morning, Jun 30-Dec 19 2025): active=true - 228 days stale
- Returns Mon 24 Aug 2026 (21 days from today Aug 3)


FIX RECIPE (NOT YET RUN):
1. Deactivate stale BC 1982:
   UPDATE booking_courses SET active = false WHERE id = 1982;
2. Create class assignment on BC 24925 on/before Mon 24 Aug (class 11):
   INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end)
   SELECT 24925, s.id, 11, '2026-08-24', '2026-10-02'
   FROM bookings b JOIN students s ON s.id = b.student_id WHERE b.id = 18151;


RISK: bookings/class | Reversible: yes | Blast: 1 student (Saikhantes Shagdasuren)
STATUS: 26th check Mon 3 Aug 2026 UTC (5th today). Returns Mon 24 Aug (21 days). NOT YET RUN.