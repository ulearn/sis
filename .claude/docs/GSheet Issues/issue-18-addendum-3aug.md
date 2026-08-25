Issue 18 -- Flavia Nascimento Mariano (4th check Mon 3 Aug 2026 UTC)
Reporter: PG | Area: Visa | Sheet row: 19

Root Cause (fresh 3 Aug 2026 UTC -- unchanged from Sun 2 Aug):
- Student 983 (Flavia Nascimento Mariano): visa_status=null
- Booking 1534 (Academic Year Afternoon, Jun 1-Nov 20 2026): CONFIRMED, confirmed=true
- BC 1710: active=true, 2 SCAs:
  SCA 256 (class 9 A2 PM, Jun 1-Jun 14) -- past
  SCA 265 (class 11 B1 PM, Jun 15-Nov 20) -- active, student attending
- Student IS in class (B1 PM). Visa null only blocks UI class-assign flow.
- Correction to prior recipe: 2 SCAs (256+265), not 1.

Fix Recipe (NOT YET RUN):
Step 1: UPDATE students SET visa_status=Approved WHERE id=983;
        SELECT id,first_name,last_name,visa_status FROM students WHERE id=983;

Risk: data-hygiene | Reversible: yes | Blast: 1 student | Low priority (student attending)
Status: 4th check Mon 3 Aug 2026 UTC (1 day since Sun 2 Aug). Student attending B1 PM. NOT YET RUN.
Last checked: 2026-08-03 UTC