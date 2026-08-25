Issue 18 — Flavia Nascimento Mariano (visa_status null)
Reporter: N/A | Area: Visa | Sheet row: 19
Status Update: Fri 7 Aug 2026 UTC (10th check)

SYMPTOM
Visa shows as pending, student missing from to-be-assigned list. UI throws PrismaClientKnownRequestError on save.

ROOT CAUSE (verified this check)
- Student 983 (Flavia Nascimento Mariano): visa_status=null, last DB update 28 Jul 2026 (10 days ago)
- Booking 1534: CONFIRMED, confirmed=true, EUR 1,308 paid, EUR 0 open, serviceEnd=20 Nov 2026
- Booking Course 1710 (Academic Year Afternoon, 1 Jun to 20 Nov 2026): active — student attending
- visa_status is a plain string field (no Postgres enum)
- PrismaClientKnownRequestError on save: UI-layer Zod or Prisma enum validation mismatch
- Student attending class normally; visa null is data-quality only

FIX RECIPE (NOT YET RUN)

Step 1 — Set visa_status directly:
  UPDATE students SET visa_status='Approved', updated_at=NOW() WHERE id=983;

Step 2 — Verify:
  SELECT id, first_name, last_name, visa_status, updated_at FROM students WHERE id=983;

Step 3 — Investigate UI error (optional):
  Check admin route for student update — find Zod or Prisma enum validation on visa_status and widen to string.

RISK
Category: data-hygiene. Reversible: yes. Blast radius: 1 student.

STATUS
Fix NOT RUN. Last checked: Fri 7 Aug 2026 UTC (10th hourly check). Data unchanged since 9th check.
