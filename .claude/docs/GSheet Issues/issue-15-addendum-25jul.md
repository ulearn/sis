# Issue 15 -- Saikhantes Shagdarsuren (addendum Sat 25 Jul 2026 UTC, 90th hourly run)

Sheet row: 16 | Area: Booking / Class | Reporter: PG

Current DB state (Sat 25 Jul 2026 UTC -- unchanged)
- Student 1001 Saikhantes Shagdarsuren: visaStatus = null
- Booking 18151: CONFIRMED, amountPaid=EUR 1339.20 (fully paid)
- Booking course 24925: Academic Year Afternoon, Mar 9 to Oct 2 2026, active=true
- Class assignment 255: classId=11 (B1 PM), weekStart Jan 12, weekEnd Jul 3 2026 -- EXPIRED 22 days ago
- Holiday 2500: Jul 20 to Aug 21 2026 -- student currently on holiday
- Booking course 1982 (BK 1724): Academic Year Morning, Jun 30 2025 to Dec 19 2025, active=true -- STALE (data-hygiene)

Timeline
- SCA 255 expired Jul 3 -- 2 weeks missed Jul 6-17 (irrecoverable, before holiday started Jul 20)
- Holiday: Jul 20 to Aug 21
- Student returns: Mon Aug 24 2026
- Course BC 24925 ends: Oct 2 2026 -- 5+ weeks of class available after return

Fix recipe (NOT YET RUN)

Step 1 -- Create new SCA on return (do NOT run before Aug 24)
Via SIS admin: Booking 18151 -> Courses -> BC 24925 -> Class Assignment -> class 11 (B1 PM) from Aug 24.
SQL (NOT YET RUN):
  INSERT INTO "StudentClassAssignment" ("bookingCourseId","studentId","classId","weekStart","weekEnd","createdAt")
  VALUES (24925, 1001, 11, '2026-08-24', '2026-10-02', NOW());

Step 2 -- Optionally deactivate stale BC 1982 (low priority)
SQL (NOT YET RUN -- check report dependencies first):
  UPDATE "BookingCourse" SET active=false WHERE id = 1982;

Risk / category
Low. Category: bookings / data-hygiene. Reversible. No action needed until Aug 24.

Status
OPEN -- on holiday Jul 20-Aug 21. Create SCA on return Mon Aug 24.

Last checked: Sat 25 Jul 2026 UTC (90th hourly run)