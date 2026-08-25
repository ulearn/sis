Issue 22 — Edith Nunes class assignment
Reporter: AC | Area: Booking/Class | Sheet row 23

Root cause (121st check Mon 27 Jul 2026 UTC):
- Student 1015 Edith Nunes, booking 18214, BC 24991 (GE AM Jul 13-Aug 7 2026)
- BC 24991: active=true, 0 class assignments - UNCHANGED
- 10 school days lost (Jul 14-25) - irrecoverable
- Recovery window: 9 school days (Jul 27-31 + Aug 4-7)
- Also stale: BC 24933+24934 (ended Jul 10, both active=true, 17d stale)
- No duplicate invoice numbers - all invoiceNo fields are null

Fix recipe (NOT YET RUN):
1. Assign BC 24991 to appropriate GE AM class via SIS admin:
   SIS admin > student 1015 > booking 18214 > course 24991 > assign class from WB Jul 27
2. Deactivate BC 24933 and BC 24934 (both ended Jul 10 2026):
   UPDATE BookingCourse SET active=false WHERE id IN (24933, 24934);

Risk: class-assignment | Reversible yes | single student
Status: OPEN - 121st check Mon 27 Jul UTC. 10d lost, 9 remain. Fix NOT RUN.
Last checked: 2026-07-27 UTC
