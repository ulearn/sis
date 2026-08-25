Issue 15 -- Saikhantes Shagdarsuren (student 1001)
Reporter: AC | Area: booking/class | Sheet row 16

Symptom
Student has no class assignment from 24 Aug 2026 onwards.
Holiday ended 21 Aug; she returns Monday 24 Aug.
SCA 255 expired 3 Jul -- 17 days before holiday started.

Root cause
- BC 24925 (Academic Year Afternoon): startDate 2026-03-09, endDate 2026-10-02, active, booking 18151
- SCA 255: class 11 (B1 PM), weekEnd 2026-07-03 -- expired before holiday
- Holiday 2500: startDate 2026-07-20, endDate 2026-08-21 -- ended 2 days ago
- No SCA exists from 2026-08-24 onwards on any BC for this student
- Jul 4-19 (17 days): confirm with AC if attended

Fix recipe (NOT YET RUN)
URGENT -- must be applied before 9AM Monday 24 Aug 2026.

Step 1: Create SCA on BC 24925
  Class: 11 (B1 PM)
  weekStart: 2026-08-24
  weekEnd: 2026-10-02

Step 2 (optional): Ask AC if attended Jul 4-19; if yes, add SCA for that gap.
Step 3 (optional): SCA 255 weekEnd 2026-07-03 is fine as-is.

Risk / category
- Category: bookings / class assignments
- Reversible: yes
- Blast radius: student 1001 only
- Time-sensitive: student arrives Mon 24 Aug

Status: OPEN -- Fix NOT RUN
Last checked: 2026-08-23 UTC (483rd run, 481st issue check)