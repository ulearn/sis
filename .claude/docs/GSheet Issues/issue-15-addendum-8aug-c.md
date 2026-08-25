Issue 15 -- Saikhantes Shagdarsuren: service_end expired + BC 1982 stale (68th check, 8 Aug 2026)

Reporter: PG | Sheet row: 16 | Check: 68th hourly -- Sat 8 Aug 2026 UTC

Symptom: Booking 18151 service_end = 2026-08-07 expired (1 day ago). Student portal locked.
Holiday ends 21 Aug 2026; student returns Mon 24 Aug. Second booking (1724) has BC 1982 stale 231 days.

Root Cause (verified live, 8 Aug 2026):

1. service_end not extended for holiday (booking 18151)
- Booking 18151 (student 1001, Saikhantes Shagdarsuren): CONFIRMED, confirmed=true, EUR 1,339.20 fully paid
- service_end = 2026-08-07 -- portal access blocked since midnight 7 Aug (1 day locked)
- Holiday 2500: 20 Jul to 21 Aug 2026 -- student returns Mon 24 Aug
- BC 24925 (Academic Year Afternoon, 9 Mar to 2 Oct 2026): active=true, runs past holiday
- Root cause: when holiday 2500 was created, bookings.service_end was NOT auto-extended to match course end.
  It remains at 2026-08-07, pre-dating both holiday end (21 Aug) and course end (2 Oct 2026).

2. BC 1982 stale 231 days (booking 1724)
- Booking 1724 (student 1001): CONFIRMED, service_end=2025-12-19, EUR 2,171.87 paid
- BC 1982 (Academic Year Morning, 30 Jun 2025 to 19 Dec 2025): active=true -- 231 days stale
- Legacy AY 2024-25 booking; never deactivated when student renewed for AY 2025-26

Fix Recipe (NOT YET RUN):

Step 1 -- Restore portal access (urgent):
  UPDATE bookings SET service_end = '2026-10-02', updated_at = NOW() WHERE id = 18151;
  Verify: SELECT ID = 18151; -- Expect: service_end = 2026-10-02

Step 2 -- Deactivate stale BC 1982:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 1982;
  Verify: SELECT ID = 1982; -- Expect: active=false

Step 3 -- Assign return class (before Mon 24 Aug):
  SIS Admin > Students > 1001 > Booking 18151 > Courses > BC 24925
  Assign to class 11 (B1 PM) for week starting 24 Aug 2026

Risk: bookings. Reversible: yes. Blast radius: 1 student.

Status: Open -- Fix NOT RUN. Last checked: Sat 8 Aug 2026 UTC (68th hourly run)