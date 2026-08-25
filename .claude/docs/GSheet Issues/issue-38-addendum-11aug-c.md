ISSUE 38 — Class Assignments: Eduardo + Remaining BCs

Reporter: PG | Area: Holidays, Bookings | Sheet row: 40 | Check: 117th Tue 11 Aug 2026 UTC

CRITICAL: Eduardo Roche Diaz (BC 25043, General English PM, student 14602)
end=2026-08-14 (Friday, 3 days), active=true, classAssignments=0

Still unassigned:
- BC 1313 (Ana Luiza De Sousa, student 744, AY Afternoon): classAssignments=0, ends 2026-08-28
- BC 24970 (Tsengelbayar Mendsaikhan, student 948, AY Afternoon): classAssignments=0, ends 2027-01-29

Resolved today:
- BC 25024 (Josimar Roberto): class 9 A2 PM assigned ok
- BC 25036 (Jorge Perez Aldana): class 17 B2 AM(2) assigned ok
- BC 25039 (Cristian Ravai): class 6 B2&C1 PM assigned ok

Available PM classes:
- Class 6 B2&C1 PM: 41 active students
- Class 9 A2 PM: 28 active students
- Class 11 B1 PM: 35 active students
- Class 14 C1 PM: 0 active students (verify)

FIX RECIPE (NOT YET RUN)

Step 1 — Eduardo (URGENT today):
1. Check Eduardo level (HubSpot/placement test)
2. Find correct PM class from list above
3. Assign via SIS admin (Student > Booking > Course > Assign to Class)
   OR SQL: INSERT INTO student_class_assignments (booking_course_id, class_id, created_at, updated_at)
            VALUES (25043, CLASS_ID, NOW(), NOW());
   Replace CLASS_ID with 6, 9, 11, or 14.

Step 2 — Ana Luiza (BC 1313): assign to Afternoon class via SIS admin.
Step 3 — Tsengelbayar (BC 24970): assign to Afternoon class via SIS admin.

Risk: bookings/class-assignments. Reversible: yes. Blast radius: low.
Status: Eduardo CRITICAL 3d. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC (117th check)