Issue 22 - Edith Nunes - 0 SCAs, BC 24991 Ends 7 Aug - Addendum 27 Jul 2026 (g)

Reporter: PG | Area: Booking/Class | Sheet row: 23 | Last checked: 2026-07-27 UTC

Root Cause (fresh DB 2026-07-27)

Student 1015 (Edith Nunes): 4 bookings (1567, 17894, 18158, 18214), all CONFIRMED fully paid. BC 24991 (General English AM, bk 18214, 13 Jul-7 Aug 2026): active=true, EUR 608, 0 SCAs. Last SCA: SCA 146 for BC 24668 (week 20 Apr-15 May 2026) - 10+ weeks unassigned. Duplicate BCs: BC 24933 + BC 24934 both cover 15 Jun-10 Jul on booking 18158. BC 24991 ends 7 Aug 2026 - 11 days remain.

Fix Recipe (NOT YET RUN)

Step 1 - Assign BC 24991:
  SIS Admin -> Classes -> General English AM -> assign student 1015 / BC 24991
  week_start=2026-07-28, week_end=2026-08-07 (note Aug 4 depends on Issue 38 fix)
  Verify: SELECT * FROM student_class_assignments WHERE booking_course_id=24991;

Step 2 - Investigate dup BCs 24933+24934 on booking 18158:
  SELECT id, name, start_date, end_date, fee, active FROM booking_courses WHERE booking_id=18158;
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=24934;

Risk: bookings/class. Reversible: yes. Dup BC may affect invoices.

Status: CRITICAL - 11 days left, 10+ weeks unassigned. Fix NOT RUN. Last checked: 2026-07-27 UTC
